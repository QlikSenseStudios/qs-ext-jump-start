# Testing Guide

## Quick Start

This guide shows you how to use the Playwright testing framework for your Qlik Sense extension. For project updates and version history, see [CHANGELOG.md](./CHANGELOG.md).

### What You Can Test

- ✅ **Extension Rendering** - Validates UI across all states
- ✅ **Nebula Configuration** - Real dropdown interactions for dimensions/measures
- ❌ **Declarative Rendering** - NON-FUNCTIONAL BETA (all tests disabled)
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
│  ├── declarative-rendering.test.js # Declarative rendering
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
- **Declarative Rendering** - NON-FUNCTIONAL BETA (tests disabled) ❌
- **Common Functionality** - Universal features across all states ✅

### Helper Utilities and Patterns

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

### Teardown and Cleanup

Each test performs targeted cleanup and a properties reset to avoid state leakage:

1. Remove only items added during configuration (`cleanupExtensionConfiguration`).
2. Clear all selections via toolbar/button.
3. Open the properties dialog (gear, title="Modify object properties"), replace JSON with `{}`, and Confirm.
4. Waits use shared WAIT buckets (TINY/SHORT/MED/LONG/XLONG) for clarity and consistency.

### Declarative Rendering Tests

**Status**: ❌ **NON-FUNCTIONAL BETA** - All tests disabled, implementation not functional

The declarative rendering test module (`test/states/declarative-rendering.test.js`) contains a comprehensive test suite, but is currently disabled due to the feature being non-functional.

**Current Status:**

❌ **ALL TESTS DISABLED**: The declarative rendering feature is NON-FUNCTIONAL BETA work in progress:

1. **Implementation Exists**: Complete codebase with 5 view types implemented
2. **Activation Issues**: `shouldUseDeclarativeRendering()` never activates despite proper configuration
3. **No DOM Output**: No declarative elements are ever generated
4. **Test Suite Disabled**: All 12 tests are disabled with proper skip indicators

**Implementation Details:**

- **Test Framework**: Complete test suite with 12 comprehensive tests (disabled)
- **Coverage Areas**: Configuration, accessibility, responsive behavior, performance
- **View Types**: All 5 view types have test coverage (dataTableView, dashboardView, flexibleContentView, errorStateView, loadingStateView)
- **Code Preservation**: Implementation preserved for future development

**Disabled Test Coverage:**

- **Configuration Tests**: JSON and property panel configuration (disabled)
- **View Type Tests**: All 5 declarative configurations (disabled)
- **Integration Tests**: Data configuration and fallback mechanisms (disabled)
- **Responsive Tests**: Multi-viewport testing (disabled)
- **Accessibility Tests**: ARIA attributes and keyboard navigation (disabled)
- **Performance Tests**: Configuration and rendering performance (disabled)

**For Developers:**

⚠️ **NON-FUNCTIONAL STATUS**:

1. **Safe Codebase**: Disabled tests don't interfere with working features
2. **Future Development**: Implementation structure preserved for future work
3. **Documentation**: Complete documentation available in the Declarative Rendering extension below
4. **Alternative Approaches**: Use working template system for customization

**Test Execution:**

```bash
# All declarative rendering tests are skipped
npm test -- --grep "Declarative Rendering"  # Will skip all tests with NON-FUNCTIONAL BETA messages

# Test specific configurations
npm test -- --grep "Data Table View"
npm test -- --grep "Dashboard View"
npm test -- --grep "Flexible Content View"
```

## 🚀 Running Tests

```
npm test

npx playwright test --headed

npx playwright test --grep "your test name" --debug

npx playwright show-report test/report

# Local quality gate reporter
npm test -s -- --reporter=list
```

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

# Note: slowMo is not supported in this workflow. Prefer --debug or --headed with fewer workers.
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

### Common Flakiness Fixes

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

---

## 📋 Extension: Declarative Rendering (NON-FUNCTIONAL BETA)

**⚠️ WARNING: This feature is NON-FUNCTIONAL BETA work in progress. Implementation exists but does not activate properly.**

### Status: NON-FUNCTIONAL BETA

The declarative rendering system represents a comprehensive attempt to create configurable UI components for Qlik Sense extensions, but the implementation is not functional in its current state.

### Architecture Overview

#### Implementation Structure

The declarative rendering system includes:

- **Configuration Schema**: JSON-based configuration for 5 different view types
- **Template System**: Declarative templates for each view type
- **Integration Layer**: Connection between configuration and rendering pipeline
- **Test Framework**: Comprehensive test suite (currently disabled)

