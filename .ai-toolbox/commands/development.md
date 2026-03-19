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

## Describe Change Set
**Purpose**: Generate a descriptive summary of the current change set suitable for recording (commit message, PR description, changelog entry, etc.)
**Pattern**: First retrieve the complete list of version-controlled files in the current change set (exclude gitignored and intentionally untracked files). Then for each file, diff against the previously committed version and describe only what is different now — not the session history of how the changes were made. Produce output covering ALL files in the change set in the exact plain text format below. No markdown, no bold, no extra formatting.
**Context**: context.global.md + all version-controlled files in the current change set + their prior recorded history
**Output format** (plain text, copy-paste ready):
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
**Categories**:
- **Created** — new files with no prior recorded history
- **Integrated into** — existing files modified only to wire in new files from this change set
- **Updated** — existing files with substantive content changes, including auto-sync target updates (README.md, context.state.md, context.backlog.md) kept current as part of the change set
- **Fixed** — existing files where content was incorrect or broken (wrong information, bad links, rule violations) — not routine sync lag

Omit any category that has no files.

---
*Adapt patterns based on loaded domain contexts*