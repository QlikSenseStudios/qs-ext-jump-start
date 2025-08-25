# QS-Ext-Jump-Start

QS-Ext-Jump-Start is a template project designed to help you quickly start building Qlik Sense extensions. It includes example code, testing tools, and setup guides to streamline development and testing.

See [CHANGELOG.md](./docs/CHANGELOG.md) for recent updates.

## Two Usage Modes

- Contribute as a fork: Prepare focused pull requests back to the source template to improve it. See [CONTRIBUTING.md](./CONTRIBUTING.md).
- Use as a starter template: Rename the extension, update your repository origin, and remove references to the original template as needed. See [Workflows & Tasks](./docs/WORKFLOWS.md).

## ⚡ Quick Start for Creating a New Extension

1. Click "Use this template" on [GitHub](https://github.com/QlikSenseStudios/qs-ext-jump-start)
2. Clone your repository and install dependencies: `git clone <your-repo> && cd <your-repo> && npm install`
3. Follow the setup guide for your environment in [docs/](./docs/)
4. Start the development server: `npm run serve`
5. Run tests: `npm test`
6. Package for deployment: `npm run package`

## 🚀 What You Get

| Feature                   | Status   | Description                            |
| ------------------------- | -------- | -------------------------------------- |
| Modern Extension Template | ✅ Ready | Nebula.js Stardust hooks architecture  |
| Playwright Testing        | ✅ Ready | Nebula hub integration with Playwright |
| Development Server        | ✅ Ready | Hot reload with Nebula CLI             |
| Packaging                 | ✅ Ready | One-command packaging                  |
| Documentation             | ✅ Ready | Setup and usage guides                 |

This template provides:

- Example extension code (see `src/`)
- Playwright-based testing setup (see `test/`)
- Nebula CLI development server
- Packaging and deployment scripts
- Setup guides for Qlik Cloud and Enterprise

### Selections Example (feature branch)

This template includes a simple selections-focused example to demonstrate best practices with Nebula’s `useSelections`:

- Exactly 1 dimension (required) and 0–1 measure (optional)
- Renders a two-column table: Dimension and Measure
- Clicking a dimension value starts a selection session and toggles values
- Highlights apply only in active selection mode; hover uses a translucent overlay to preserve background state
- Uses Qlik’s selection APIs via `useSelections.begin/select/cancel`
- Shows a helpful no-data message when the configuration is invalid (pick 1 dim, optional 1 measure)

See `src/index.js` and `src/styles.css` for the implementation, and `test/states/*.test.js` for E2E coverage.

## 📖 Documentation

### 🎯 Usage Guides

| Guide                                     | Purpose                        | When to Use                            |
| ----------------------------------------- | ------------------------------ | -------------------------------------- |
| [**Setup Guides**](./docs/)               | Environment configuration      | First-time setup, CI/CD integration    |
| [**Knowledge Base**](./KNOWLEDGE_BASE.md) | Best practices & patterns      | Development questions, troubleshooting |
| [**Testing Guide**](./docs/TESTING.md)    | How to run and customize tests | Running tests, debugging, extending    |

### 📋 Project Information

| Document                                             | Purpose                    | When to Use                      |
| ---------------------------------------------------- | -------------------------- | -------------------------------- |
| [**Project Structure**](./docs/PROJECT_STRUCTURE.md) | File/folder purpose        | Learn where to make changes      |
| [**Workflows & Tasks**](./docs/WORKFLOWS.md)         | Common tasks and examples  | How to customize and test        |
| [**CHANGELOG.md**](./docs/CHANGELOG.md)              | Version history & features | Understanding updates, migration |
| [**CONTRIBUTING.md**](./CONTRIBUTING.md)             | Development guidelines     | Contributing to template         |
| [**TODO.md**](./TODO.md)                             | Planned improvements       | Roadmap and feature requests     |

## 🛠️ Development Workflow

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm** - Included with Node.js
- **Qlik Sense access** - Cloud or Enterprise environment

### Your Development Loop

```bash
# 1. Start development server (hot reload enabled)
npm run serve

# 2. Make changes to your extension in src/
# 3. See changes instantly at http://localhost:8000

# 4. Run tests to validate changes
npm test

# 5. Package for deployment when ready
npm run package
```

### Key Files to Edit

```
src/
├── index.js              # 🎯 Main extension logic
├── ext.js                # ⚙️ Extension configuration
├── qae/
│   ├── data.js           # 📊 Data processing
│   └── object-properties.js  # 🎛️ Property panel setup
├── styles.css            # 🎨 Extension styling
├── utils.js              # 🔧 Utility functions
└── meta.json            # 📋 Extension metadata

test/
├── states/              # 🧪 Add your custom tests here
└── qlik-sense-app/      # 📂 Test data (load script)
```

### Testing Your Changes

The framework includes Playwright tests with Nebula hub interactions:

```bash
# Run all tests
npm test

# Watch tests in browser to see interactions
npx playwright test --headed

# Debug specific functionality
npx playwright test --grep "your test name" --debug
```

See [Testing Guide](./docs/TESTING.md) for detailed usage.

Notes for the selections example tests:

- Data state tests assert the presence of the two-column table and headers.
- No-data tests accept additional guidance text (they check that the message contains “No data to display”).
- Selection state tests detect the `.extension-container.in-selection` class and verify the table remains interactive.

## 🌐 Environment Setup

Choose your Qlik Sense environment:

Both guides include:

- Prerequisites for Qlik Cloud or Enterprise
- Step-by-step setup instructions
- Configuration for development and testing

## 🚀 Deployment

### Local Packaging & Deployment

```bash
# Create deployment package
npm run package

# Output: <your-extension>-ext/
# Zip this folder to upload to Qlik Sense
```

See deployment guides for your environment.

## 🔧 Extending your extension based on this template

### Adding New Features

1. **New Extension Logic** → Edit `src/index.js`
2. **Property Panel Changes** → Update `src/qae/object-properties.js`
3. **Data Processing** → Modify `src/qae/data.js`
4. **Test Coverage** → Add tests in `test/states/`

See [Testing Guide](./docs/TESTING.md) for more information.

## 🆘 Need Help?

### Quick Troubleshooting

**🔴 Tests failing?** → Check [Testing Guide troubleshooting](./docs/TESTING.md#troubleshooting)  
**🔴 Development server issues?** → Verify environment setup guides  
**🔴 Deployment problems?** → See deployment documentation for your platform

### Resources

- [Qlik Sense Developer Documentation](https://qlik.dev/)
- [Nebula CLI Documentation](https://qlik.dev/extend/)
- [Playwright Testing Documentation](https://playwright.dev/docs/intro)

## 📄 License

MIT License - see [license.txt](./license.txt) for details.

_For technical implementation details and version history, see [CHANGELOG.md](./docs/CHANGELOG.md). This README focuses on practical usage and getting started quickly._

## 🧩 Recommended VS Code Extensions

Recommended extensions to improve development and testing:

- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Playwright Test for VSCode (ms-playwright.playwright)
- EditorConfig (EditorConfig.EditorConfig)
- Markdown All in One (yzhang.markdown-all-in-one)
- GitHub Pull Requests and Issues (GitHub.vscode-pull-request-github)
