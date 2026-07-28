# Schema Normalization and getProperties()

**Roadmap entry**: Document engine schema normalization of qHyperCubeDef entries and the model.getProperties() read pattern.
**Depends on**: hypercube-pagination (the integration pattern anchors to the fetchAllDataPages call)
**Complexity**: Medium
**Execution tier**: standard

## Target Files
- .ai-toolbox/domains/qlik-extension.md — modify — engine model documentation gains the normalization behavior; the pagination section gains the getProperties() integration pattern

## Source Notes
The Qlik engine schema-normalizes **both** `qDef` and the outer `NxDimension`/`NxMeasure` entry. Unknown properties are stripped from `getLayout()`/`useLayout()` at both levels.

**NOT preserved in useLayout()**: custom fields inside `qDef` (NxInlineDimensionDef schema strips them); custom top-level sibling fields on the dimension/measure entry (e.g., a `colAlign` property alongside `qDef` — the NxDimension schema strips those too). **Common mistake**: assuming "top-level sibling outside qDef" survives. It does not.

**Preserved**: schema-known NxDimension fields (`qDef`, `qNullSuppression`, `qAttributeExpressions`, `qSortCriterias`, ...); top-level extension-owned properties outside qHyperCubeDef (`props.*` — not normalized); qHyperCubeDef scalars (`qMode`, `qInitialDataFetch`, ...).

**To read per-column static properties at render time**: `model.getProperties()` returns the unprocessed property tree — custom fields survive unchanged.

Integration after the async data fetch in the useEffect render function:
```javascript
const allRows = await fetchAllDataPages(layout, model);
if (cancelled) { return; }
// model may be undefined on first render; getProperties() is async — re-check cancellation
const rawProps = model ? await model.getProperties() : null;
if (cancelled) { return; }
const processedData = processLayoutData(layout, allRows, rawProps);
```

Design processing functions to accept `rawProperties` as an **optional parameter** (default `null`), with `const source = rawProperties || layout;` — this keeps the synchronous early-exit validation pass (called before the async fetch) working without modification.

## Prior Art in Repo
- Pagination section created by plans/hypercube-pagination.md — this pattern is documented as "the next async call projects typically need after pagination"
- src/state/data-state.js processLayoutData/validation split — confirm the optional-parameter design fits the template's actual signatures

## Open Questions
- Documentation-only, or also thread the optional rawProperties parameter through the scaffold's processing functions as prep? The template itself has no custom per-column property yet — doc-only is likely correct, with the parameter design shown as a snippet
