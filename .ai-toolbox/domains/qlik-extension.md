# Qlik Sense Extension Domain Context

Context for developing Qlik Sense extensions using the Nebula.js Supernova API. Load when working on extension source code, property panel configuration, or test infrastructure.

## Learning Protocol — Undocumented Environment Behavior

This domain file is the **authoritative record of what is known** about the Nebula Hub and Qlik environment. The environment is complex and not well-documented externally.

**Rule**: If a required interaction — selector, timing, API behavior, DOM structure, Qlik Engine behavior — is not documented in this file, do not guess. Stop and ask the developer. Validate the real behavior. Then document it here before proceeding.

The correct sequence: **consult this file → if undocumented, ask → validate → act → capture**.

Attempting, failing, and then capturing is not acceptable — the wrong conclusion may be captured. The Nebula Hub DOM Patterns section below is the single source of truth for verified selectors and interactions.

## Technology Stack
- **Framework**: Nebula.js Supernova API (`@nebula.js/stardust ^6.0.1`)
- **Build**: Nebula CLI (`nebula build`, `nebula serve`, `nebula sense`)
- **Testing**: Playwright E2E (`@playwright/test`)
- **Language**: JavaScript ESM (`src/`) with CommonJS in `test/` — migration in progress
- **Linting**: ESLint v9 flat config (`eslint.config.mjs`)
- **Node.js**: `>=20.17`

## Nebula.js Supernova Hooks
*Primary API for extension lifecycle — imported from `@nebula.js/stardust`*

- `useElement()` — returns the root DOM element assigned to this extension instance
- `useLayout()` — returns the current layout object from Qlik Engine (data + property values)
- `useEffect(fn, deps)` — lifecycle hook; runs `fn` when `deps` change; return a cleanup function if needed
- `useSelections()` — provides access to the Qlik selection API for this extension instance

## Safe DOM Patterns
*Always prefer these; innerHTML is a last resort*

- Use `createElement()` and `textContent` for all DOM construction
- Use `DocumentFragment` for batched multi-node insertions
- `innerHTML` only with explicitly sanitized or compiled-static strings — justify in a comment
- **Stable container**: the element returned by `useElement()` persists across renders — never replace it; clear its children: `while (el.firstChild) el.removeChild(el.firstChild)`

## State Management (WeakMap Pattern)
*Per-element state isolation; memory-safe across renders*

```javascript
const dataState = new WeakMap();    // keyed by DOM element
const renderState = new WeakMap();
const selectionState = new WeakMap();
```

- State is isolated per element instance — no globals, no module-level state
- WeakMap ensures DOM element garbage collection cleans up state automatically
- Three state modules: `src/state/data-state.js`, `render-state.js`, `selection-state.js`

## Project Architecture

```
src/
├── index.js              # Supernova entrypoint — hooks + render lifecycle
├── ext.js                # Property panel accordion definition
├── utils.js              # DOM helpers + debug utilities (isDebugEnabled, debugLog)
├── styles.css            # Extension CSS
├── meta.json             # Packaging metadata (name, icon, preview)
├── components/           # UI components: error, header, no-data, selection-handler, table
├── templates/            # Template system: base, state, table
├── state/                # WeakMap state modules: data-state, render-state, selection-state
└── qae/
    ├── object-properties.js  # Extension property defaults; version/subtitle from package.json
    └── data.js               # qHyperCubeDef data targets (dimensions, measures, fetch config)
```

## Property Panel (QAE)
- `src/qae/object-properties.js` — default property values; do not put panel structure here
- `src/ext.js` — property panel accordion structure; debug section is conditionally included via `isDebugEnabled()`
- `src/qae/data.js` — data binding: dimensions, measures, `qInitialDataFetch`, suppression flags

## Debug System

```javascript
import { isDebugEnabled, debugLog } from './utils';

if (isDebugEnabled(layout)) { /* dev-only code */ }
debugLog('label', data); // no-op in production
```

- `isDebugEnabled(layout?)` — true when: URL has `?debug=true`, extension has `props.debug.enabled: true`, or on localhost
- `debugLog()` is always safe to call — it is a no-op unless debug mode is active
- Debug section in property panel is only injected when `isDebugEnabled()` returns true at panel definition time

