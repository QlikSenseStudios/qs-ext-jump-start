# Selection Double-Call Guard

**Roadmap entry**: Set selectionState.lastInSelection optimistically before enterSelectionMode() to prevent pending-selection wipe.
**Depends on**: none
**Complexity**: Medium
**Execution tier**: standard

## Target Files
- src/index.js — modify — the useEffect render function's selection-entry guard

## Source Notes
`selections.begin()` (called when the user first clicks a dimension cell) triggers a layout update from the Qlik engine, arriving as a new `useEffect` render cycle. If `updateLastSelectionState` has not yet run (because the prior render was cancelled), `selectionState.lastInSelection` is still `false`. On the next render, the `!wasInSelection && inSelection` guard fires again — `enterSelectionMode` is called with an already-empty `pendingByDim`, wiping `sessionByDim` and erasing the user's pending selection clicks.

**Fix**: set `selectionState.lastInSelection = true` **optimistically, before** calling `enterSelectionMode()`:

```javascript
const wasInSelection = !!selectionState.lastInSelection;
if (!wasInSelection && inSelection) {
  selectionState.lastInSelection = true;  // guard: set before begin() triggers next render
  enterSelectionMode(selectionState);
}
```

The double-call issue is subtle and produces intermittent failures only when `begin()` triggers a fast layout update — it may not surface in basic testing but will under load or in slower environments.

## Prior Art in Repo
- src/index.js — locate the current `!wasInSelection && inSelection` guard and `updateLastSelectionState`
- src/state/ selection state management (WeakMap pattern per domains/qlik-extension.md State Management section)
- test/modules/extension-selections-qlik tests — the verification surface for this change

## Open Questions
- Confirm the template's render function matches the downstream structure closely enough for the prescribed two-line fix; if the template diverged, the principle (optimistic flag before begin-triggered re-render) still applies
- Verify selection E2E tests pass repeatedly (race is intermittent — consider a few repeated runs of the selection group)
