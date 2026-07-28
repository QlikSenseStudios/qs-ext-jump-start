# Limits Single Source of Truth

**Roadmap entry**: Derive validation predicates and user-facing limit strings from limits defined in data.js.
**Depends on**: none
**Complexity**: Medium
**Execution tier**: standard

## Target Files
- src/qae/data.js — modify — export the dimension/measure min/max limits as named constants
- src/state/data-state.js — modify — `validateConfiguration` hardcodes `dimCount === 1 && measCount <= 1` (line ~47)
- src/components/no-data-component.js — modify — hardcoded hint strings/predicates ("required: exactly 1", "maximum: 1") at lines ~88, 104, 108

## Source Notes
The scaffold hardcodes `dimCount === 1 && measCount <= 1` in `data-state.js` and corresponding strings in `no-data-component.js`. Any project that updates limits in `data.js` must also update these two files to stay consistent — the connection is not obvious and there is no compile-time or test-time signal that they are out of sync.

**Recommendation**: Import limits from `data.js` in `data-state.js` and `no-data-component.js` from the start, deriving validation predicates and display strings from those values. This makes `data.js` the single source of truth for limits across both runtime behavior and user-facing messages.

## Prior Art in Repo
- src/qae/data.js — targets already define dimension/measure min/max for the hypercube; the exports should be those same values, not new duplicates
- Related finding (plans/hypercube-pagination.md): `INITIAL_FETCH_HEIGHT` should be `Math.floor(9999 / (DIM_MAX + MEAS_MAX))` — the same exported constants feed that calculation if pagination lands later

## Open Questions
- Message derivation design: generate strings like "exactly 1" vs "between X and Y" from min/max pairs — keep the generator simple and readable
- E2E tests assert on the current hint strings — check test/modules/extension-unconfigured for exact-string dependencies
