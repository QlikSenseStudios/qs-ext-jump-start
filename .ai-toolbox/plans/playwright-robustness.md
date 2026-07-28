# Playwright Robustness Patterns

**Roadmap entry**: Document null-safe style assertions, the multi-click selection race guard (plus test scaffold change), the MEAS_MIN=0 measure-add signal, and DUAL-field assertion guidance.
**Depends on**: testing-domain-split
**Complexity**: Medium
**Execution tier**: standard

## Target Files
- .ai-toolbox/domains/qlik-extension-testing.md — modify — Playwright Robustness Patterns section gains four entries
- test/modules (selection tests) — modify — add the render-count guard to any scaffold test that clicks more than one cell before Confirm

## Source Notes

**Null-safe style assertions**: `element.getAttribute('style')` returns `null` when no inline style attribute exists; `.not.toContain()` throws "Matcher error: received value must not be null nor undefined". Any negative style assertion must null-coalesce: `expect(style ?? '').not.toContain('background-color')`. Positive assertions fail readably on null and don't need the guard.

**Multi-click selection race (render-count guard)**: clicking a second cell during a selection session sets `.local-selected` synchronously but `select()` resolves asynchronously. If `confirm()` fires before the in-flight `select()` resolves, the stray `select()` may re-enter selection mode after the session closes, leaving `.in-selection` on the container. Fix: capture `data-render-count` on `.njs-viz[data-render-count]` **before** the second click, then wait for the count to exceed that value before clicking Confirm:

```javascript
// CRITICAL: capture BEFORE the click — capturing after can deadlock
const before = Number(await hub.page.locator(IDENTIFIERS.COMPLETE_VISUALIZATION).getAttribute('data-render-count') || '0');
await cellC.click();
await expect(cellC).toHaveClass(/local-selected/, { timeout: TIMEOUTS.STANDARD });
await hub.page.waitForFunction(
  ({ selector, minCount }) => {
    const el = document.querySelector(selector);
    return el && Number(el.getAttribute('data-render-count') || '0') > minCount;
  },
  { selector: IDENTIFIERS.COMPLETE_VISUALIZATION, minCount: before },
  { timeout: TIMEOUTS.NETWORK }
);
```

**Measure-add signal when MEAS_MIN = 0**: `.extension-container` is visible before any measure is added — a false-positive "measure added" signal. Wait for `th.meas-header` instead; it exists only after the measure is in the engine AND a render including a measure column completed. (Cross-noted with plans/extension-container-identifier.md.)

**DUAL field assertions** (split from the engine-model findings): a `DUAL(text, numeric)` label appearing across multiple rows produces distinct `qElemNumber`s with identical `aria-label`s — `getByLabel(..., { exact: true })` resolves to multiple elements, causing strict mode violations. Use `toHaveCount(0, { timeout: TIMEOUTS.NETWORK })` instead of `toBeHidden()` to assert all instances gone; use `.first().toBeVisible()` for at-least-one-visible. Post-confirm assertions don't need `.first()` — only one instance survives the engine filter.

## Prior Art in Repo
- domains/qlik-extension.md Playwright Robustness Patterns — existing section these entries extend (moves with the split)
- test/lib TIMEOUTS + IDENTIFIERS constants — snippets must use them (Test Utilities — Single Source of Truth)
- Template limits are currently 1 dim / 0-1 meas, so MEAS_MIN = 0 applies to the scaffold as shipped

## Open Questions
- Which scaffold selection tests actually perform a multi-click-before-confirm sequence today — the guard belongs only where the race exists
