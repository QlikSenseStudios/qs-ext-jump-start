# GitHub Actions Context

CI/CD workflows included in `.github/workflows/`. Load when working on automation, version management, or dependency security.

## Workflows

- **`build.yml`** — runs `npm run build` on every push and PR; confirms the extension compiles cleanly
- **`lint.yml`** — runs `npm run lint` on every push and PR; confirms ESLint passes
- **`audit.yml`** — dependency security gate; runs on every push and PR
- **`audit-fix.yml`** — scheduled dependency fix; runs every Monday at 06:00 UTC
- **`version-bump.yml`** — automatic version management; runs on every push to `main`

## Dependency Audit (`audit.yml`)

Parses `npm audit --json` and categorizes vulnerabilities into three groups:

- **Can fix without breaking changes** — fails the gate; run `npm audit fix` and commit
- **Require breaking changes** (`npm audit fix --force`) — warns but does not fail; intentional trade-off, acceptable to merge
- **Unfixable** (`fixAvailable === false` — no third-party fix available) — warns but does not fail; awaiting third-party update

**When a Dependabot PR fails the audit gate:**
1. Trigger **Audit Fix** manually from the Actions UI
2. Set `base-branch` to the Dependabot branch name
3. A `chore/audit-fix` PR opens targeting that branch — merge it
4. The audit gate on the Dependabot PR passes — merge as normal

**When the audit gate warns about force-required fixes:**
These are acceptable — they represent dependencies that would require major version bumps (breaking changes). If the force-applied fixes don't break extension functionality, the PR can be merged. Otherwise, consider accepting the vulnerability as a trade-off.

**When the audit gate passes but warns about unfixable vulnerabilities:**
No action required — the gate stays green until a third-party fix becomes available, at which point `npm audit fix` or Dependabot resolves it automatically.

Dependabot (`.github/dependabot.yml`) handles direct dependency version bumps. `audit-fix.yml` handles transitive lockfile vulnerabilities. Both run weekly but serve different purposes.

## Version Bump (`version-bump.yml`)

Triggers on every push to `main` in the origin repo only (`QlikSenseStudios/qs-ext-jump-start`). Does not run on forks to prevent version clashes.

**Workflow**:
1. Reads the merged PR's labels via the GitHub API
2. Runs `npm version patch|minor|major --no-git-tag-version --ignore-scripts`
3. Updates `package.json` and `package-lock.json`
4. Deletes existing bump branch if present to prevent push conflicts
5. Creates feature branch `chore/version-bump-${NEW_VERSION}` and pushes it
6. Creates a PR via `gh pr create` for manual review and merge

**Auto-merge**: Requires `enablePullRequestAutoMerge` to be enabled in repository settings. If enabled, add `--auto --squash` flags to `gh pr merge` command after creating the PR.

**Why this approach**: Branch protection on `main` requires all changes through PRs and mandates status checks. Direct commits are rejected. Auto-merge ensures the bump is fast-tracked after CI validation.

**Key implementation details**:
- Uses `GITHUB_TOKEN` — no PAT required
- `--ignore-scripts` prevents husky execution in CI (husky is dev-only)
- Origin repo check: `if: github.repository == 'QlikSenseStudios/qs-ext-jump-start'`
- No matching label = no bump; safe default for infrastructure PRs (Dependabot, audit-fix)

**Version bump labels** (apply one per PR, or none to skip):
- `version:patch` — bug fixes, dependency updates, minor corrections
- `version:minor` — new features, backwards-compatible additions
- `version:major` — breaking changes

Labels must be created in the GitHub repo's Labels settings before the workflow can read them.

---
*Load when working on CI workflows, version management, or dependency security.*
