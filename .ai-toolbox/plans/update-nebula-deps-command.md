# Update Nebula.js Dependencies Command

**Roadmap entry**: Add an "Update Nebula.js Dependencies" command for bulk five-package @nebula.js version bumps.
**Depends on**: commands-one-per-file (lands as its own file post-re-org); sorted after Fix Security Advisories
**Complexity**: Low
**Execution tier**: light

## Target Files
- .ai-toolbox/commands/ — create — new command file (name per re-org convention)

## Source Notes
All `@nebula.js` packages move together — `@nebula.js/cli`, `@nebula.js/cli-build`, `@nebula.js/cli-sense`, `@nebula.js/cli-serve`, and `@nebula.js/stardust` are always published at the same version. Dependabot opens one PR per package, producing noise and partial upgrade states. The correct pattern is a single bulk-update PR.

Command outline (from downstream findings):
- Check latest with `npm show` for all five packages
- Create branch `chore/update-nebula-deps`
- Bump all five in `package.json` (`devDependencies`: cli, cli-build, cli-sense, cli-serve; `peerDependencies`: stardust) to `^<latest>`
- Run `npm install`, `npm audit fix` (no `--force`), then validate: build, package, lint, test
- PR label: `none` (no product-level change)

## Prior Art in Repo
- package.json — confirm the five packages sit in the stated dependency groups before writing the command
- Dependabot config (.github/dependabot.yml if present) — consider whether to group/ignore @nebula.js packages there as part of this item, so Dependabot stops opening per-package PRs

## Open Questions
- Should the command also cover the Dependabot grouping config, or is that a separate concern?
- PR label `none` assumes no runtime behavior change — but stardust is a peerDependency of the extension itself; confirm the label policy against tools/github-actions.md version bump rules