#### View Types (All Non-Functional)

1. **dataTableView** - Tabular data presentation
2. **dashboardView** - Dashboard-style layout
3. **flexibleContentView** - Flexible layout system
4. **errorStateView** - Error state rendering
5. **loadingStateView** - Loading state display

### Implementation Files

#### Core Files

- `src/rendering/declarative-integration.js` - Main integration logic
- `src/rendering/template-manager.js` - Template management system
- `src/rendering/views/` - Individual view implementations

#### Configuration

- Property panel integration for JSON configuration
- `useDeclarativeRendering` toggle
- `declarativeConfig` options for view selection

#### Testing (Disabled)

- `test/states/declarative-rendering.test.js` - Comprehensive test suite (disabled)
- E2E test integration in `test/qs-ext.e2e.js` (disabled)

### Known Issues

#### Primary Issue: Activation Failure

The core problem is in the activation logic:

```javascript
// From src/rendering/declarative-integration.js
function shouldUseDeclarativeRendering(layout) {
  // This function never returns true despite proper configuration
  return layout.useDeclarativeRendering === true;
}
```

**Problem**: Even when `useDeclarativeRendering` is properly configured via JSON, the function doesn't activate declarative rendering.

#### Secondary Issues

1. **Integration Gaps**: Gaps between configuration detection and rendering pipeline
2. **Template Activation**: Declarative templates never override the default template system
3. **DOM Generation**: No declarative DOM elements are ever generated

### Configuration Approach

#### JSON Configuration (Attempted)

Users can modify the extension's configuration via "Modify object properties" dialog:

```json
{
  "useDeclarativeRendering": true,
  "declarativeConfig": {
    "viewType": "dataTableView",
    "options": {
      "showHeaders": true,
      "alternatingRows": true
    }
  }
}
```

**Result**: Configuration is accepted but no rendering changes occur.

#### Property Panel (Attempted)

Property panel controls exist for:

- Enabling declarative rendering
- Selecting view type
- Configuring view-specific options

**Result**: Controls are accessible but selections don't activate declarative rendering.

### Test Suite Status

#### Test Coverage (All Disabled)

The comprehensive test suite includes 12 tests covering:

1. Basic configuration via JSON
2. Property panel accessibility
3. All 5 view type configurations
4. Fallback mechanism validation
5. Data configuration integration
6. Responsive behavior testing
7. Accessibility validation
8. Performance testing

#### Test Disabling

All tests are disabled with:

```javascript
test.describe.skip('Declarative Rendering - DISABLED (NON-FUNCTIONAL BETA)', () => {
  // All tests throw NON-FUNCTIONAL BETA errors
});
```

### Development History

#### What Was Attempted

1. **Complete Implementation**: Full declarative rendering system implemented
2. **Multiple Approaches**: Both JSON and property panel configuration methods
3. **Comprehensive Testing**: Full test suite developed and validated
4. **Documentation**: Complete documentation of intended functionality

#### Discovery Process

Through extensive testing, we discovered:

- Configuration systems work properly
- Template structures exist and are well-designed
- Activation logic prevents any actual rendering
- No declarative DOM elements are ever generated

### Future Development

#### Required Work

To make this feature functional:

1. **Debug Activation Logic**: Fix `shouldUseDeclarativeRendering()` function
2. **Integration Fixes**: Bridge configuration to rendering pipeline
3. **Template System**: Connect declarative templates to DOM generation
4. **Testing**: Re-enable and validate test suite

#### Estimated Effort

This represents significant development work:

- **Core Fixes**: 1-2 weeks of debugging and integration work
- **Testing**: 1 week of test re-enabling and validation
- **Documentation**: 1-2 days of guide updates

### For Developers

#### Code Preservation

The implementation is preserved for future development:

- All source files remain intact
- Test framework structure maintained
- Configuration schemas documented
- Architecture decisions recorded

#### Safe Usage

The current codebase is safe to use:

- Disabled features don't interfere with working functionality
- Property panel controls are non-destructive
- Test suite is safely disabled
- No performance impact from non-functional code

### Recommendations

1. **Focus on Working Features**: Use the template system and property configurations that are functional
2. **Future Iteration**: Consider this feature for a future development cycle when resources allow
3. **Alternative Approaches**: Use existing template customization for similar functionality
4. **Documentation**: Keep this documentation for future development reference

---

**Note**: This documentation serves as a complete record of the attempted implementation for future development teams who may choose to complete this feature.
