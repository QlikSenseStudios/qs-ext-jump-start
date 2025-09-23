# Testing Guide

## Quick Start

This guide shows you how to use the Playwright testing framework for your Qlik Sense extension.

### What You Can Test

- ✅ **Connection Validation** - Validates Qlik Cloud connection and Nebula Hub access
- ✅ **Environment Validation** - Validates that your development environment is correctly configured
- ✅ **Extension Configuration** - Tests the extension's unconfigured state and configuration panel options

## 🏗️ Test Architecture

### Current Structure

```
test/
├── lib/                                    # 📚 Test Framework
│   ├── index.js                            # 🎯 Entry point
│   ├── core/                               # 🔧 Framework fundamentals
│   │   ├── identifiers.js                  # 🎯 DOM selectors and timeouts
│   │   ├── configuration-identifiers.js    # 🎛️ Configuration panel selectors
│   │   └── validation.js                   # ✅ Environment validation with caching
│   ├── utilities/                          # �️ Consolidated utility functions
│   │   ├── configuration-defaults.js       # ⚙️ Configuration defaults provider
│   │   ├── props-structure-analyzer.js     # 🔍 Dynamic props analysis
│   │   ├── dom.js                          # 🖱️ DOM interaction helpers
│   │   └── json-editor.js                  # 📝 JSON configuration handling
│   └── page-objects/                       # 📄 Page Object Models
│       └── nebula-hub.js                   # 🌟 Nebula Hub interactions
├── modules/                                # 📦 Test Modules
│   ├── connection.test.js                  # 🔗 Connection validation
│   ├── environment.test.js                 # 🌍 Environment validation
│   ├── extension-unconfigured.test.js      # 📋 Extension unconfigured state tests
│   └── index.js                            # 📄 Module exports
├── qs-ext.e2e.js                           # ✨ E2E test orchestrator
├── qs-ext.connect.js                       # 🔗 Qlik connection utilities
└── qlik-sense-app/                         # 📊 Test data
    └── load-script.qvs                     # Test data generation
```

### Modular Test Structure

Tests are organized into focused modules that are orchestrated by the main `qs-ext.e2e.js` file:

- **Connection Module** (`modules/connection.test.js`) - Validates Qlik Cloud connection and Nebula Hub access
- **Environment Module** (`modules/environment.test.js`) - Validates essential UI components are accessible
- **Extension Unconfigured Module** (`modules/extension-unconfigured.test.js`) - Tests extension unconfigured state and configuration options

### Test Types

The framework contains three main test suites:

#### Connection Test

Validates basic connectivity and Nebula Hub setup:

- Nebula.js version detection
- Qlik Cloud engine connection
- Page title and URL validation

#### Environment Test

Validates essential UI components are accessible:

- Property cache checkbox accessibility
- Modify properties button availability
- Extension view container presence

#### Extension Unconfigured State Test

Validates extension behavior and configuration options:

- Incomplete visualization display when unconfigured
- Configuration panel form elements (dimensions, measures, captions)
- Dynamic custom properties validation using MUI component patterns

### Page Object Model Pattern

The framework uses the Page Object Model pattern for clean, maintainable test code:

```javascript
// Using page object pattern for environment validation
const { NebulaHubPage } = require('./lib');
const { clearValidationCache } = require('./lib/core/validation');

test('validates environment components', async ({ page }) => {
  // Use page object for interactions
  const hub = new NebulaHubPage(page);
  const validation = await hub.validateEnvironment();

  expect(validation.components.propertyCacheCheckbox).toBe(true);
  expect(validation.components.modifyPropertiesButton).toBe(true);
  expect(validation.components.extensionView).toBe(true);

  // Clean up validation cache
  clearValidationCache(page);
});
```

### Dynamic Configuration Testing

The extension unconfigured state test includes dynamic configuration validation:

