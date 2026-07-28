# Color Normalization Utils

**Roadmap entry**: Add d3-color dependency with toRGB / isDarkColor scaffold utils and the color-normalization pattern subsection.
**Depends on**: attribute-expression-styling-pattern (the pattern file hosts the subsection)
**Complexity**: Medium
**Execution tier**: standard

## Target Files
- package.json — modify — add `d3-color` (ISC license, zero dependencies)
- src/utils.js (or scaffold utils module) — modify — `toRGB` and `isDarkColor` helpers
- .ai-toolbox/patterns/attribute-expression-styling.md — modify — color normalization subsection

## Source Notes
Qlik's internal color format is `ARGB(a,r,g,b)` with all values 0–255. Use `d3-color`'s `rgb()` for normalization — it handles all CSS formats plus the ARGB case and returns NaN for invalid inputs (detectable via `Number.isNaN(parsed.r)`).

**Why not `@qlik/nebula-table-utils`**: it provides `toRGB` and `isDarkColor` but (as of June 2026) requires `@nebula.js/stardust@4.9.0` — incompatible with 7.x — plus React and MUI peer dependencies. `d3-color` is the same underlying library without the baggage.

**HSP darkness formula**: `0.299*r + 0.587*g + 0.114*b < 125` → dark (use light foreground).

## Prior Art in Repo
- package.json peerDependencies — stardust ^7.x, confirming the nebula-table-utils incompatibility rationale
- src/ utils location — follow the scaffold's existing module layout (check for an existing utils module before creating one)

## Open Questions
- Should the utils ship wired into the example table (e.g., automatic contrast foreground when a background expression is set) or as exported-but-unused scaffold helpers? Wiring them in demonstrates the pattern but grows the example
- Version bump label: adding a runtime dependency + scaffold code is likely `version:minor` per the Describe Change Set rules
