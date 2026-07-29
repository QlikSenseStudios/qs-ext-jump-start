# Command Context Directory

One command per file for hierarchical loading. Files are listed below in logical use order; each links to its command file.

## Available Commands

- [bootstrap-project-from-template.md](bootstrap-project-from-template.md) — Project setup from template (auto-triggered when context.local.md is missing)
- [fix-security-advisories.md](fix-security-advisories.md) — Resolve npm audit vulnerabilities using non-breaking fixes only
- [update-nebula-deps.md](update-nebula-deps.md) — Bulk-update all five @nebula.js packages in one PR
- [describe-change-set.md](describe-change-set.md) — Generate a descriptive summary of a change set for recording
- [review-change-set.md](review-change-set.md) — Verify a change set is consistent, correct, and ready to record
- [list-commands.md](list-commands.md) — Display all available commands from this index

## Usage Pattern

Load commands as part of context hierarchy:

```
context.global.md → commands/{command-name}.md
```

## Command Style

Commands are documented as:

- **Purpose**: What it accomplishes
- **Pattern**: General approach
- **Context**: Required context loading
- **Example**: Basic usage

Focus on patterns rather than specific implementations.

## Adding a New Command

Create `commands/{command-name}.md` following the Command Style above, then add it to the Available Commands list. Only add a command when there is a real, current need for it — do not add placeholder stubs for ideas that might be useful someday. Example command ideas not currently implemented (add one of these, or something similar, only when the need actually arises):

- **Scaffold Project** — set up basic project structure (directories, version control, docs) for any project type
- **Organize Structure** — create logical directory organization (src/, docs/, tests/, etc.)
- **Setup Quality Gates** — establish linting, formatting, and testing for the project type
- **Document Project** — create a README and domain-specific docs
- **Define Project Scope** — document purpose, requirements, and constraints
- **Track Progress** — update context.state.md and context.backlog.md with status
- **Maintain Standards** — enforce project/standards.md across the codebase
- **Plan Next Phase** — analyze current state and identify next work items
- **Load Context Chain** — load contexts following the hierarchy for a specific task
- **Validate Context Chain** — check context references and consistency
- **Update Work Context** — add, update, or complete backlog items
- **Add Domain Context** — create a new domain-specific context file

---

_See [docs/Commands.md](../docs/Commands.md) for prompt examples and usage guidance._