```javascript
// Dynamic validation against object-properties.js
const { getExpectedConfigurationDefaults } = require('../lib/utilities/configuration-defaults');
const { analyzePropsStructure } = require('../lib/utilities/props-structure-analyzer');

// Tests automatically adapt to changes in object-properties.js
const expectedDefaults = getExpectedConfigurationDefaults();
const propsStructure = analyzePropsStructure(expectedDefaults.props);

// Validate configuration elements match expected defaults
expect(titleValue).toBe(expectedDefaults.title);
expect(isChecked).toBe(expectedDefaults.showTitles);
```

### Framework Components

Essential utilities for comprehensive extension testing:

- **Core Identifiers** (`lib/core/identifiers.js`) - Centralized DOM selectors and timeouts
- **Configuration Identifiers** (`lib/core/configuration-identifiers.js`) - Specialized configuration panel selectors
- **Validation Functions** (`lib/core/validation.js`) - Environment validation with caching
- **Configuration Defaults** (`lib/utilities/configuration-defaults.js`) - Imports defaults from source files
- **Props Structure Analyzer** (`lib/utilities/props-structure-analyzer.js`) - Dynamic MUI component analysis
- **Page Objects** (`lib/page-objects/nebula-hub.js`) - Encapsulated UI interaction patterns
- **DOM Utilities** (`lib/utilities/dom.js`) - Safe DOM interaction helpers
- **JSON Editor** (`lib/utilities/json-editor.js`) - JSON configuration handling

Key features:

- Dynamic property structure analysis adapts to changes in `object-properties.js`
- MUI component navigation patterns handle deeply nested DOM structures
- Smart validation caching eliminates redundant DOM queries
- Configuration defaults sourced directly from extension files
- Comprehensive error handling with detailed logging
- Consistent timing with standardized timeout values

## ⚡ Performance Optimizations

The testing framework includes performance optimizations for reliable test execution:

### **Clean Setup & Teardown Structure**

Tests use targeted setup/teardown that matches actual requirements:

```javascript
test.describe('Qlik Sense Extension E2E Tests', () => {
  // Base setup for all tests
  test.beforeEach(async () => {
    page = await context.newPage();
    await page.goto(`/dev/${nebulaQueryString}`, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async () => {
    await page.close(); // Clean page closure
  });

  // Extension tests with targeted cleanup
  test.describe('Extension Development Tests', () => {
    test.beforeEach(async () => {
      hub = new NebulaHubPage(page);
    });

    test.afterEach(async () => {
      // Clear validation cache for clean state
      const { clearValidationCache } = require('./lib/core/validation');
      clearValidationCache(page);

      // Reset extension configuration if modified
      await hub.resetConfiguration();
    });
  });
});
```

**Benefits:**

- ✅ **Targeted Cleanup**: Only cleans up what was actually modified
- ✅ **Fast Execution**: Minimal setup/teardown overhead
- ✅ **Clear Logging**: Explicit logging of cleanup operations

### **Optimized Timeouts**

- **Standard timeouts**: 5 seconds for most element detection
- **Fast checks**: 2 seconds for quick existence checks
- **Network operations**: 10 seconds for API calls and data loading
- **Form elements**: 3 seconds for configuration panel interactions
- **Element transitions**: 500ms for UI animations and accordion expansion

### **Smart Validation Caching**

Environment validation results are cached to avoid redundant DOM queries during test execution. Cache is cleared between test runs to ensure clean state.

### **Dynamic Property Validation**

The framework includes dynamic property structure analysis that adapts to changes in extension configuration:

- Properties are analyzed from `object-properties.js` at runtime
- MUI selectors are generated dynamically for each property type
- Tests gracefully handle empty props objects or complex nested structures
- Configuration defaults are imported directly from source files for accurate validation

### Environment Validation and Cleanup

The testing framework provides environment validation and cleanup:

1. **Environment Validation** - Cached validation of essential UI components
2. **Configuration Testing** - Page object interactions for configuration dialogs
3. **Cache Management** - Clear validation caches for clean test state
4. **Comprehensive Logging** - Detailed status reporting with emoji indicators

