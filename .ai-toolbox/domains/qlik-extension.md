# Qlik Sense Extension Domain Context

Context for developing Qlik Sense extensions using the Nebula.js Supernova API. Load when working on extension source code, property panel configuration, or test infrastructure.

## Technology Stack
- **Framework**: Nebula.js Supernova API (`@nebula.js/stardust ^6.0.1`)
- **Build**: Nebula CLI (`nebula build`, `nebula serve`, `nebula sense`)
- **Testing**: Playwright E2E (`@playwright/test`)
- **Language**: JavaScript ESM (`src/`) with CommonJS in `test/` — migration in progress
- **Linting**: ESLint v9 flat config (`eslint.config.mjs`)
- **Node.js**: `>=20.17`

## Nebula.js Supernova Hooks
*Primary API for extension lifecycle — imported from `@nebula.js/stardust`*

- `useElement()` — returns the root DOM element assigned to this extension instance
- `useLayout()` — returns the current layout object from Qlik Engine (data + property values)
- `useEffect(fn, deps)` — lifecycle hook; runs `fn` when `deps` change; return a cleanup function if needed
- `useSelections()` — provides access to the Qlik selection API for this extension instance

## Safe DOM Patterns
*Always prefer these; innerHTML is a last resort*

- Use `createElement()` and `textContent` for all DOM construction
- Use `DocumentFragment` for batched multi-node insertions
- `innerHTML` only with explicitly sanitized or compiled-static strings — justify in a comment
- **Stable container**: the element returned by `useElement()` persists across renders — never replace it; clear its children: `while (el.firstChild) el.removeChild(el.firstChild)`

## State Management (WeakMap Pattern)
*Per-element state isolation; memory-safe across renders*

```javascript
const dataState = new WeakMap();    // keyed by DOM element
const renderState = new WeakMap();
const selectionState = new WeakMap();
```

- State is isolated per element instance — no globals, no module-level state
- WeakMap ensures DOM element garbage collection cleans up state automatically
- Three state modules: `src/state/data-state.js`, `render-state.js`, `selection-state.js`

## Project Architecture

```
src/
├── index.js              # Supernova entrypoint — hooks + render lifecycle
├── ext.js                # Property panel accordion definition
├── utils.js              # DOM helpers + debug utilities (isDebugEnabled, debugLog)
├── styles.css            # Extension CSS
├── meta.json             # Packaging metadata (name, icon, preview)
├── components/           # UI components: error, header, no-data, selection-handler, table
├── templates/            # Template system: base, state, table
├── state/                # WeakMap state modules: data-state, render-state, selection-state
└── qae/
    ├── object-properties.js  # Extension property defaults; version/subtitle from package.json
    └── data.js               # qHyperCubeDef data targets (dimensions, measures, fetch config)
```

## Property Panel (QAE)
- `src/qae/object-properties.js` — default property values; do not put panel structure here
- `src/ext.js` — property panel accordion structure; debug section is conditionally included via `isDebugEnabled()`
- `src/qae/data.js` — data binding: dimensions, measures, `qInitialDataFetch`, suppression flags

## Debug System

```javascript
import { isDebugEnabled, debugLog } from './utils';

if (isDebugEnabled(layout)) { /* dev-only code */ }
debugLog('label', data); // no-op in production
```

- `isDebugEnabled(layout?)` — true when: URL has `?debug=true`, extension has `props.debug.enabled: true`, or on localhost
- `debugLog()` is always safe to call — it is a no-op unless debug mode is active
- Debug section in property panel is only injected when `isDebugEnabled()` returns true at panel definition time

## Selection Mode
- Treat selection mode as a modifier class: `.extension-container.in-selection`
- Keep container role and label stable across modes: `role="main"`, `aria-label="Qlik Sense Extension Content"`
- Selection API via `useSelections()` — session-based; state tracked per element in `selection-state.js`

## Test Environment
*All Playwright tests require a live Qlik environment — they are environment-gated*

```
test/
├── qs-ext.e2e.js          # Main test orchestrator (imports all modules)
├── qs-ext.connect.js      # Auth and connection utilities (.env driven)
├── lib/
│   ├── core/              # identifiers.js, configuration-identifiers.js, validation.js
│   ├── utilities/         # dom.js, json-editor.js, configuration-defaults.js, props-structure-analyzer.js
│   └── page-objects/      # nebula-hub.js — Page Object Model for Nebula Hub UI
└── modules/
    ├── connection.test.js              # Validates Nebula Hub URL + version (user intervention required on failure)
    ├── hub-ready.test.js               # Validates Nebula Hub controls + extension loaded (user intervention required on failure)
    └── extension-unconfigured.test.js  # Extension unconfigured state
```

**Environment setup**: See `docs/QLIK_CLOUD_SETUP.md` or `docs/QLIK_ENTERPRISE_SETUP.md`

**Test module responsibilities**: `connection.test.js` and `hub-ready.test.js` are infrastructure tests — failure means the environment is misconfigured and requires user intervention; the agent cannot fix these. `extension-unconfigured.test.js` and any subsequent extension modules are code tests — failure indicates an extension bug or selector drift the agent can investigate and fix.

## Test Commands

