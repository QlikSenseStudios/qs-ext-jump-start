# Qlik Sense Extension Template Knowledge Base

## 1. Project Overview

- **Purpose:** Boilerplate for building Qlik Sense extensions with modern tooling (Nebula CLI, Playwright, etc.).
- **Tech Stack:** JavaScript (optionally TypeScript), Nebula.js, Playwright, Node.js.
- **Main Features:** Pre-configured build/test scripts, example extension structure, Qlik load script for test data, robust documentation.

## 2. Key Concepts

### Qlik Sense Extension

- Custom visualization or analytics component for Qlik Sense.
- Uses Nebula.js for integration and lifecycle management.

### Nebula.js

- Qlik’s open-source framework for building extensions.
- Provides hooks (`useElement`, `useLayout`, etc.) and lifecycle methods.

### Playwright

- End-to-end testing framework.
- Used for automated UI and integration tests.

## 3. Project Structure

```
src/
  index.js            # Main entrypoint for the extension
  ext.js              # Extension configuration
  qae/                # Properties and data sources
    object-properties.js
    data.js
    index.js
test/
  qs-ext.e2e.js       # Playwright E2E tests
  qlik-sense-app/
    load-script.qvs   # Example Qlik load script
```

## 4. Development Workflow

1. **Clone or use template:**  
   Use GitHub’s “Use this template” feature for a clean start.

2. **Install dependencies:**  
   `npm install`

3. **Serve locally:**  
   `npm run serve` (Nebula CLI)

4. **Test:**  
   `npm test` (Playwright)

5. **Package for deployment:**  
   `npm run package`

## 5. Extension Best Practices

- **Componentization:** Break UI into reusable components.
- **Type Safety:** Use TypeScript or JSDoc for type annotations.
- **Error Handling:** Provide user feedback for failed data loads or API errors.
- **Accessibility:** Use ARIA attributes and keyboard navigation.
- **Internationalization:** Support multiple languages if possible.
- **Testing:** Cover edge cases, error states, and user interactions.

## 6. Common Tasks

- **Add a new property:**  
  Edit `src/qae/object-properties.js` and update the `properties` object.

- **Change data source:**  
  Edit `src/qae/data.js` to configure data targets.

- **Write a new test:**  
  Add Playwright tests in `test/qs-ext.e2e.js`.

- **Update documentation:**  
  Edit `README.md` and add examples/screenshots.

## 7. Reference Resources

- [Qlik Sense Developer Documentation](https://qlik.dev/)
- [Nebula CLI Documentation](https://qlik.dev/extend/)
- [Qlik OSS sn-\* Repositories](https://github.com/qlik-oss)
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [Playwright Testing Framework](https://playwright.dev/docs/intro)

## 8. AI Usage Guidance

- Use the knowledge base and referenced documentation for context when generating code or answering questions.
- For code generation, prefer patterns from sn-\* Qlik OSS projects.
- When contributing, follow the TODO.md for improvement ideas and best practices.
- Use `.aiconfig` for project metadata and context.

## 9. Example Prompts for AI

- “Generate a Qlik Sense extension property for a custom KPI.”
- “Write a Playwright test for selection behavior in the extension.”
- “Suggest improvements for error handling in the extension’s data fetch logic.”
- “How do I add accessibility features to my Qlik Sense extension?”

---

**How to use:**

- Place this file as `KNOWLEDGE_BASE.md` or `RAG_KB.md` in your repo.
- Reference it in your README and `.aiconfig`.
- Update as the project evolves.
