# Testing Guide

## Quick Start

This guide shows you how to use the Playwright testing framework for your Qlik Sense extension. For project updates and version history, see [CHANGELOG.md](./CHANGELOG.md).

> Status: v0.4.0 — Expanded coverage (a11y, responsiveness, robustness) with hardened teardown

### What You Can Test

- ✅ **Extension Rendering** - Validates UI across all states
- ✅ **Nebula Configuration** - Real dropdown interactions for dimensions/measures
- ✅ **Accessibility Compliance** - ARIA attributes and keyboard navigation
- ✅ **Responsive Design** - Multi-viewport testing (mobile, tablet, desktop)
- ✅ **State Transitions** - No-data, data, selection, and error states
- ✅ **Robustness & Re-renders** - No duplicate containers/tables, resilient toggles, reload recovery

## 🏗️ Test Architecture

### Optimized Modular Structure

Test files are organized as follows:

```
test/
├── states/ # State-specific test modules
|  ├── no-data.test.js # No-data state
│  ├── data.test.js # Data state
│  ├── selection.test.js # Selection state
│  ├── error.test.js # Error state
│  ├── accessibility.test.js # Accessibility refinements
│  ├── responsiveness.test.js # Responsiveness & layout
│  └── robustness.test.js # Robustness & re-renders
│  └── common.test.js # Shared utilities
├── helpers/
│  └── test-utils.js # Nebula configuration & cleanup utilities
├── artifacts/ # Test screenshots and traces
├── report/  # HTML test report output
├── qlik-sense-app/
│  └── load-script.qvs # Test data generation script
├── qs-ext.e2e.js # Main test orchestration
├── qs-ext.connect.js # Qlik connection utilities
└── qs-ext.fixture.js # Test fixtures and setup
```

### State-Based Testing with Nebula Integration

Tests are organized by extension states with intelligent configuration:

- **No-Data State** - Default state, always reachable ✅
- **Data State** - Real Nebula hub configuration with dimensions/measures ✅
- **Selection State** - User interaction simulation ✅
- **Error State** - Error condition testing ✅
- **Common Functionality** - Universal features across all states ✅

### Helper Utilities and Patterns (v0.4.0)

- Stable selectors and signals
  - Root: `.njs-viz[data-render-count]`
  - Container: `.extension-container` and `.extension-container.in-selection`
  - Cells: `td.dim-cell.selectable-item`, stable ids via `[data-q-elem]`
  - States: `.no-data`, `.error-message`
- Shared helpers (see `test/helpers/test-utils.js`)
  - `configureExtension()`, `configureDimensions()`, `configureMeasures()`, `selectAggregation()`
  - `cleanupExtensionConfiguration()`, `clearAllSelections()`
  - `triggerSelectionMode()`
  - `resetPropertiesToEmptyJson()` — properties dialog → `{}` → Confirm
  - `clickWithBackdropHandling()` — handles MUI backdrops
  - WAIT buckets: `TINY/SHORT/MED/LONG/XLONG` for consistent timing
- Robust interaction patterns
  - Keyboard-first toggles (Enter/Space) preferred over clicks
  - Re-query locators after each iteration to avoid stale handles
  - Use bottom-most targets to avoid toolbar overlays
  - Selection-mode detection aligned on `.extension-container.in-selection`

### Teardown and Cleanup (v0.4.0)

Each test performs targeted cleanup and a properties reset to avoid state leakage:

1. Remove only items added during configuration (`cleanupExtensionConfiguration`).
2. Clear all selections via toolbar/button.
3. Open the properties dialog (gear, title="Modify object properties"), replace JSON with `{}`, and Confirm.
4. Small waits after text clear and Confirm improve stability in headed runs.

## 🚀 Running Tests

### Prerequisites

You need these tools installed:

