# QS-Ext-Jump-Start

QS-Ext-Jump-Start is an advanced template project designed to accelerate Qlik Sense extension development. It features a comprehensive component-based architecture, flexible template system, declarative rendering framework, and robust testing infrastructure.

See [CHANGELOG.md](./docs/CHANGELOG.md) for recent updates (current: **0.5.0** - Major Architecture Refactor).

## Two Usage Modes

- **Contribute as a fork**: Prepare focused pull requests back to the source template to improve it. See [CONTRIBUTING.md](./CONTRIBUTING.md).
- **Use as a starter template**: Rename the extension, update your repository origin, and remove references to the original template as needed. See [Workflows & Tasks](./docs/WORKFLOWS.md).

## ⚡ Quick Start for Creating a New Extension

1. Click "Use this template" on [GitHub](https://github.com/QlikSenseStudios/qs-ext-jump-start)
2. Clone your repository and install dependencies: `git clone <your-repo> && cd <your-repo> && npm install`
3. Follow the setup guide for your environment in [docs/](./docs/)
4. Start the development server: `npm run serve`
5. Run tests: `npm test`
6. Package for deployment: `npm run package`

## 🚀 What You Get

| Feature                      | Status     | Description                                    |
| ---------------------------- | ---------- | ---------------------------------------------- |
| Modern Extension Template    | ✅ Ready   | Nebula.js Stardust hooks architecture          |
| Component-Based Architecture | ✅ Ready   | Modular, reusable UI components                |
| Template System              | ✅ Ready   | Flexible UI generation and layouts             |
| Enhanced State Management    | ✅ Ready   | Memory-safe WeakMap-based state isolation      |
| Declarative Rendering        | 🔄 Beta    | Configuration-driven UI composition (disabled) |
| Comprehensive Testing        | ✅ Ready   | Nebula hub integration with Playwright         |
| Development Server           | ✅ Ready   | Hot reload with Nebula CLI                     |
| Performance Optimization     | 📋 Planned | Detailed roadmap for performance enhancements  |
| Documentation Hub            | ✅ Ready   | Complete setup and development guides          |

This template provides:

- **Advanced Extension Architecture** (see `src/components/`, `src/templates/`, `src/state/`)
- **Comprehensive Testing Framework** (see `test/` with enhanced utilities)
- **Nebula CLI Development Server** with hot reload
- **One-Command Packaging** and deployment scripts
- **Complete Documentation** for Qlik Cloud and Enterprise setup

### Advanced Architecture

#### Component-Based System

Modular, reusable components for consistent extension development:

- **Error Components** - Comprehensive error handling with user feedback
- **Header Components** - Standardized titles and navigation
- **Table Components** - Optimized data display with DocumentFragment rendering
- **Selection Handlers** - Advanced selection with keyboard navigation
- **No-Data Components** - Enhanced guidance for configuration setup

#### Template System

Standardized UI patterns for rapid development:

- **Base templates** - Foundation containers and layouts
- **State templates** - Extension state management (data, no-data, error, loading)
- **Table templates** - Advanced table patterns (enhanced, responsive, paginated)
- **Template registry** - Centralized access to all templates

#### Declarative Rendering (Beta)

Configuration-driven UI composition for dynamic interfaces:

- **JSON configurations** - Define layouts without code
- **Conditional rendering** - Show/hide components based on data
- **Layout strategies** - Grid, flex, and responsive layouts
- **Template integration** - Works seamlessly with existing templates

Enable in extension properties → Declarative Rendering section.

### Selections Example (feature branch)

This template includes a simple selections-focused example to demonstrate best practices with Nebula’s `useSelections`:

- Exactly 1 dimension (required) and 0–1 measure (optional)
- Renders a two-column table: Dimension and Measure
- Clicking a dimension value starts a selection session and toggles values
- Highlights apply only in active selection mode; hover uses a translucent overlay to preserve background state
- Uses Qlik’s selection APIs via `useSelections.begin/select/cancel`
- Shows a helpful no-data message when the configuration is invalid (pick 1 dim, optional 1 measure)

See `src/index.js` and `src/styles.css` for the implementation, and `test/qs-ext.e2e.js` for E2E coverage. The test suite validates environment setup and essential component accessibility.

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
├── utils.js              # 🔧 Utility functions (debug, DOM helpers)
└── meta.json            # 📋 Extension metadata

test/
├── lib/                 # 🧪 Test framework library
├── qs-ext.e2e.js        # 🧪 Environment validation tests
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

# Open the latest HTML report
npx playwright show-report test/report

# Local quality gates (list reporter)
npm test -s -- --reporter=list
```

See [Testing Guide](./docs/TESTING.md) for detailed usage.

Notes for the selections example tests:

- Data state tests assert the presence of the two-column table and headers.
- No-data tests accept additional guidance text (they check that the message contains “No data to display”).
- Selection state tests detect the `.extension-container.in-selection` class and verify the table remains interactive.

## 🌐 Environment Setup

Choose your Qlik Sense environment:

- Qlik Cloud: see `docs/QLIK_CLOUD_SETUP.md`
- Qlik Sense Enterprise: see `docs/QLIK_ENTERPRISE_SETUP.md`

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
4. **Test Coverage** → Add tests to the existing framework

See [Testing Guide](./docs/TESTING.md) for more information.

### Development Tips

**Debug Mode**: The extension includes debug utilities that activate automatically on localhost or when URL contains `debug=true`. Debug mode enables additional logging and development features.

**Console Logging**: Use `debugLog()` from `src/utils.js` for conditional logging that only outputs when debug mode is active.

## 🆘 Need Help?

### Quick Troubleshooting

**🔴 Connection test fails?** → Check Qlik Sense user setup and application access. See [Testing Guide troubleshooting](./docs/TESTING.md#troubleshooting).  
**🔴 Environment test fails?** → Check Nebula Hub connection string and app ID. Run with `--headed` to inspect interface.  
**🔴 Extension unconfigured test fails?** → Check extension data and object-properties files and entry-point code.  
**🔴 Development server issues?** → Verify environment setup guides  
**🔴 Deployment problems?** → See deployment documentation for your platform

### Resources

- [Qlik Sense Developer Documentation](https://qlik.dev/)
- [Nebula CLI Documentation](https://qlik.dev/extend/)
- [Playwright Testing Documentation](https://playwright.dev/docs/intro)

## 📄 License

MIT License - see [license.txt](./license.txt) for details.

_For technical implementation details and version history, see [CHANGELOG.md](./docs/CHANGELOG.md). This README focuses on practical usage and getting started quickly._

## 🧩 Recommended Extensions & Editors

### VS Code Extensions

If using VS Code or Cursor's compatibility mode:

- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Playwright Test for VSCode (ms-playwright.playwright)
- EditorConfig (EditorConfig.EditorConfig)
- Markdown All in One (yzhang.markdown-all-in-one)
- GitHub Pull Requests and Issues (GitHub.vscode-pull-request-github)

### Cursor IDE (Recommended)

For the best AI-powered development experience, we recommend using [Cursor IDE](https://cursor.sh/):

- Built-in AI code completion and chat
- Contextual codebase understanding
- Multi-file editing capabilities
- See [Cursor IDE Setup Guide](./.cursor/CURSOR_IDE_SETUP.md) for configuration
