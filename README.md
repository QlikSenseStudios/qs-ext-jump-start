# QS-Ext-Jump-Start

A modern boilerplate for building Qlik Sense extensions with pre-configured tooling, testing, and deployment guides.

## Quick Start

1. **Use this template:** Click "Use this template" on [GitHub](https://github.com/QlikSenseStudios/qs-ext-jump-start)
2. **Install dependencies:** `npm install`
3. **Set up Qlik environment:** See [setup guides](./docs/)
4. **Start developing:** `npm run serve`
5. **Run tests:** `npm test`
6. **Deploy:** `npm run package`

## Documentation

| Guide                                 | Description                             |
| ------------------------------------- | --------------------------------------- |
| [Development](#development)           | Core development workflow               |
| [Setup Guides](./docs/)               | Environment-specific setup instructions |
| [Testing](./docs/TESTING.md)          | Running and writing tests               |
| [Deployment](./docs/DEPLOYMENT.md)    | Packaging and deploying extensions      |
| [Knowledge Base](./KNOWLEDGE_BASE.md) | Best practices and AI guidance          |
| [Contributing](./CONTRIBUTING.md)     | How to contribute to this template      |
| [Project TODOs](./TODO.md)            | Planned improvements                    |

## Features

- ✅ Pre-configured development environment with Nebula CLI
- ✅ Playwright testing framework with Qlik Sense integration
- ✅ Example extension structure and load script
- ✅ Deployment automation and packaging
- ✅ Comprehensive documentation and guides

## Development

### Prerequisites

- Node.js 20+
- npm
- Access to Qlik Sense (Cloud or Enterprise)

### Getting Started

1. **Create your extension repository:**

   ```bash
   # Use GitHub template, then:
   git clone https://github.com/your-username/your-extension-name.git
   cd your-extension-name
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Qlik environment:**
   - [Qlik Cloud Setup](./docs/QLIK_CLOUD_SETUP.md)
   - [Qlik Enterprise Setup](./docs/QLIK_ENTERPRISE_SETUP.md)

4. **Start development server:**
   ```bash
   npm run serve
   ```
   Navigate to `http://localhost:8000` and connect to your Qlik Sense environment.

### Project Structure

```
src/
├── index.js              # Main extension entrypoint
├── ext.js                # Extension configuration
└── qae/                  # Properties and data sources
    ├── object-properties.js
    ├── data.js
    └── index.js
test/
├── qs-ext.e2e.js         # End-to-end tests
└── qlik-sense-app/       # Test data and load script
```

### Making Changes

- **Extension logic:** Edit files in `src/`
- **Properties:** Update `src/qae/object-properties.js`
- **Data sources:** Modify `src/qae/data.js`
- **Tests:** Add tests to `test/qs-ext.e2e.js`

For detailed guidance, see [Knowledge Base](./KNOWLEDGE_BASE.md).

## Resources

- [Qlik Developer Portal](https://qlik.dev/) - Official Qlik Sense documentation
- [Nebula CLI Documentation](https://qlik.dev/extend/) - Extension development guide
- [Playwright Testing](https://playwright.dev/docs/intro) - Testing framework documentation
- [React Hooks](https://react.dev/reference/react/hooks) - For extension development patterns

## License

This project is licensed under the MIT License. See [license.txt](./license.txt) for details.
