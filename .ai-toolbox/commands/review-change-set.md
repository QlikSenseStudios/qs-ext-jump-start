# Review Change Set

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
- Dependent context files updated: all context files (domains/, tools/, commands/, context.\*.md) that reference deleted or renamed code, APIs, or file paths are updated in this change set
- Knowledge capture: identify any framework behavior, fragile patterns, or tool internals discovered during this work — verify they are captured in the appropriate context files per the Knowledge Capture rule before closing
- Upstream improvement extraction: identify context-system learnings from the current work that are upstream-agnostic; when found, record them in `.ai-toolbox/upstream-notes/` as candidate updates for the upstream context system maintainer
- Version bump coherence: verify the change set does not mix multiple version bump types (e.g., breaking changes alongside minor features alongside patches) in a way that would be confusing or unsafe — if so, consider splitting into separate change sets or clarifying the primary impact

---

_Adapt patterns based on loaded domain contexts_
