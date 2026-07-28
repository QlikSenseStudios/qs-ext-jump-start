# Extension Container Test Identifier

**Roadmap entry**: Add an .extension-container identifier alongside COMPLETE_VISUALIZATION and document the distinction.
**Depends on**: none
**Complexity**: Low
**Execution tier**: standard

## Target Files
- test/lib (identifiers/constants module) — modify — add an identifier targeting the extension's own rendered container
- .ai-toolbox/domains/qlik-extension.md (or qlik-extension-testing.md once split) — modify — document when each identifier is the right signal

## Source Notes
The scaffold's `COMPLETE_VISUALIZATION` identifier targets `.njs-viz[data-render-count]` — Nebula Hub's outer wrapper. This is present whenever Nebula Hub is running the extension, regardless of what the extension renders internally (data table or no-data component). Tests using only this identifier cannot detect misconfigured validation logic — they pass even when the extension is showing an error state.

**Recommendation**: Add a second identifier targeting the extension's own rendered container (`.extension-container`) and document the distinction. Tests that verify limit enforcement should assert on this identifier, not just the Nebula Hub wrapper. Without it, broken validation passes the test suite silently.

**Caveat (cross-noted with plans/playwright-robustness.md)**: when MEAS_MIN = 0, `.extension-container` is visible before any measure is added — it is a false-positive signal for "measure was added and extension re-rendered". Use a measure-column-specific selector (`th.meas-header`) for that purpose. The doc must carry this caveat so the two entries don't read as contradictory.

## Prior Art in Repo
- test/lib — IDENTIFIERS constant with COMPLETE_VISUALIZATION (Test Utilities — Single Source of Truth section in the domain context mandates identifiers live in one place)
- src/components — confirm the rendered container's actual class name is `.extension-container`

## Open Questions
- Which existing tests should switch to (or add) the new identifier — limit-enforcement and configured-state tests are the primary candidates
