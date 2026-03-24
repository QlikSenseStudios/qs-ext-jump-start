# Git Version Control Context

This project's Git conventions. AI agents apply these when generating commit messages, branch names, or reviewing change sets.

## Team Conventions

- **Branching strategy**: Feature branches off `main`; `main` is always deployable
  - `feature/short-description` — new capabilities
  - `fix/short-description` — bug fixes and corrections
  - `chore/short-description` — maintenance, dependencies, non-functional changes
  - `docs/short-description` — documentation-only changes
  - `ci/short-description` — GitHub Actions and automation changes

- **Commit message format**: Conventional commits
  - Format: `type: short description` (imperative, lowercase)
  - Body: bulleted list of what changed and why (not how)
  - Types: `feat`, `fix`, `chore`, `docs`, `ci`, `refactor`, `test`

- **Review process**: All changes via pull requests; no direct commits to `main`

- **Merge approach**: Squash merge — one commit per PR lands on `main`

## PR Pattern
- PR template: `.github/pull_request_template.md`

## Configuration
- Key `.gitignore` patterns: `node_modules/`, `dist/`, `*-ext/`, `.sandbox/`, `*.local.*`, `.env`, `test/artifacts/`, `test/report/`
- Git hooks: Husky + lint-staged (ESLint auto-fix on staged JS files, runs on pre-commit)
- `package.json` changes: always run `npm install` afterward to keep `package-lock.json` in sync — commit both files together
- Dependabot: weekly npm updates configured in `.github/dependabot.yml`

## Integration Points
- [patterns/setup.md](../patterns/setup.md) — project initialization patterns
- [project/standards.md](../project/standards.md) — quality gates that must pass before merge

---
*Load when version control context is relevant. AI agents: apply these conventions when generating commit messages, branch names, or PR descriptions.*