## Selection Mode
- Treat selection mode as a modifier class: `.extension-container.in-selection`
- Keep container role and label stable across modes: `role="main"`, `aria-label="Qlik Sense Extension Content"`
- Selection API via `useSelections()` — session-based; state tracked per element in `selection-state.js`

## Test Environment
*All Playwright tests require a live Qlik environment — they are environment-gated*

```
test/
├── qs-ext.e2e.js          # Main test orchestrator (imports all modules)
├── qs-ext.connect.js      # Auth and connection utilities (.env driven)
├── lib/
│   ├── core/              # identifiers.js, configuration-identifiers.js, constants.js
│   ├── utilities/         # dom.js, json-editor.js, configuration-defaults.js, props-structure-analyzer.js, dom-snapshot.js
│   └── page-objects/      # nebula-hub.js — Page Object Model for Nebula Hub UI
└── modules/
    ├── connection.test.js              # Validates Nebula Hub URL + version (user intervention required on failure)
    ├── hub-ready.test.js               # Validates Nebula Hub controls + extension loaded (user intervention required on failure)
    ├── extension-unconfigured.test.js  # Extension unconfigured state — incomplete visualization, data panel controls, caption/props defaults, JSON structure via properties dialog
    └── extension-configured.test.js   # Extension configured state — three tests: (1) dimension only: UI transitions + JSON qDimensions assertion; (2) measure only: incomplete state persists + JSON qMeasures assertion; (3) dimension + measure: complete state persists + JSON qDimensions and qMeasures assertions
```

**Environment setup**: See `docs/QLIK_CLOUD_SETUP.md` or `docs/QLIK_ENTERPRISE_SETUP.md`

**Test module responsibilities**: `connection.test.js` and `hub-ready.test.js` are infrastructure tests — failure means the environment is misconfigured and requires user intervention; the agent cannot fix these. `extension-unconfigured.test.js`, `extension-configured.test.js`, and any subsequent extension modules are code tests — failure indicates an extension bug or selector drift the agent can investigate and fix.

## Test Browser Session Model

Each test gets a **fresh page (tab)** within a shared authenticated browser context. The context is created once in `beforeAll` via `getQlikServerAuthenticatedContext()` — this is the Qlik tenant login. Each `beforeEach` opens a new page and navigates to the Nebula Hub URL; each `afterEach` closes the page. Credentials are not re-entered between tests.

**Implication for page load timing**: `waitUntil: 'domcontentloaded'` fires before Nebula Hub has connected to the Qlik engine. The data panel (dimensions, measures) and the Modify Properties button render asynchronously after engine connection. Always use `TIMEOUTS.NETWORK` (10s) when waiting for hub UI elements at test start — `TIMEOUTS.STANDARD` (5s) is too short on a fresh page load. This applies to `beforeEach` hooks as well as test bodies — a `beforeEach` that opens the properties dialog must first gate on the Add Dimension button being visible, otherwise it fires before the hub has rendered.

**Data panel constraint re-evaluation**: After an interaction causes the extension to re-render (e.g. adding a dimension that satisfies `min` and triggers a full render), the Nebula Hub data panel re-evaluates button states asynchronously. An Add Dimension or Add Measure button that was disabled in a prior step may not become enabled until the panel has caught up with the new render state. Use `TIMEOUTS.NETWORK` when asserting `toBeEnabled()` on these buttons after a render transition — `TIMEOUTS.STANDARD` is not enough.

**Implication for selector scope**: All test interactions happen within the Nebula Hub tab. The Qlik app's own UI (app overview, sheets panel) can appear in error-context screenshots if a click navigates away from Nebula Hub — treat this as a selector or interaction bug, not an environment bug.

## Test App Broken State

Nebula Hub occasionally fails to open the Qlik app and shows a modal dialog: `dialog:has-text("An error occurred")` with body text "Some parameters are empty." When this happens, every test in the suite will fail with element-not-found errors — none of those failures are code bugs.

**Cause**: The underlying Qlik app has lost its data connection or entered an invalid state. This is unrelated to `.env` configuration, authentication tokens, or extension code.

**Detection**: `connection.test.js` races `div[data-nebulajs-version]` (successful init) against `dialog:has-text("An error occurred")` (app failure). If the dialog wins, the test fails immediately with a message directing the developer to intervene — rather than timing out and letting every downstream test also time out with misleading errors.

**Fix** (requires Qlik tenant admin access): log into the Qlik tenant, open the test app, and re-run the load data script. Then re-run the tests.

