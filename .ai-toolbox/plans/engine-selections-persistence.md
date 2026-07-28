# Engine Selections Persistence

**Roadmap entry**: Document that resetConfiguration() does not clear engine selections; call hub.clearSelections() in the pre-test state guard.
**Depends on**: testing-domain-split
**Complexity**: Low
**Execution tier**: light

## Target Files
- .ai-toolbox/domains/qlik-extension-testing.md — modify — Test Teardown section gains the note alongside the resetConfiguration() explanation
- test/lib (pre-test state guard, e.g. assertCleanExtensionState or equivalent) — modify — add hub.clearSelections() before verifying engine state

## Source Notes
The Qlik engine persists confirmed selections as engine-side data filters across page reconnections within the same app session. `resetConfiguration()` (writing `{}` via the Monaco editor) removes dimension/measure configuration from the extension property object but does **not** issue a `clearAll` to the engine. An active confirmed selection filters the hypercube on the next test's fresh page load — tests see fewer rows than expected, a failure that looks like a rendering bug or wrong row count, not selection bleed.

**Fix**: call `hub.clearSelections()` (clicks `[title="Clear all selections"]` in the Nebula Hub selection bar) as part of the pre-test state check, before verifying engine state. No-op when no selections are active — safe to call unconditionally. Correct location is the pre-test guard, **not** `afterEach` teardown — before each test ensures isolation regardless of whether the prior test cleaned up correctly.

**Doc wording**: "Engine selections are not cleared by `resetConfiguration()` — call `hub.clearSelections()` separately."

## Prior Art in Repo
- test/lib/page-objects/nebula-hub.js:264 — `clearSelections()` already exists; do NOT re-implement
- The method is currently called from a combined teardown (~line 330) alongside resetConfiguration() — this item moves/adds the call to the pre-test guard; decide whether the teardown call stays (harmless) or goes (single location)

## Open Questions
- Identify the template's actual pre-test guard name; the downstream project used `assertCleanExtensionState()`
