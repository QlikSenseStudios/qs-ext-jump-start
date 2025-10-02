# Workflows & Common Tasks

This guide shows two primary workflows and common tasks with examples.

## Workflow A — Contribute as a Fork

1. Fork the original repository
2. Create a feature branch
3. Make focused changes (docs, tests, code)
4. Run tests locally: `npm test`
5. Open a pull request with a clear description and references

Tips:

- Keep PRs small and cohesive
- Update docs when behavior changes
- Reference code: `src/`, `test/`

## Workflow B — Use as a Starter Template

1. Use this template to create your repo
2. Rename the extension
   - Update package name and metadata in `package.json`
   - Adjust titles or labels in `src/qae/object-properties.js`
3. Update repository origin
   - Point Git remote to your project repository
4. Remove references to the original template if needed (README sections, links)
5. Customize code under `src/` and tests in `test/`
6. Run and validate locally: `npm run serve`, `npm test`
7. Package when ready: `npm run package`

### Rename & Rebrand Checklist (optional)

- Update `package.json`: name, description, repository, homepage, bugs
- Update `src/meta.json`: name, icon, preview
- Update titles/labels in `src/qae/object-properties.js`
- Replace icons/screenshots if any (e.g., assets folder if you add one)
- Refresh README to reflect your project name and links

## Common Tasks

### Add a Property to the Property Panel

- Edit `src/qae/object-properties.js`
- Example: add a boolean toggle under a `settings` section

### Configure Dimensions and Measures

- Update `src/qae/data.js` targets or extend `qHyperCubeDef` in `object-properties.js`

### Render Custom UI

- Edit `src/index.js`; use `useElement`, `useLayout`, and helpers in `src/utils.js` (includes debug utilities)

### Write a New Test

- Extend the existing test framework in `test/qs-ext.e2e.js`
- See existing tests for patterns and fixtures

### Qlik Cloud/Enterprise Setup

- Follow `docs/QLIK_CLOUD_SETUP.md` or `docs/QLIK_ENTERPRISE_SETUP.md`

### Deployment

- Build package: `npm run package`
- Upload zip to Qlik Sense (see `docs/DEPLOYMENT.md`)

## Recommended VS Code Extensions

- ESLint — linting (dbaeumer.vscode-eslint)
- Prettier — formatting (esbenp.prettier-vscode)
- Playwright Test for VSCode — test explorer (ms-playwright.playwright)
- EditorConfig — consistent editor settings (EditorConfig.EditorConfig)
- Markdown All in One — docs editing (yzhang.markdown-all-in-one)
- GitHub Pull Requests and Issues — PR flow (GitHub.vscode-pull-request-github)
