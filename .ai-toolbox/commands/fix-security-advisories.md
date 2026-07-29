# Fix Security Advisories Command

**Purpose**: Resolve npm audit security vulnerabilities using non-breaking fixes only, with validation and clear PR labeling

**Precondition**: You can run terminal commands and have npm installed

**Context Required**:

- tools/github-actions.md (Dependency Audit section) — understand the audit gate policy
- git.md (PR Label Rule section) — understand version bump labels
- Review Change Set and Describe Change Set commands — handoff workflow

**When to Use**:

- Regular: Run weekly or as part of scheduled maintenance (complements `audit.yml` CI gate)
- Reactive: After discovering a security advisory affecting the project
- Prerequisite check: Run `npm audit` first and verify fixable (non-breaking) advisories exist

---

## Pattern: The Workflow

### 1. Audit the Vulnerabilities

**Run**: `npm audit`

**Examine the output**: Identify which advisories have the following flags:

- `fixAvailable: true` — can be fixed without breaking changes (proceed with this command)
- Require `--force` — require breaking changes (intentionally excluded; outside this command's scope)
- `fixAvailable: false` — unfixable (wait for third-party fix; acceptable per audit policy)

**Decision point**: If no `fixAvailable: true` advisories exist, stop here — nothing to fix with non-breaking changes.

### 2. Create a Feature Branch

**Context**: Isolation allows review, validation, and clean PR history

**Action**: Create a feature branch named `chore/security-audit-fix` (or your project's variant) per your version control workflow

**Why**: A dedicated branch isolates security fixes from other work and ensures they can be reviewed, validated, and merged cleanly

### 3. Apply Non-Breaking Fixes

**Run**: `npm audit fix` (without `--force`)

**Behavior**: Resolves only direct, non-breaking vulnerabilities and safe transitive dependency updates

**Important**: Do NOT use `npm audit fix --force` — breaking changes are intentionally excluded per audit policy. See tools/github-actions.md for the rationale.

**Expected outcome**:

- If fixes applied: `package-lock.json` shows changes
- If no fixes applied: `npm audit fix` found no safe fixes; consider ending here

### 4. Review the Changes

**Action**: Inspect `package-lock.json` for scope and impact

**Checklist**:

- ✅ Changes are limited to `package-lock.json` and `package.json` (no src/ changes)
- ✅ Unfixable transitive vulnerabilities are noted and acceptable per audit policy (do not attempt `--force`)
- ✅ No breaking versions were installed (compare against the audit output from step 1)

**If no changes**: `npm audit fix` found no safe fixes. End here — no PR needed.

### 5. Validate with Full Test Suite

**Validation gate**: ALL of the following must pass before proceeding to commit.

**Run in order**:

```
npm run build
npm run package
npm run lint
npm test
```

**If all pass**: Proceed to step 6

**If any fail**: Stop and diagnose before investigating extension code

**Why**: `npm audit fix` should not affect runtime behavior. A test failure indicates either:

- A transitive dependency released a breaking API change (unexpected)
- A dependency version was selected that is incompatible with other code
- A timing or environment issue

**Recovery**: Review which dependency changed, determine if the fix is necessary, either revert or update extension code to match the new API, then re-run tests.

### 6. Handoff to User for Review and Commit

**Precondition**: All tests from step 5 passed

⚠️ **HANDOFF POINT** — You now take control of the following workflow:

**What you do next**:
1. Run the "Review Change Set" command to validate consistency and correctness of `package-lock.json` changes
2. Run the "Describe Change Set" command to generate a summary for your commit message
3. Stage the changes per your version control workflow (`git add package-lock.json`)
4. Commit with the summary generated in step 2 (e.g., `git commit -m "chore(deps): resolve npm audit vulnerabilities"`)
5. Proceed to step 7 (PR creation and labeling)

### 7. Create and Label the PR

**Your actions**:
1. Push your branch per your version control workflow
2. Create a pull request against `main`
3. Apply the appropriate label based on the condition below
4. Request review and merge per your project's workflow

**Label selection rule**:

| Condition                                                                 | Label           | Rationale                                               |
| ------------------------------------------------------------------------- | --------------- | ------------------------------------------------------- |
| `package-lock.json` changed AND one or more vulnerabilities were resolved | `version:patch` | Security fixes are patch-level semantic version changes |
| `package-lock.json` unchanged (no fix applied)                            | `none`          | No changes; no version bump needed                      |

**See also**: tools/git.md for complete PR labeling conventions and version bump automation

---

## Validation Gate (Mandatory)

**Requirement**: All tests must pass before proceeding to PR submission.

- Failing tests = stop and diagnose
- No exceptions — a security fix that breaks functionality is worse than the vulnerability
- If a test fails after `npm audit fix`:
  1. Review which transitive dependency changed
  2. Check if a public API was altered
  3. Either revert the fix or update code to match the new API
  4. Re-run test suite and confirm all pass

---

## Edge Cases & Diagnostics

### Case: Some vulnerabilities have `fixAvailable: true` but tests still fail

**Cause**: A transitive dependency released a breaking API change during the safe update

**Recovery**:

1. Review the npm audit output and identify which package changed
2. Check if it's a third-party library or your own transitive dependency
3. Either revert the fix (run `npm install` to restore lockfile) or update your code to match the new API
4. Re-run test suite

**Decision point**: If the transitive fix is necessary for security but introduces breaking changes, weigh the security risk against the cost of API migration. If the API change is too risky, consider accepting the vulnerability as a trade-off and escalate to a planned major version bump cycle.

### Case: All vulnerabilities require `--force`

**Behavior**: `npm audit fix` makes no changes

**Decision**: Stop here. Do not use `--force` — these fixes are outside this command's scope.

**Next step**: Address breaking-change security updates as part of a planned major version release, or escalate if security severity is critical.

### Case: Vulnerabilities are reported but unfixable (`fixAvailable: false`)

**Behavior**: No fix available from any source

**Decision**: Acceptable per audit policy in tools/github-actions.md. Wait for upstream fixes, or escalate to next major version cycle if critical.

**No action required**: The CI audit gate will warn but not fail, allowing the PR to merge.

---

## Integration & Related Commands

**Complements**:

- **audit.yml** (CI gate) — runs on every push and PR; identifies vulnerabilities
- **audit-fix.yml** (scheduled) — runs weekly to catch new vulnerabilities
- **Dependabot** — handles direct package version bumps separately

**Related commands**:

- Review Change Set — validate a change set for consistency before committing
- Describe Change Set — generate a summary for commit messages and PR descriptions
- (Future) Update Nebula.js Dependencies — bulk package updates (separate, project-specific command)

---

## Workflow Notes

- **VCS Agnostic**: This command uses abstract language ("create a feature branch", "stage changes") rather than VCS-specific commands. Adapt steps 2 and 6 to your version control workflow (Git CLI, UI, CI-driven, etc.)
- **Commit discipline**: Use the "Describe Change Set" command for consistent, clear commit messages
- **PR review**: Prioritize audit fixes in review — they carry security intent and should merge quickly
- **Frequency**: This command is designed for regular use (weekly audits) and ad hoc reactive use
- **Branch naming**: `chore/security-audit-fix` is conventional; use your project's variant if preferred

---

_Load when responding to npm security advisories or performing scheduled dependency audits. Apply workflow-agnostic language throughout._