**Do not** investigate test selectors or extension code when this dialog is present in the error-context snapshot — the environment is broken, not the code.

**Broken-app signature in configured-state tests**: When the app is broken, a `beforeEach` that opens the properties dialog will time out waiting for the Modify Properties button (element not found, NETWORK timeout), and teardown will report "Configuration reset: ⚠️ Skipped (already empty or unavailable)". The test itself will show a 1+ minute elapsed time. This is the same broken-app condition as the modal dialog — not a code or selector bug. Fix by reloading the app data before re-running.

## Test Commands

```bash
npm test                                              # Run all tests
SKIP_OPEN_REPORT=1 npx playwright test --reporter=list                    # All tests, terminal output only
SKIP_OPEN_REPORT=1 npx playwright test --grep "test name" --reporter=list # Target by test/describe name
SKIP_OPEN_REPORT=1 npx playwright test --headed --reporter=list           # Headed mode for visual inspection
```

`SKIP_OPEN_REPORT=1` suppresses the automatic browser report on failure. `--grep` matches against test and describe block names.

## Nebula Hub DOM Patterns
*Verified against `@nebula.js/cli-serve` 6.8.0. Re-verify after version bumps.*

**Properties dialog**: `MuiDialog-root` carries `role="presentation"` — the actual dialog element is the child `div[role="dialog"].MuiDialog-paper`. Waiting on `.MuiDialog-root [role="dialog"]` will not resolve.

**MUI Accordion button**: The `MuiAccordionSummary-content` span is a direct child of a `<button class="MuiAccordionSummary-root">` tag. There is no `role="button"` ancestor — use `xpath=./parent::button` to reach the clickable element, not `xpath=./ancestor::*[@role="button"]`.

**Monaco editor — read**: `window.monaco` is not exposed in Nebula Hub. Read content by collecting all `.view-line` element text after expanding the editor container to force Monaco to render all lines (Monaco virtualizes rows — only visible lines exist in the DOM). Rendered text uses non-breaking spaces (U+00A0) for indentation — sanitize with `/[^\x20-\x7E\n]/g` before passing to `JSON.parse`.

**Monaco editor — write**: The `.monaco-editor textarea` is read-only by design. Write via clipboard paste — `page.keyboard.type()` triggers Monaco's bracket-matching autocomplete (typing `{` inserts `{}`, so `{}` becomes `{}}` and the JSON becomes invalid). Instead: click `.monaco-editor .view-lines` to focus, `Control+a` to select all, write content to the clipboard via `page.evaluate(() => navigator.clipboard.writeText(content))`, then `Control+v` to paste. Requires `permissions: ['clipboard-read', 'clipboard-write']` on the browser context — clipboard API is blocked by default in headless Chromium. **Critical**: these permissions must be passed directly to `browser.newContext()` — declaring them in `playwright.config.js` under `projects[].use.permissions` is not sufficient when the context is created manually. If the context is created without permissions, `navigator.clipboard.writeText()` fails silently: `Control+a` clears the editor, the paste does nothing, and the prior JSON remains — but the operation appears to succeed because no error is thrown.

**Confirming `{}` clears Nebula Hub entirely**: When `{}` is confirmed in the properties dialog, Nebula Hub empties `<div id="app">` and requires a page reload to reinitialize. This is the correct reset behavior — `resetConfiguration()` relies on the subsequent page close and fresh page open in `afterEach`/`beforeEach` to complete the reset cycle. After `div#app` empties, the Qlik engine write that removes the `qHyperCubeDef` state is still in flight — a 2 second wait after the div empties is required before closing the page, otherwise the next test's fresh page load may reconnect to the engine before the write completes and receive the stale state. Once `div#app` is empty the entire Nebula Hub UI is gone — the Monaco editor, properties button, and all other elements are destroyed; no further DOM interaction is possible on this page.

**Engine async write race (intermittent bleed-through)**: Even with the 2 second settle wait, the Qlik engine write occasionally does not complete before the next test's fresh page connects — the next page loads and receives stale `qHyperCubeDef` state. This is a known intermittent environment issue, not a test code failure. Mitigation: (1) uncheck "Enable property cache" in `beforeEach` — if checked, Nebula Hub serves cached properties on page load and amplifies the bleed; (2) the `beforeEach` JSON check catches this case and surfaces it with a message directing re-run rather than investigation. If this failure occurs consistently across multiple re-runs, investigate `resetConfiguration()` and increase the engine settle wait in `nebula-hub.js`.

