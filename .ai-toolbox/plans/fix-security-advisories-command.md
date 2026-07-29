# Fix Security Advisories Command

**Roadmap entry**: Add a "Fix Security Advisories" command resolving npm audit vulnerabilities with non-breaking fixes only.
**Depends on**: none (commands-one-per-file re-org complete; lands as commands/fix-security-advisories.md)
**Complexity**: Low
**Execution tier**: light

## Target Files

- .ai-toolbox/commands/ — create — new command file (name per re-org convention); sorted before the Update Nebula.js Dependencies command (generic above project-specific)

## Source Notes

Security vulnerabilities reported by `npm audit` are addressable independently of any package update cycle. A standalone command gives it a named branch, a full validation gate, and a clear PR label rule.

Command definition (from downstream findings, ready to adapt):

- **Purpose**: Resolve security vulnerabilities reported by `npm audit` using only non-breaking fixes
- **Branch**: `chore/security-audit-fix`
- **Context**: tools/github-actions.md (Dependency Audit section)
- **Steps**:
  1. Run `npm audit` — note which advisories have `fixAvailable: true` (non-breaking), which require `--force` (breaking), and which are unfixable (`fixAvailable: false`)
  2. Create branch `chore/security-audit-fix`
  3. Run `npm audit fix` (no `--force`) — resolves only non-breaking advisories
  4. Review output — unfixable transitive vulnerabilities are acceptable per the audit gate policy in tools/github-actions.md; do not proceed with `--force` for remaining items
  5. Validate: `npm run build`, `npm run package`, `npm run lint`, `npm test`
  6. If tests pass, hand off to user: run Review Change Set then Describe Change Set before committing
  7. If tests fail: diagnose before investigating extension code — `npm audit fix` should not affect test-time behavior; a failure likely indicates a transitive dependency changed a runtime API
- **PR label**: `version:patch` if one or more vulnerabilities resolved; `none` if `package-lock.json` unchanged

## Prior Art in Repo

- tools/github-actions.md Dependency Audit section — audit gate policy this command references
- Recent commit f5fbc19 "chore(deps): resolve npm audit vulnerabilities (#104)" — a real instance of this workflow having been done ad hoc

## Open Questions

- Step 2 (branch creation) and step 6 (handoff) must respect the user's VCS workflow preferences in context.local.md — phrase branch/validation steps to be workflow-agnostic per the Workflow Agnostic rule