```bash
npm test                                              # Run all tests
SKIP_OPEN_REPORT=1 npx playwright test --reporter=list                    # All tests, terminal output only
SKIP_OPEN_REPORT=1 npx playwright test --grep "test name" --reporter=list # Target by test/describe name
SKIP_OPEN_REPORT=1 npx playwright test --headed --reporter=list           # Headed mode for visual inspection
```

`SKIP_OPEN_REPORT=1` suppresses the automatic browser report on failure. `--grep` matches against test and describe block names.

## Nebula Hub DOM Patterns
*Verified against `@nebula.js/cli-serve` 6.8.0. Re-verify after version bumps.*

**Properties dialog**: `MuiDialog-root` carries `role="presentation"` — the actual dialog element is the child `div[role="dialog"].MuiDialog-paper`. Waiting on `.MuiDialog-root [role="dialog"]` will not resolve.

**MUI Accordion button**: The `MuiAccordionSummary-content` span is a direct child of a `<button class="MuiAccordionSummary-root">` tag. There is no `role="button"` ancestor — use `xpath=./parent::button` to reach the clickable element, not `xpath=./ancestor::*[@role="button"]`.

**Monaco editor — read**: `window.monaco` is not exposed in Nebula Hub. Read content by collecting all `.view-line` element text after expanding the editor container to force Monaco to render all lines (Monaco virtualizes rows — only visible lines exist in the DOM). Rendered text uses non-breaking spaces (U+00A0) for indentation — sanitize with `/[^\x20-\x7E\n]/g` before passing to `JSON.parse`.

**Monaco editor — write**: The `.monaco-editor textarea` is read-only by design. Write via clipboard paste — `page.keyboard.type()` triggers Monaco's bracket-matching autocomplete (typing `{` inserts `{}`, so `{}` becomes `{}}` and the JSON becomes invalid). Instead: click `.monaco-editor .view-lines` to focus, `Control+a` to select all, write content to the clipboard via `page.evaluate(() => navigator.clipboard.writeText(content))`, then `Control+v` to paste. Requires `permissions: ['clipboard-read', 'clipboard-write']` in the Playwright project config — clipboard API is blocked by default in headless Chromium.

**Extension name aria-label ambiguity**: Nebula Hub renders both the extension container `div` and a title `h6` with `aria-label` equal to the extension name. An unscoped `[aria-label="name"]` selector triggers Playwright strict mode violations — always scope to the element type: `div[aria-label="name"]`.

## Test Teardown — Why resetConfiguration() Matters

`hub.resetConfiguration()` in `afterEach` writes `{}` to the Monaco editor and confirms. This is not cosmetic cleanup — Nebula Hub caches the extension's property object in memory for the session. Without this reset, configured values (dimensions, measures, custom props) survive page reload within the same browser context and bleed into the next test. Tests that look isolated can fail or produce wrong results when run in sequence. Any test that configures the extension (adds dimensions/measures, changes props values) **must** have teardown that calls `resetConfiguration()` — or the suite is order-dependent.

## Test Utilities — Single Source of Truth

Test utilities that validate extension defaults must import directly from the source files:

```javascript
import objectProperties from '../../../src/qae/object-properties.js';
import dataConfig from '../../../src/qae/data.js';
```

`src/qae/object-properties.js` imports `package.json` with `with { type: 'json' }` — required for Node's native ESM loader (Nebula's webpack build does not need this assertion, but the Playwright test runner does). Do not create mirror/hardcoded copies of these values in test utilities — changes to source files must immediately surface as test failures.

## Playwright Robustness Patterns
- Re-query locators after interactions — do not cache handles across actions (avoids stale element errors)
- Prefer keyboard-first interactions (Enter/Space); use bottom-most list items to avoid overlay interference
- Add small waits after modal confirmations in headed mode for visibility stability
- Use `hub.page.locator()` for all selectors — never scope off a cached ancestor locator across async boundaries (stale element errors)
- **Infrastructure test failure messages**: pass a user-facing message as the second argument to `expect()` — `await expect(locator, 'message explaining cause and action').toBeVisible()` — this surfaces directly in the Playwright failure output without requiring try/catch; use this pattern in `connection.test.js` and `hub-ready.test.js` where failures require developer action, not code fixes

## Build and Package

```bash
npm run lint     # ESLint — must pass before committing
npm run build    # Nebula CLI build → dist/ (gitignored)
npm run serve    # Dev server → http://localhost:8077 (auto-starts for tests)
npm run package  # Package extension → qs-ext-jump-start-ext/ (gitignored, generated artifact)
npm test         # Playwright E2E (requires .env + live Qlik)
```

## Module System

- `src/` — ESM (`import`/`export`)
- `test/` — ESM (`import`/`export`)
- `package.json` — `"type": "module"` (all `.js` files are ESM)

## OSS Reference Patterns
When generating new extension code, prefer patterns from Qlik's first-party `sn-*` repositories on GitHub (`github.com/qlik-oss`) as the authoritative reference for idiomatic Nebula.js usage.

## Extension Deployment
1. `npm run package` — generates `qs-ext-jump-start-ext/` (gitignored; versioned by `package.json` only)
2. Zip the `-ext/` folder
3. Upload via QMC (Enterprise) or Tenant Admin (Cloud)

See `docs/DEPLOYMENT.md` for full instructions.

---
*Load this domain when working on extension source, test infrastructure, or property panel configuration.*
*Combine with `project/standards.md` for complete development standards.*
