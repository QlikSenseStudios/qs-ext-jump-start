# Commands One-Per-File Re-org

**Roadmap entry**: Re-organize commands/ from category-based files to one-command-per-file; update all references.
**Depends on**: none
**Complexity**: Medium
**Execution tier**: light

## Target Files
- .ai-toolbox/commands/development.md — split — commands: Initialize Project, Organize Structure, Setup Quality Gates, Document Project, Review Change Set, Describe Change Set
- .ai-toolbox/commands/context.md — split — per-command files
- .ai-toolbox/commands/project.md — split — per-command files
- .ai-toolbox/commands/initialization.md — evaluate — may already be one command (Initialize); align naming
- .ai-toolbox/commands/README.md — modify — update command listing
- .ai-toolbox/context.global.md — modify — any references to command category files
- .ai-toolbox/docs/Commands.md — modify — usage guide references

## Source Notes
From the template development backlog (previously an Optional Enhancement): refactor commands from category-based grouping (development.md, project.md, etc.) to one-command-per-file structure. Improves discoverability, version control clarity, and mental model alignment with explicit invocation pattern. Low effort; organizational improvement only.

## Prior Art in Repo
- commands/development.md — contains the clarified Updated-vs-Fixed category definitions in Describe Change Set; the re-org must carry these forward verbatim
- context.global.md Command Execution rule — "read its definition from the commands/ directory and execute every step as written"; file naming should make command lookup unambiguous
- context.global.md Human Reading Order rule — order any command index by natural usage sequence

## Open Questions
- File naming convention: kebab-case of the command name (e.g., describe-change-set.md)?
- Does commands/README.md become the index that preserves category grouping as sections?
- Cross-reference sweep needed: grep for "development.md", "project.md", "context.md" across .ai-toolbox/ and docs/
