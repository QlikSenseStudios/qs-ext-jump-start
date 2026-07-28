# Attribute Expression Styling Pattern

**Roadmap entry**: Create patterns/attribute-expression-styling.md consolidating the qAttributeExpressions per-cell styling pattern.
**Depends on**: render-cycle-and-styling-principle (two-render cycle documented there; cross-reference, don't duplicate); nebula-hub-vs-production (absent-components list lives there)
**Complexity**: High
**Execution tier**: deep

## Target Files
- .ai-toolbox/patterns/attribute-expression-styling.md — create — the consolidated pattern
- .ai-toolbox/domains/qlik-extension.md — modify — one-line pointer to the pattern's one-AER-per-ref rule (full rule lives in the pattern; DRY)
- .ai-toolbox/patterns/README.md + context.global.md Available Contexts — modify — register the new pattern

## Source Notes
Consolidates three overlapping findings sections (Splitting Attribute Expressions by Semantic Group; One AER Per ref — Mandatory Rule; Per-Cell Attribute Expression Styling). The pattern is how native Qlik tables wire per-cell styling expressions; correct for any extension needing per-row, per-column styling driven by user-configured expressions.

**Core structure** (four files):
- `src/qae/attr-expression-defs.js` — canonical arrays `HEADER_ATTR_EXPRESSIONS`, `CELL_ATTR_EXPRESSIONS`, feature-specific arrays (e.g., `INDENT_ATTR_EXPRESSIONS`, dimension-only), each entry `{ id, label }`; PERMANENT append-only index maps `DIM_EXPR_INDICES` / `MEAS_EXPR_INDICES` (changing an index breaks existing user configurations)
- `src/qae/data.js` — `makeItem(id, label, idx)` factory: `component: 'expression'`, `ref: qAttributeExpressions.${idx}.qExpression`, plus a `change(data)` callback that pads the array and stamps `data.qAttributeExpressions[idx].id = id` (the id is NOT written automatically; without the callback, `findIndex(e => e.id === id)` always returns -1). Named group exports (`dimHeaderExprItems`, `dimCellExprItems`, `measHeaderExprItems`, `measCellExprItems`, `indentExprItem`); PRIVATE AER wrappers (`dimAttrExpressions`, `measAttrExpressions`) used only in data targets, never exported
- `src/ext.js` — spreads the named groups; all show conditions added here; panel order = key order in the items object
- `src/state/data-state.js` — index resolution via `qAttrExprInfo.findIndex(e => e.id === id)` per dimension/measure (never assume fixed position; -1 when unconfigured); keyed-object extraction iterating all defs arrays at once so new attributes are included automatically

**MANDATORY one-AER-per-ref rule** (prominent warning): two or more `attribute-expression-reference` components sharing `ref: 'qAttributeExpressions'` on a dimension/measure silently destroy data in production — each component overwrites the entire array with only its own items on save, wiping the other's expressions. Does NOT fail visibly in Nebula Hub (AER is a no-op there); the conflict only surfaces in production. All attribute expressions for a column type must be in a single AER; dimensions needing extra items get their own wrapper (`dimAttrExpressions`) rather than sharing with measures. No `show` conditions on items inside the AER — apply them in ext.js.

**Measure-only group variant**: separate defs array; entries in `MEAS_EXPR_INDICES` only (dim indexes all -1 by design, handled by the -1 guard); included only in the meas AER wrapper; named group export spread into the measures panel only.

**Data access**: per cell `qMatrix[row][col].qAttrExps.qValues[index].qText`; engine evaluates automatically once configured — no qInitialDataFetch change.

**Dimension/measure-level vs row-level attributes**: qAttributeExpressions always evaluate once per data row. Row-level (value varies per data point) → extract per row. Dimension/measure-level (semantically bound to the column: series color, header color) → engine still evaluates N times; extract from `dataMatrix[0]` as the single authoritative value. There is no "evaluate once per dimension" mode; no verified alternative from sn-* repos.

**Naming**: attribute ids `cell<PascalCase>` / `header<PascalCase>` matching the sn-table OSS pattern. **Translation keys**: `translation:` values are Qlik Enterprise i18n keys; Nebula Hub shows the raw key — use plain `label:` strings unless a translation system exists.

**Testing**: two-render cycle applies (see the testing domain section from plans/render-cycle-and-styling-principle.md — cross-reference, do not duplicate). Tests and JSON-editor configuration must set the `id` fields explicitly in qAttributeExpressions entries.

## Prior Art in Repo
- patterns/setup.md + docs/Patterns.md — structure conventions for pattern files; register in patterns/README.md
- Patterns are meant to be domain-agnostic per docs/Patterns.md — this pattern is Qlik-specific; either relax that guidance or note the exception (the Patterns guide says domain-specific belongs in domains/ — decide placement consciously; the findings explicitly recommend patterns/)
- plans/nebula-hub-vs-production.md — absent-components list; reference it rather than restating

## Open Questions
- Resolve the patterns-are-domain-agnostic tension: put the file in patterns/ and update docs/Patterns.md wording, or place it in domains/ — the findings recommend patterns/attribute-expression-styling.md
- Whether to include a minimal working example in the template's example table (making the pattern executable) or keep it documentation-only — d3-color utils are a separate item (plans/color-normalization-utils.md)
