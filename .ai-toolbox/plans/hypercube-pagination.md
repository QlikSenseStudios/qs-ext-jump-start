# Hypercube Pagination

**Roadmap entry**: Add a fetchAllDataPages utility to the scaffold with INITIAL_FETCH_HEIGHT calculation, async-IIFE cancellation integration, and a domain doc section.
**Depends on**: none (ordered before schema-normalization-getproperties, which anchors to it)
**Complexity**: High
**Execution tier**: deep

## Target Files
- src/state/data-state.js (or a dedicated data-fetch module) — create/modify — `fetchAllDataPages(layout, model)` utility
- src/qae/data.js or object-properties.js — modify — `INITIAL_FETCH_HEIGHT = Math.floor(9999 / (DIM_MAX + MEAS_MAX))` replaces any hardcoded qInitialDataFetch height
- src/index.js — modify — useEffect render integrates the async fetch with a cancellation flag
- .ai-toolbox/domains/qlik-extension.md — modify — new pagination section under the engine model documentation

## Source Notes
All Nebula.js extensions rendering tabular data hit Qlik's strict `qWidth * qHeight < 10,000` cell limit beyond a moderate row count. `qInitialDataFetch` only delivers the first page; showing all rows requires fetching additional pages via the model API.

```javascript
// 1. Check whether more rows exist
const initialMatrix = layout.qHyperCube.qDataPages[0]?.qMatrix ?? [];
const totalRows = layout.qHyperCube.qSize.qcy;
if (!model || initialMatrix.length >= totalRows) return initialMatrix;

// 2. Page size — 9999, not 10000: the constraint is strict less-than
const totalCols = dimCount + measCount;
const pageSize = Math.floor(9999 / totalCols);

// 3. Build all remaining page requests
const pageRequests = [];
for (let top = initialMatrix.length; top < totalRows; top += pageSize) {
  pageRequests.push({ qLeft: 0, qTop: top, qWidth: totalCols,
                      qHeight: Math.min(pageSize, totalRows - top) });
}

// 4. Batch all requests in ONE getHyperCubeData call — no sequential awaits
const additionalPages = await model.getHyperCubeData('/qHyperCubeDef', pageRequests);
return [...initialMatrix, ...additionalPages.flatMap(p => p.qMatrix)];
```

Key rules:
- `model` comes from `useModel()`; may be `undefined` on first render — guard before use
- `Math.floor(9999 / totalCols)` not 10000: for totalCols = 1, 1 × 10000 = 10000 violates strict less-than
- `INITIAL_FETCH_HEIGHT = Math.floor(9999 / (DIM_MAX + MEAS_MAX))` keeps the initial fetch consistent with page size

Integration — async IIFE with cancellation in useEffect:
```javascript
useEffect(() => {
  let cancelled = false;
  async function render() {
    // ... sync validation guards ...
    const allRows = await fetchAllDataPages(layout, model);
    if (cancelled) { return; }
    // ... render with allRows ...
  }
  render();
  return () => { cancelled = true; };
}, [layout]);
```

## Prior Art in Repo
- src/ has NO fetchAllDataPages today; the render path consumes `qDataPages[0]` directly
- src/index.js useEffect — the current render function structure determines how invasive the cancellation-flag integration is
- plans/limits-single-source.md — exports DIM_MAX/MEAS_MAX constants this item's INITIAL_FETCH_HEIGHT calculation should consume
- plans/selection-double-call-guard.md — also edits the same useEffect; land this item first (the guard's context references the cancellation early-return)

## Open Questions
- Test strategy: exercising pagination in E2E requires a dataset over the initial page size — consider the test-time config injection pattern (plans/test-time-config-injection.md) to lower limits instead
- Where the utility lives: data-state.js vs a new module — follow the scaffold's existing module boundaries