1. **Node.js** (version 20+) - [Download here](https://nodejs.org/)
2. **Qlik Sense access** - Cloud or Enterprise environment
3. **Test application** - Created using our provided load script

### Step 1: Setup Your Environment

```bash
# Install all dependencies (includes Playwright and Nebula CLI)
npm install

# Install browser engines
npx playwright install
```

### Step 2: Configure Your Qlik Environment

Create a test application in Qlik Sense using the load script from `test/qlik-sense-app/load-script.qvs`. This provides the test data fields (`Dim1`, `Expression1`) needed for configuration testing.

Environment setup guides:

- [🌩️ Qlik Cloud Setup](./QLIK_CLOUD_SETUP.md)
- [🏢 Qlik Enterprise Setup](./QLIK_ENTERPRISE_SETUP.md)

### Step 3: Start Development Server

```bash
# Start Nebula CLI development server
npm run serve
```

### Step 4: Run Your Tests

```bash
# Run all tests
npm test

# Watch tests in browser
npx playwright test --headed

# Test specific functionality
npx playwright test --grep "Data State"

# Debug mode for troubleshooting
npx playwright test --debug

# Open the latest HTML report for this repo's path
npx playwright show-report test/report
```

## 📊 Understanding Test Structure

The framework runs tests organized by extension states:

| State         | Description                           |
| ------------- | ------------------------------------- |
| **No-Data**   | Default state - always reachable      |
| **Data**      | Configured with dimensions/measures   |
| **Selection** | User selection interaction simulation |
| **Error**     | Error condition handling              |
| **Common**    | Cross-state functionality             |

### Nebula Hub Integration

This framework uses **Nebula hub interface interactions** instead of programmatic configuration, testing end point behavior and results:

See code in `test/helpers/test-utils.js` for detailed implementation.

### Extending Test Data

Add your own test dimensions and data fields to the data load script of your test Qlik Sense application. Be sure to update the `test/qlik-sense-app/load-script.qvs` file to keep your project repository up to date.

Example:

```ebnf
MyTestTable:
Load * INLINE [
  YourDimension, YourMeasureField
  Value1, 100
  Value2, 200
  Value3, 300
];
```

## 🐛 Troubleshooting

### Common Issues & Solutions

**❌ Tests fail with "Add dimension button not found"**

```
✅ Solution: Verify your extension loads the Nebula hub interface
- Check that property panel is enabled
- Ensure extension is in edit mode
```

**❌ Configuration timeout errors**

```
✅ Solution: Check MUI backdrop interference
- Tests automatically handle this with force clicks
- Run with --headed to see visual interactions
```

**❌ "Field not found" during configuration**

```
✅ Solution: Verify test data is loaded
- Check your test app has the load script data
- Confirm field names match exactly (case-sensitive)
```

### Debug Mode

Use debug mode to see exactly what's happening:

```bash
# Visual debugging - see dropdown interactions
npx playwright test --headed --grep "Data State"

# Step-by-step debugging - pause execution
npx playwright test --debug

# Slow motion - see interactions clearly
npx playwright test --headed --slowMo=1000
```

Tip: For flake triage, prefer a single worker:

```bash
npx playwright test --headed --workers=1
```

### Performance Testing

Monitor test execution times:

```bash
# Generate detailed performance report
npx playwright test --reporter=html

# Run with timing information
npx playwright test --reporter=line

# Profile slow tests
npx playwright test --max-failures=1 --timeout=60000
```

### Common Flakiness Fixes (v0.4.0)

- If a click fails due to overlays, use `clickWithBackdropHandling()` or prefer keyboard toggles
- Re-query elements after DOM updates to avoid detached handles
- Use bottom-most cells to avoid overlapping toolbars and popovers
- Add small waits after confirming modal actions in headed mode

## 📖 Technical Details

> 💡 **For Historical Details**: See [CHANGELOG.md](./CHANGELOG.md) for version history and technical improvements

### Key Components

| Component         | Purpose                      | Location               |
| ----------------- | ---------------------------- | ---------------------- |
| `test-utils.js`   | Nebula interaction utilities | `test/helpers/`        |
| State modules     | Extension state testing      | `test/states/`         |
| Main orchestrator | Test organization            | `test/qs-ext.e2e.js`   |
| Load script       | Test data generation         | `test/qlik-sense-app/` |

## 🚀 What's Next

### Extending the Framework

1. **Add New States**: Create additional test modules in `test/states/`
2. **Custom Interactions**: Extend `test-utils.js` with your specific Nebula patterns
3. **Performance Tests**: Add timing and memory usage validation
4. **Visual Testing**: Implement screenshot comparison for UI consistency

### Contributing

When enhancing the testing framework:

1. Keep all tests passing reliably
2. Update documentation to reflect changes
3. Follow the established modular architecture
4. Ensure each test cleans up after itself

---

## 📚 Additional Resources

- **Setup Guides**: [Qlik Cloud](./QLIK_CLOUD_SETUP.md) | [Qlik Enterprise](./QLIK_ENTERPRISE_SETUP.md)
- **Project History**: [CHANGELOG.md](./CHANGELOG.md) - Version updates and technical changes
- **Playwright Docs**: [playwright.dev](https://playwright.dev/docs/intro)
- **Nebula.js Docs**: [qlik.dev/libraries-and-tools/nebulajs](https://qlik.dev/libraries-and-tools/nebulajs)

---

_This guide focuses on practical usage. For technical implementation details review the code files. For version history, see [CHANGELOG.md](./CHANGELOG.md)._