**Extension name aria-label ambiguity**: Nebula Hub renders both the extension container `div` and a title `h6` with `aria-label` equal to the extension name. An unscoped `[aria-label="name"]` selector triggers Playwright strict mode violations — always scope to the element type: `div[aria-label="name"]`.

**Field picker — dimensions**: Clicking "Add dimension" opens an inline field picker. The picker renders a search input (`[placeholder*="Search"]`) and a sibling `nav` element containing one `button` per available field. The nav renders asynchronously after the search input fills — wait for `nav` to be visible before querying field buttons. Use `page.getByRole('button', { name: 'FieldName', exact: true })` to select a field. Selecting a field completes the dimension — one interaction only. After selecting a field that reaches the `max` constraint defined in `data.js`, the Add Dimension button becomes disabled — assert this to confirm the constraint is enforced.

**Field picker — measures (two-step)**: Clicking "Add measure" opens the same picker UI, but selecting a field does **not** complete the measure. After clicking the field button (e.g. `Expression1`), the `nav` contents are replaced with a list of aggregation options for that field (e.g. `sum(Expression1)`, `count(Expression1)`, etc.). A second `getByRole('button', { name: 'sum(Expression1)', exact: true })` click is required to complete the measure selection. The nav replacement is asynchronous — use `TIMEOUTS.NETWORK` (not `TIMEOUTS.STANDARD`) when waiting for the aggregation button, as the replacement can be slow after a full extension render cycle. After the aggregation is selected, the Add Measure button becomes disabled when the `max` constraint is reached; assert this with `TIMEOUTS.NETWORK` for the same reason.

**Measure JSON shape**: When `sum(Expression1)` is selected via the field picker, the resulting JSON measure entry uses bracket-wrapped field names: `qHyperCubeDef.qMeasures[0].qDef.qDef === 'sum([Expression1])'`.

**DOM snapshot utility**: `test/lib/utilities/dom-snapshot.js` provides `logAriaSnapshot(page, label)` for printing the ARIA tree to the console during headed test development, and `saveAriaSnapshot(page, label)` for writing snapshot files to `test/snapshots/` as drift detection baselines. Playwright's `ariaSnapshot()` with `interestingOnly: true` (the default) omits elements with no accessible role — use `interestingOnly: false` to see the full tree when debugging missing elements.

## Test Teardown — Why resetConfiguration() Matters

`hub.resetConfiguration()` in `afterEach` writes `{}` to the Monaco editor and confirms. This is not cosmetic cleanup — Nebula Hub caches the extension's property object in memory for the session. Without this reset, configured values (dimensions, measures, custom props) survive page reload within the same browser context and bleed into the next test. Tests that look isolated can fail or produce wrong results when run in sequence. Any test that configures the extension (adds dimensions/measures, changes props values) **must** have teardown that calls `resetConfiguration()` — or the suite is order-dependent.

## Test Utilities — Single Source of Truth

Test utilities that validate extension defaults must import directly from the source files:

```javascript
import objectProperties from '../../../src/qae/object-properties.js';
import dataConfig from '../../../src/qae/data.js';
```

`src/qae/object-properties.js` imports `package.json` with `with { type: 'json' }` — required for Node's native ESM loader (Nebula's webpack build does not need this assertion, but the Playwright test runner does). Do not create mirror/hardcoded copies of these values in test utilities — changes to source files must immediately surface as test failures.

## Playwright Robustness Patterns
- Re-query locators after interactions — do not cache handles across actions (avoids stale element errors)
- Prefer keyboard-first interactions (Enter/Space); use bottom-most list items to avoid overlay interference
- Add small waits after modal confirmations in headed mode for visibility stability
- Use `hub.page.locator()` for all selectors — never scope off a cached ancestor locator across async boundaries (stale element errors)
- **Infrastructure test failure messages**: pass a user-facing message as the second argument to `expect()` — `await expect(locator, 'message explaining cause and action').toBeVisible()` — this surfaces directly in the Playwright failure output without requiring try/catch; use this pattern in `connection.test.js` and `hub-ready.test.js` where failures require developer action, not code fixes
- **Console output at every step**: every significant action in a test must emit a `console.log` line confirming success — not just pass/fail states. This output is the primary troubleshooting signal when a later step fails: missing output tells you exactly which step did not complete, which narrows the failure to a specific interaction rather than requiring artifact inspection. If a step has no console output and the test fails downstream, the root cause is ambiguous.

