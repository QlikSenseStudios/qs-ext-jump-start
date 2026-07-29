# Describe Change Set

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
- **Updated** — existing files that changed as part of the current work, including synchronization driven by it: renamed functions updated wherever referenced, comments corrected because the code they described changed, stale references updated to reflect a new API, and auto-sync target updates (README.md, context.state.md, context.backlog.md) kept current as part of the change set
- **Fixed** — only defects in previously committed code or content, independent of the current work — something that was wrong before the work started and would remain wrong if the change set were reverted. If the file would not have needed changing without the current work, it is Updated, not Fixed

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

_Adapt patterns based on loaded domain contexts_
