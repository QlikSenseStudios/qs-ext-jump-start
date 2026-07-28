# Render Cycle and Styling Principle

**Roadmap entry**: Document the two-render cycle and the static-vs-expression-driven styling principle (CSS class per-column, inline style per-row).
**Depends on**: testing-domain-split
**Complexity**: Low
**Execution tier**: light

## Target Files
- .ai-toolbox/domains/qlik-extension-testing.md — modify — new section covering the two-render cycle and its test-wait implications, plus the styling principle

## Source Notes

**Two-render cycle** (canonical home — the attribute-expression pattern cross-references this): after `setObjectProperties` adds an attribute expression, the Qlik engine emits TWO layout updates. The first increments `data-render-count` but has `qAttrExprInfo = []`. The second populates `qAttrExprInfo` + `qAttrExps`. Test helpers that wait only for render count > N exit on the first (empty) update — additionally wait for a styled cell to exist (e.g., `page.locator('td.dim-cell[style]').first().waitFor({ state: 'attached' })`). Applies to both dimensions and measures.

**Static vs expression-driven property rendering**: prefer CSS classes for static, structural properties (alignment, sizing, fixed variants); use inline `style` only for expression-driven, per-row values (colors, per-cell padding from an expression result). Rule of thumb: changes per column but not per row → structural → CSS class; changes per row (data expression) → dynamic → inline style.

**Why it matters for tests**: helpers use `td.dim-cell[style]` as the second-render indicator. Writing a static property like `text-align` into `style` makes that selector match on the first (structural) render, before expressions populate — defeating the two-render wait.

**CSS specificity trap**: a blanket reset like `.data-table th { text-align: left }` at specificity (0,1,1) silently overrides a utility class like `.ta-center` at (0,1,0). If alignment uses CSS classes, do NOT add any element-level `text-align` default on `th`/`td` — every cell receives an alignment class; the class IS the default.

```css
.ta-left   { text-align: left; }
.ta-center { text-align: center; }
.ta-right  { text-align: right; }
```

```javascript
const className = `dim-cell ta-${align}`;          // static → class
if (bgColor) { styleParts.push(`background-color: ${bgColor}`); }  // expression → style
```

## Prior Art in Repo
- The template scaffold's current styling in src/components and styles — verify which properties it writes to `style` today before stating the principle as followed
- plans/attribute-expression-styling-pattern.md — will cross-reference this section instead of duplicating the two-render explanation (DRY)

## Open Questions
- Does the template's current table renderer violate the principle anywhere (static props in style)? If so this item gains a small code change or a follow-up
