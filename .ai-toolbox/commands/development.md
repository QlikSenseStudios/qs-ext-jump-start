# Development Workflow Commands

General development patterns that work across project types.

## Initialize Project
**Purpose**: Set up basic project structure
**Pattern**: Follow patterns/setup.md workflow
**Context**: patterns/setup.md + domains/{type}.md + tools/ contexts as needed
**Example**: Create directory structure, initialize version control, add documentation

## Organize Structure
**Purpose**: Create logical directory organization
**Pattern**: Standard patterns for project type
**Context**: domains/{type}.md + patterns/setup.md
**Example**: src/, docs/, tests/ with appropriate subdirectories

## Setup Quality Gates
**Purpose**: Establish basic quality controls
**Pattern**: Add appropriate linting, formatting, testing for project type
**Context**: domains/{type}.md + tools/ contexts as needed
**Example**: ESLint for JS, Pylint for Python, etc.

## Document Project
**Purpose**: Create appropriate documentation
**Pattern**: README + domain-specific docs
**Context**: patterns/setup.md + project/standards.md
**Example**: Purpose, installation, usage, contribution guidelines

## Review Change Set
**Purpose**: Verify a change set is consistent, correct, and ready to record
**Pattern**: Review all version-controlled files in the current change set (exclude gitignored and intentionally untracked files) against established context rules, fix all issues found, re-read changed files to verify no fix introduced a new inconsistency, then report
**Context**: context.global.md + context.state.md + all version-controlled files in the current change set
**Checklist**:
- Logical consistency, clarity, and alignment with project workflow goals; no rule or constraint conflicts with an existing rule in another context file
- Compliance with all context and documentation rules (DRY, Minimal Context, Workflow Agnostic, Reference Validation, Language Standards, Markdown Links, Context Framing)
- All file references and links are correct and point to existing files
- Workspace trees and module listings in context.state.md and README files reflect all files in this change set — treat them as current
- Recently Completed Work in context.state.md and context.backlog.md is current — any project deliverable items completed in this change set are recorded with contributor name and date; context system maintenance is not recorded
- Auto-sync targets (root README.md, context.state.md, context.backlog.md) are consistent with current content — if out of sync, fix immediately as a dependency
- Lint passes: run `npm run lint` and fix all errors before closing — a change set that fails the linter cannot be committed
- Staged/unstaged cross-check: any reference in a staged file to another file (import, path, link) must resolve against staged content — an unstaged file referenced by committed code will break anyone pulling the branch
- Synchronized file consistency: identify related files that should be updated together (e.g., version bumps in package.json should sync with workflow files; configuration changes should sync across all affected config files) — verify all related files are either all staged or all unstaged; if some are staged and others are not, report and request staging or unstaging to achieve consistency
- Dependent context files updated: all context files (domains/, tools/, commands/, context.*.md) that reference deleted or renamed code, APIs, or file paths are updated in this change set
- Knowledge capture: identify any framework behavior, fragile patterns, or tool internals discovered during this work — verify they are captured in the appropriate context files per the Knowledge Capture rule before closing
- Version bump coherence: verify the change set does not mix multiple version bump types (e.g., breaking changes alongside minor features alongside patches) in a way that would be confusing or unsafe — if so, consider splitting into separate change sets or clarifying the primary impact

## Describe Change Set
**Purpose**: Generate a descriptive summary of the current change set suitable for recording (commit message, PR description, changelog entry, etc.)
**Precondition**: All files intended for this commit must be staged before running this command — `git diff --cached` only reflects staged content. If files are not yet staged, stop and report that staging is required; do not attempt to describe the change set from session memory.
**Pattern**: First retrieve the complete list of version-controlled files in the current change set (exclude gitignored and intentionally untracked files). Then for each file, run `git diff --cached` against the previously committed version and describe only what the diff shows — not what editing steps were taken during the session to produce it. If the diff shows rule A replaced by rule B, describe rule B's content relative to rule A; do not describe intermediate steps like "merged two rules." Produce output covering ALL files in the change set in the exact plain text format below. No markdown, no bold, no extra formatting. Do not use conversational session terms (e.g. "Phase 3", "this session", "as discussed") — the output must be self-contained and meaningful to anyone reading git history with no knowledge of the conversation.
**Context**: context.global.md + all version-controlled files in the current change set + their prior recorded history
**Output format** (plain text, copy-paste ready for commit message):
```
[Short one-line description]

Created:
-- [filename]: [what it is]

Integrated into:
-- [filename]: [what was wired in]

Updated:
-- [filename]: [what changed]

Fixed:
-- [filename]: [what was corrected]
```

**After generating the output**, provide version bump recommendation to the user:
- State which label (`version:patch | version:minor | version:major | none`) to apply
- Explain the rationale based on what changed
- This recommendation guides PR labeling but is not included in the commit message itself
**Categories**:
- **Created** — new files with no prior recorded history
- **Integrated into** — existing files modified only to wire in new files from this change set
- **Updated** — existing files with substantive content changes, including auto-sync target updates (README.md, context.state.md, context.backlog.md) kept current as part of the change set
- **Fixed** — existing files where content was incorrect or broken (wrong information, bad links, rule violations) — not routine sync lag

**Version bump recommendation** (apply `version:` label to PR based on recommendation):
- **major** — breaking changes (API changes, requirement changes, behavior changes, dropped support)
  - Example: dropping Node 16 support, changing extension API signature
- **minor** — new features, backwards-compatible additions, new capabilities
  - Example: new component, new utility function, new validation rule
- **patch** — bug fixes and dependency updates that affect users or product code
  - Example: fix in src/state/ business logic, security patch in a used dependency, fix to extension rendering
  - NOT: CI/CD changes, context system updates, or build tooling changes (use `none` instead)
- **none** — infrastructure only (context system, CI/CD workflows, build tooling, internal templates) with no product-level changes
  - Example: Node version update in workflows, GitHub Actions refactor, context system enhancements, PR template updates
  - Key distinction: changes that don't touch src/, test/, or user-facing behavior

Omit any category that has no files.

---
*Adapt patterns based on loaded domain contexts*