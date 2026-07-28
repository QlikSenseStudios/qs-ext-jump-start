# Engine Model Additions

**Roadmap entry**: Add associative engine model bullets, DUAL field semantics, and the em-dash encoding behavior to the engine documentation.
**Depends on**: none
**Complexity**: Low
**Execution tier**: light

## Target Files
- .ai-toolbox/domains/qlik-extension.md — modify — engine model documentation (create or extend a Qlik Associative Engine Model section)

## Source Notes

**Engine model bullets**:
- Engine loads data into an in-memory associative model at app open; visualizations do not query sources directly
- Visualizations subscribe to hypercubes via `qHyperCubeDef`; Engine computes and delivers data through the Nebula.js layout lifecycle
- Engine pushes updated hypercubes on every associative model state change; filtering is association-based, not SQL-based
- Dynamic styling is configured per visualization: expressions in per-dimension/measure configuration fields reference the data model; the Engine evaluates each expression per row and returns values through the hypercube; the extension applies them at render time

**DUAL field semantics** (engine part only — the Playwright assertion guidance lives in plans/playwright-robustness.md): a `DUAL(text, numeric)` field produces a single Qlik value per row with both a text representation and a numeric key. The same text label appearing across multiple rows in the data model yields distinct `qElemNumber`s that render with identical text (and identical aria-labels in the DOM).

**Engine character encoding**: the engine silently replaces U+2014 (em dash `—`) with a space when storing strings in object properties (e.g., caption fields). Use ASCII hyphen-minus `-` in any string stored in the engine property bag.

## Prior Art in Repo
- domains/qlik-extension.md — has Property Panel (QAE) and hooks sections but no consolidated engine-model section; "Known Environment Unknowns" lists data fetch behaviors as unverified — these bullets replace some of that uncertainty
- plans/hypercube-pagination.md and plans/schema-normalization-getproperties.md write into the same engine documentation area — coordinate section structure to avoid three fragmented additions

## Open Questions
- Section placement: one "Qlik Associative Engine Model" section collecting these bullets plus pagination plus normalization, or separate headings — decide when the first of the three items lands
