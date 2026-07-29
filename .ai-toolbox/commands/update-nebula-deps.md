# Update Nebula.js Dependencies Command

**Purpose**: Bulk-update all five `@nebula.js` packages together in a single atomic PR, eliminating per-package Dependabot noise

**Precondition**: You can run terminal commands and have npm and git installed

**Context Required**:

- tools/github-actions.md (Version Bump section) — understand version bump labels
- tools/git.md (PR Label Rule section) — understand PR labeling conventions
- Review Change Set and Describe Change Set commands — handoff workflow

**When to Use**:

- Regular: When a new `@nebula.js` release is available (typically monthly)
- Proactive: Run quarterly to stay current with Nebula.js updates
- Prerequisite check: All five packages (`@nebula.js/cli`, `@nebula.js/cli-build`, `@nebula.js/cli-sense`, `@nebula.js/cli-serve`, `@nebula.js/stardust`) move together — bumping individually creates inconsistency

---

## Pattern: The Workflow

### 1. Check Latest Versions

**Context**: Verify the current version across all five packages before beginning

**Run**:

```bash
npm view @nebula.js/cli@latest version
npm view @nebula.js/cli-build@latest version
npm view @nebula.js/cli-sense@latest version
npm view @nebula.js/cli-serve@latest version
npm view @nebula.js/stardust@latest version
```

**Note the latest version** — all five are published at the same semver (e.g., all at `7.2.0`)

**Decision point**: If the current version in `package.json` matches, stop — no update needed.

### 2. Create a Feature Branch

**Context**: Isolation allows review, validation, and clean PR history

**Action**: Create a feature branch named `chore/update-nebula-deps`

**Why**: A dedicated branch isolates dependency updates from other work and ensures they can be reviewed, validated, and merged cleanly

**Run**:

```bash
git checkout -b chore/update-nebula-deps
```

### 3. Update package.json

**Action**: Edit `package.json` and update all five packages to the latest version

**Packages to update**:

| Package                | Location           | Current    | Target      |
| ---------------------- | ------------------ | ---------- | ----------- |
| `@nebula.js/cli`       | `devDependencies`  | See step 1 | `^<latest>` |
| `@nebula.js/cli-build` | `devDependencies`  | See step 1 | `^<latest>` |
| `@nebula.js/cli-sense` | `devDependencies`  | See step 1 | `^<latest>` |
| `@nebula.js/cli-serve` | `devDependencies`  | See step 1 | `^<latest>` |
| `@nebula.js/stardust`  | `peerDependencies` | See step 1 | `^<latest>` |

**Example**: If latest is `7.2.0` and current is `7.0.1`, change `^7.0.1` to `^7.2.0`

**Verify**: After editing, all five packages should reference the same version

### 4. Install and Audit

**Run**:

```bash
npm install
npm audit fix
```

**Expected behavior**:

- `npm install` updates `package-lock.json` to resolve the new versions
- `npm audit fix` applies any non-breaking security fixes to transitive dependencies

**Important**: Do NOT use `npm audit fix --force` — breaking changes are intentionally excluded per audit policy. See tools/github-actions.md for the rationale.

### 5. Validate with Full Test Suite

**Validation gate**: ALL of the following must pass before proceeding to commit.

**Run in order**:

```bash
npm run build
npm run package
npm run lint
npm test
```

**If all pass**: Proceed to step 6

**If any fail**: Stop and diagnose before proceeding

**Why**: A Nebula.js version change should not affect runtime behavior. A test failure indicates either:

- A breaking API change in the new Nebula.js version
- An incompatibility with extension code
- A timing or environment issue

**Recovery**: Review Nebula.js release notes, determine if API changes are required, update extension code if needed, then re-run tests.

---

### 6. Handoff to User for Review and Commit

**Precondition**: All tests from step 5 passed

⚠️ **HANDOFF POINT** — You now take control of the following workflow:

**What you do next**:

1. Run the "Review Change Set" command to validate consistency and correctness of `package.json` and `package-lock.json` changes
2. Run the "Describe Change Set" command to generate a summary for your commit message
3. Stage the changes per your version control workflow (e.g., `git add package.json package-lock.json`)
4. Commit with the summary generated in step 2 (example: `git commit -m "chore(deps): update @nebula.js packages to v7.2.0"`)
5. Proceed to step 7 (PR creation and labeling)

---

### 7. Create and Label the PR

**Your actions**:

1. Push your branch per your version control workflow
2. Create a pull request against `main`
3. Apply the appropriate label based on the condition below
4. Request review and merge per your project's workflow

**Label selection rule**:

| Condition                                      | Label           | Rationale                                                                                 |
| ---------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------- |
| `package.json` and `package-lock.json` changed | `version:patch` | Dependency updates are patch-level semantic version changes (per tools/github-actions.md) |
| No changes after step 4 (unlikely)             | `none`          | No version bump needed                                                                    |

**See also**: tools/git.md for complete PR labeling conventions and version bump automation

---

## Validation Gate (Mandatory)

**Requirement**: All tests must pass before proceeding to PR submission.

- Failing tests = stop and diagnose
- No exceptions — a dependency update that breaks functionality is worse than staying on an older version
- If a test fails after updating Nebula.js:
  1. Check the Nebula.js release notes for breaking changes
  2. Review which extension code relies on the changed API
  3. Update extension code to match the new API, or
  4. Revert the update (run `git checkout package.json package-lock.json` and `npm install`) and open an issue for investigation
  5. Re-run test suite and confirm all pass

---

## Edge Cases & Diagnostics

### Case: A new Nebula.js version introduced a breaking API change

**Symptoms**: Tests fail after `npm install`, even though `npm audit fix` passed

**Diagnosis**:

1. Review the Nebula.js [release notes](https://github.com/qlik-oss/nebula.js/releases) for breaking changes
2. Identify which part of the extension code relies on the changed API
3. Check if the extension code in `src/` needs to be updated

**Recovery**:

- **If fixable**: Update extension code to match the new API, re-run tests
- **If blocking**: Revert the update (`git checkout package.json package-lock.json && npm install`), stay on the current version, and open a GitHub issue describing the breakage for downstream tracking

### Case: `npm audit fix` reports unfixable or force-required vulnerabilities

**See**: tools/github-actions.md (Dependency Audit section) for the audit policy

**Action**: These are acceptable per policy — proceed with the update if all tests pass

---

## Pre-Commit Checklist

Before running step 6 (Review Change Set), verify:

- ✅ All five packages are at the same version in `package.json`
- ✅ Changes are limited to `package.json` and `package-lock.json`
- ✅ No source code changes in `src/` or `test/`
- ✅ All tests pass (build, package, lint, test)
- ✅ No other commits on this branch (clean isolation)

---

_Load when updating @nebula.js dependencies or managing bulk package upgrades._