The cleanup uses the `NebulaHubPage` page object model and `clearValidationCache()` function.

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

The framework runs three main test suites for comprehensive extension validation:

| Test                            | Description                                                      |
| ------------------------------- | ---------------------------------------------------------------- |
| **Connection Test**             | Validates Qlik Cloud connection and Nebula Hub access            |
| **Environment Test**            | Validates essential UI components are accessible                 |
| **Extension Unconfigured Test** | Validates extension unconfigured state and configuration options |

### Test Coverage Details

#### Connection Test

- Nebula.js version detection
- Qlik Cloud engine URL validation
- Page title and application element validation
- Development mode URL verification

#### Environment Test

- Property cache checkbox accessibility (configuration panel identifier)
- Modify properties button availability (JSON configuration access)
- Extension view container presence (extension rendering validation)

#### Extension Unconfigured Test

- **Incomplete visualization display** - Validates "Incomplete visualization" message when unconfigured
- **Configuration panel validation** - Tests data configuration buttons (Add Dimension, Add Measure)
- **Caption properties validation** - Tests title, subtitle, footnote fields with dynamic defaults
- **Custom properties validation** - Dynamic MUI component testing with props structure analysis

These tests ensure your development environment is correctly configured and the extension behaves properly in its unconfigured state.

### Nebula Hub Integration

The framework tests **Nebula hub interface interactions** for environment validation, ensuring the development environment is properly configured for extension development.

The page object model in `test/lib/page-objects/nebula-hub.js` encapsulates common interaction patterns.

### Test Data Configuration

The test environment uses data from `test/qlik-sense-app/load-script.qvs`. This script provides test dimensions and measures needed for environment validation.

To extend test data, modify the load script in your test Qlik Sense application:

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

**❌ Tests fail with timeout errors**

```
✅ Solution: Check your environment configuration
- Verify your Qlik Cloud/Enterprise connection
- Ensure extension loads in Nebula Hub
- Confirm test application has required data
```

**❌ "Component not found" errors**

```
✅ Solution: Verify Nebula Hub interface accessibility
- Check that property panel is accessible
- Ensure extension is properly loaded
- Run with --headed to see visual state
```

### Debug Mode

Use debug mode to see exactly what's happening:

```bash
# Visual debugging - see interface interactions
npx playwright test --headed --grep "Environment"

# Step-by-step debugging - pause execution
npx playwright test --debug

# Single worker for consistent behavior
npx playwright test --headed --workers=1
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

### Common Testing Patterns

- Use page object model for consistent interactions: `new NebulaHubPage(page)`
- Clear validation cache between tests: `clearValidationCache(page)`
- Handle MUI backdrop interference with `clickWithBackdropHandling()`
- Use `waitForEnvironmentReady()` for proper page initialization

## 📖 Technical Details

> 💡 **For Historical Details**: See [CHANGELOG.md](./CHANGELOG.md) for version history and technical improvements

### Key Components

| Component         | Purpose                            | Location                 |
| ----------------- | ---------------------------------- | ------------------------ |
| `nebula-hub.js`   | Page object model for interactions | `test/lib/page-objects/` |
| `validation.js`   | Environment validation logic       | `test/lib/core/`         |
| `qs-ext.e2e.js`   | Main test orchestrator             | `test/`                  |
| `load-script.qvs` | Test data generation               | `test/qlik-sense-app/`   |

## 🚀 What's Next

### Extending the Framework

1. **Add New Tests**: Extend the existing test structure for additional validation
2. **Custom Page Objects**: Create additional page objects for specific UI interactions
3. **Enhanced Validation**: Add more comprehensive environment validation checks

### Contributing

When enhancing the testing framework:

1. Keep environment validation tests passing reliably
2. Update documentation to reflect changes
3. Follow the established page object model architecture
4. Ensure tests clean up after themselves

---

---

_This guide describes the current testing framework functionality. For version history, see [CHANGELOG.md](./CHANGELOG.md)._
