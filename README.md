# QS-Ext-Jump-Start

A Qlik Sense extension template built on Nebula.js. Includes a working selections example, Playwright E2E tests, GitHub Actions CI, and documentation to start building from.

[![Lint](https://github.com/QlikSenseStudios/qs-ext-jump-start/actions/workflows/lint.yml/badge.svg)](https://github.com/QlikSenseStudios/qs-ext-jump-start/actions/workflows/lint.yml)
[![Build](https://github.com/QlikSenseStudios/qs-ext-jump-start/actions/workflows/build.yml/badge.svg)](https://github.com/QlikSenseStudios/qs-ext-jump-start/actions/workflows/build.yml)
[![Package](https://github.com/QlikSenseStudios/qs-ext-jump-start/actions/workflows/package.yml/badge.svg)](https://github.com/QlikSenseStudios/qs-ext-jump-start/actions/workflows/package.yml)
[![Audit](https://github.com/QlikSenseStudios/qs-ext-jump-start/actions/workflows/audit.yml/badge.svg)](https://github.com/QlikSenseStudios/qs-ext-jump-start/actions/workflows/audit.yml)

## Quick Start

1. Click "Use this template" on [GitHub](https://github.com/QlikSenseStudios/qs-ext-jump-start)
2. Clone and install: `git clone <your-repo> && cd <your-repo> && npm install`
3. Set up your Qlik environment: [Qlik Cloud](./docs/QLIK_CLOUD_SETUP.md) · [Enterprise](./docs/QLIK_ENTERPRISE_SETUP.md)
4. Start the development server: `npm run serve`

## What's Included

| | Feature | Description |
| --- | --- | --- |
| ✅ | Nebula.js extension | Stardust hooks architecture with component-based rendering |
| ✅ | Selections example | Dimension/measure table with full `useSelections` lifecycle |
| ✅ | State management | WeakMap-based state isolation (`src/state/`) |
| ✅ | E2E tests | Playwright suite against a live Nebula Hub environment |
| ✅ | GitHub Actions CI | Lint, Build, and Package checks on every PR |
| ✅ | Development server | Hot reload via Nebula CLI |

## Development

```bash
npm run serve     # start dev server at localhost:8000
npm run lint      # lint src/ and test/
npm run build     # build to dist/
npm run package   # package for Qlik deployment
npm test          # run E2E tests (requires live Qlik environment — see docs)
```

See [Project Structure](./docs/PROJECT_STRUCTURE.md) for a map of all source files.

## Environment Setup

The development server and tests require a live Qlik Sense environment. Configure `.env` before running `npm test`.

- [Qlik Cloud Setup](./docs/QLIK_CLOUD_SETUP.md)
- [Enterprise Setup](./docs/QLIK_ENTERPRISE_SETUP.md)

## Documentation

| Guide | Purpose |
| --- | --- |
| [Workflows & Tasks](./docs/WORKFLOWS.md) | Common tasks: rename, customize, deploy |
| [Testing Guide](./docs/TESTING.md) | Test setup, running, and troubleshooting |
| [Project Structure](./docs/PROJECT_STRUCTURE.md) | File layout and architecture |
| [Deployment](./docs/DEPLOYMENT.md) | Packaging and uploading to Qlik |
| [Changelog](./docs/CHANGELOG.md) | Version history |

## Contributing

To contribute to this template, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [license.txt](./license.txt)
