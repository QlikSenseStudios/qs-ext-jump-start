# Qlik Sense Extension Template Knowledge Base

## 1. Project Overview

- **Purpose:** Boilerplate for building Qlik Sense extensions with modern tooling
- **Tech Stack:** JavaScript (optionally TypeScript), Nebula.js, Playwright, Node.js
- **Main Features:** Pre-configured build/test scripts, comprehensive documentation, automated testing

## 2. Key Concepts

### Qlik Sense Extension
- Custom visualization or analytics component for Qlik Sense
- Uses Nebula.js for integration and lifecycle management

### Nebula.js
- Qlik's open-source framework for building extensions
- Provides hooks (`useElement`, `useLayout`, etc.) and lifecycle methods

### Playwright
- End-to-end testing framework for automated UI and integration tests

## 3. Project Structure

```
src/
├── index.js              # Main extension entrypoint
├── ext.js                # Extension configuration
└── qae/                  # Properties and data sources
    ├── object-properties.js
    ├── data.js
    └── index.js
test/
├── qs-ext.e2e.js         # Playwright E2E tests
├── qs-ext.connect.js     # Qlik connection utilities
├── qs-ext.fixture.js     # Test fixtures
└── qlik-sense-app/       # Test data and load script
docs/                     # Detailed setup and deployment guides
```

## 4. Development Workflow

1. **Use GitHub template:** Create a clean project history
2. **Install dependencies:** `npm install`
3. **Setup environment:** Follow [setup guides](./docs/)
4. **Develop locally:** `npm run serve`
5. **Run tests:** `npm test`
6. **Package for deployment:** `npm run package`

See [README.md](./README.md) for detailed quick start instructions.

## 5. Extension Best Practices

- **Componentization:** Break UI into reusable components
- **Type Safety:** Use TypeScript or JSDoc for type annotations
- **Error Handling:** Provide user feedback for failed data loads or API errors
- **Accessibility:** Use ARIA attributes and keyboard navigation
- **Internationalization:** Support multiple languages if possible
- **Testing:** Cover edge cases, error states, and user interactions

## 6. Common Tasks

- **Add a new property:** Edit `src/qae/object-properties.js`
- **Change data source:** Edit `src/qae/data.js`
- **Write a new test:** Add tests to `test/qs-ext.e2e.js`
- **Update documentation:** Edit relevant files in `docs/` or root

## 7. Reference Resources

- [Qlik Developer Portal](https://qlik.dev/)
- [Nebula CLI Documentation](https://qlik.dev/extend/)
- [Qlik OSS sn-* Repositories](https://github.com/qlik-oss)
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [Playwright Testing Framework](https://playwright.dev/docs/intro)

## 8. AI Usage Guidance

- Use this knowledge base and referenced documentation for context
- For code generation, prefer patterns from sn-* Qlik OSS projects
- Follow [TODO.md](./TODO.md) for improvement ideas and best practices
- Use [.aiconfig](./.aiconfig) for project metadata and context

## 9. Example Prompts for AI

- "Generate a Qlik Sense extension property for a custom KPI"
- "Write a Playwright test for selection behavior in the extension"
- "Suggest improvements for error handling in the extension's data fetch logic"
- "How do I add accessibility features to my Qlik Sense extension?"

---

**Documentation Structure:**
- [README.md](./README.md) - Quick start and overview
- [docs/](./docs/) - Detailed setup and deployment guides
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [TODO.md](./TODO.md) - Planned improvements
