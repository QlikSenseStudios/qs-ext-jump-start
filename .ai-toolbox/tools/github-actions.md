# GitHub Actions Context

CI/CD workflows included in `.github/workflows/`. Load when working on automation, version management, or dependency security.

## Workflows

- **`build.yml`** — runs `npm run build` on every push and PR; confirms the extension compiles cleanly
- **`lint.yml`** — runs `npm run lint` on every push and PR; confirms ESLint passes
- **`audit.yml`** — dependency security gate; runs on every push and PR
- **`audit-fix.yml`** — scheduled dependency fix; runs every Monday at 06:00 UTC
- **`version-bump.yml`** — automatic version management; runs on every push to `main`

## Dependency Audit (`audit.yml`)

Parses `npm audit --json` and fails only if fixable vulnerabilities at `moderate` level or above are present. Unfixable vulnerabilities (`fixAvailable === false` — no third-party fix available) are logged as warnings but do not fail the gate.

**When a Dependabot PR fails the audit gate:**
1. Trigger **Audit Fix** manually from the Actions UI
2. Set `base-branch` to the Dependabot branch name
3. A `chore/audit-fix` PR opens targeting that branch — merge it
4. The audit gate on the Dependabot PR passes — merge as normal

**When the audit gate passes but warns about unfixable vulnerabilities:**
No action required — the gate stays green until a third-party fix becomes available, at which point `npm audit fix` or Dependabot resolves it automatically.

Dependabot (`.github/dependabot.yml`) handles direct dependency version bumps. `audit-fix.yml` handles transitive lockfile vulnerabilities. Both run weekly but serve different purposes.

## Version Bump (`version-bump.yml`)

Triggers on every push to `main` (after each squash merge). Reads the merged PR's labels via the GitHub API and runs `npm version patch|minor|major` accordingly. Pushes a `chore: bump version to X.Y.Z [skip ci]` commit back to `main`.

- Uses `GITHUB_TOKEN` — no PAT required
- `[skip ci]` prevents CI from re-running on the bump commit
- No matching label = no bump; safe default for infrastructure PRs (Dependabot, audit-fix)

**Version bump labels** (apply one per PR, or none to skip):
- `version:patch` — bug fixes, dependency updates, minor corrections
- `version:minor` — new features, backwards-compatible additions
- `version:major` — breaking changes

Labels must be created in the GitHub repo's Labels settings before the workflow can read them.

---
*Load when working on CI workflows, version management, or dependency security.*