## Test Debugging Protocol

**The Qlik test environment is fragile.** The Nebula Hub, Qlik engine connection, and test app state can fail in ways that produce misleading test output — timeouts, element-not-found errors, and selector failures that look like code bugs but are environment failures. Constant evaluation with the developer is required to avoid following red herrings. When in doubt, stop and ask before investigating further.

When a test fails, follow this sequence before drawing conclusions or making changes:

1. **Run the failing test in isolation** (`--grep "test name"`) — eliminates ordering effects and confirms whether the failure is in the test itself or depends on prior test state
2. **Run the failing test in headed mode** (`--headed`) in isolation — visual confirmation of what actually happens vs. what the selectors report
3. **If isolation passes but sequence fails**: the issue is inter-test state; check `resetConfiguration()` effectiveness and property cache behavior
4. **If headed and headless differ**: timing is the likely cause; add `TIMEOUTS.NETWORK` to the step that behaves differently, or add an explicit wait before the affected assertion
5. **Check console output completeness**: every step should have logged success before the failure line — missing output identifies exactly which interaction did not complete
6. **If the cause is still unclear after steps 1–5**: stop and ask the developer — do not guess at the root cause or make speculative fixes; describe what you observed at each step and ask for clarification
7. **After identifying the cause**: document any new Nebula Hub behavior discovered in the appropriate section of this file before writing the fix

**Headed vs. headless differences are real**: the developer may see different test results than headless CI. When this is reported, treat the headed observation as authoritative for understanding what the UI is doing — headless artifacts (screenshots, error-context) may reflect a different failure mode caused by timing differences in the absence of a real browser rendering pipeline.

**Artifacts can mislead**: error screenshots and ARIA snapshots are taken at the moment of failure, which may reflect teardown state, a prior test's residual UI, or a broken-app condition — not the actual failure cause. Never draw conclusions from artifacts alone without first isolating the test and confirming with the developer what was observed in the headed run.

## Build and Package

```bash
npm run lint     # ESLint — must pass before committing
npm run build    # Nebula CLI build → dist/ (gitignored)
npm run serve    # Dev server → http://localhost:8077 (auto-starts for tests)
npm run package  # Package extension → qs-ext-jump-start-ext/ (gitignored, generated artifact)
npm test         # Playwright E2E (requires .env + live Qlik)
```

## Module System

- `src/` — ESM (`import`/`export`)
- `test/` — ESM (`import`/`export`)
- `package.json` — `"type": "module"` (all `.js` files are ESM)

## OSS Reference Patterns
When generating new extension code, prefer patterns from Qlik's first-party `sn-*` repositories on GitHub (`github.com/qlik-oss`) as the authoritative reference for idiomatic Nebula.js usage.

## Extension Deployment
1. `npm run package` — generates `qs-ext-jump-start-ext/` (gitignored; versioned by `package.json` only)
2. Zip the `-ext/` folder
3. Upload via QMC (Enterprise) or Tenant Admin (Cloud)

See `docs/DEPLOYMENT.md` for full instructions.

## Known Environment Unknowns
*Areas not yet investigated or verified. Do not guess — ask the developer before attempting.*

- **Selection mode Nebula Hub DOM**: The selectors, timing, and state transitions for entering, confirming, and cancelling a selection session in Nebula Hub have not been tested or documented. Do not assume they follow the same patterns as data panel interactions.
- **Nebula Hub version drift**: DOM patterns documented in this file were verified against `@nebula.js/cli-serve` 6.8.0. Behavior after version bumps is unverified — re-verify after any Nebula CLI upgrade.
- **Qlik Engine API surface**: Only `useSelections()` is documented for this project. Other engine API hooks (bookmark, variable, data fetch behaviors) are not verified in this environment.
- **Multi-extension Nebula Hub sessions**: All documented patterns assume a single extension loaded in Nebula Hub. Behavior with multiple extensions is unknown.

*When an unknown is investigated and verified, move it to the appropriate documented section above and remove it from this list.*

---
*Load this domain when working on extension source, test infrastructure, or property panel configuration.*
*Combine with `project/standards.md` for complete development standards.*
