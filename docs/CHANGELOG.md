# Changelog

All notable changes to the QS-Ext-Jump-Start template project are documented here.

QS-Ext-Jump-Start is a template for Qlik Sense extension development. The template provides example code, testing setup, and guides to help accelerate extension development. For technical details, see code files in `src/` and `test/`.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive documentation review and cleanup
- Corrected project file structure diagrams
- Enhanced template focus for extension development acceleration
- Documented two usage workflows (contribute as fork, use as starter)
- New guides: `docs/PROJECT_STRUCTURE.md`, `docs/WORKFLOWS.md`
- Rename & Rebrand checklist in Workflows
- Recommended VS Code extensions in README and `.vscode/extensions.json`

### Changed

- Updated docs tone to be concise and evidence-based
- Fixed references from `reports/` to `report/` across docs
- Clarified deployment packaging output naming
- Improved inline JSDoc/context in `src/`

### Removed

- Eliminated overstated claims (e.g., “100% success rate”)

## [0.2.0] - 2025-08-21

### 🚀 Improved Testing Framework

**Major Enhancement**: Complete rewrite of testing architecture

#### Testing Infrastructure

- **Validated Test Suite**: 13 tests pass reliably in current configuration
- **Nebula Hub Integration**: Tests use Nebula hub interactions vs mock configuration
- **Dynamic Tracking System**: Intelligent cleanup removes test configured items, preventing side effects
- **Two-Step Measure Configuration**: Proper field → aggregation selection workflow
- **MUI Compatibility**: Handles Material-UI backdrop interference automatically

#### Test Architecture (see `test/helpers/test-utils.js`)

- `configureExtension()` - Main orchestrator with dynamic item tracking
- `configureDimensions()` - Real "Add dimension" dropdown interactions
- `configureMeasures()` - Two-step measure process with aggregation selection
- `cleanupExtensionConfiguration()` - Targeted removal based on tracked items
- `clickWithBackdropHandling()` - Reusable MUI interaction helper

#### Test Organization (see `test/states/`)

- **No-Data State** (3 tests) - Default extension state, always reachable
- **Data State** (3 tests) - Configured extension with Nebula configuration
- **Selection State** (2 tests) - User interaction simulation (incomplete. stub.)
- **Error State** (2 tests) - Error condition handling (incomplete. stub.)
- **Common Functionality** (3 tests) - Cross-state features and accessibility

### 🏗️ Code Quality Improvements

#### ESLint & Code Standards (see `eslint.config.js` and source files)

- **Zero Linting Errors**: All files pass ESLint validation
- **Consistent Naming**: Clear variable and function naming conventions
- **JSDoc Documentation**: Comprehensive function documentation throughout
- **Error Handling**: Production-grade try/catch blocks with meaningful logging

#### File Structure Optimization

- **Modular Architecture**: Clear separation between extension logic and testing
- **QAE Organization**: Properties and data sources properly structured in `src/qae/`
- **Test Utilities**: Reusable testing functions in `test/helpers/`
- **State-Based Tests**: Organized test modules in `test/states/`

### 🔧 Technical Improvements

#### Extension Development (see `src/` directory)

- **Modern Structure**: Updated file organization following Nebula.js best practices
- **Enhanced Properties**: Improved object properties configuration
- **Data Processing**: Optimized data handling and transformation
- **Utility Functions**: Common helper functions for extension development

#### Development Workflow

- **Hot Reload**: Development server with instant updates
- **Package Scripts**: Streamlined build, test, and package for deployment commands
- **Environment Setup**: Simplified configuration for Qlik Cloud and Enterprise

### 🐛 Bug Fixes

#### Test Reliability

- **Render Count Dependencies**: Eliminated hard-coded selectors that failed after viewport changes
- **MUI Backdrop Issues**: Fixed Material-UI interference preventing dropdown selections
- **Cleanup Logic**: Corrected cleanup to remove only configured items, not unrelated elements
- **Timing Issues**: Improved synchronization for Nebula hub interactions

#### Configuration Process

- **Measure Workflow**: Fixed to use proper two-step Nebula process (field → aggregation)
- **Dynamic Selectors**: Implemented fallback strategies for robust element detection
- **State Detection**: Enhanced extension state recognition and validation

### 📋 Documentation Overhaul

#### Comprehensive Guides (see `docs/` directory)

- **Testing Guide** (`docs/TESTING.md`) - Complete usage-focused testing documentation
- **Setup Guides** - Environment-specific configuration for Qlik Cloud and Enterprise
- **Deployment Guide** - Automated packaging and deployment instructions
- **Knowledge Base** (`KNOWLEDGE_BASE.md`) - Development patterns and best practices

#### Template Focus

- **Acceleration-Oriented**: Documentation emphasizes how template speeds extension development
- **Production-Ready**: Highlights enterprise-grade testing and deployment capabilities
- **Clear Structure**: Simplified navigation and reduced redundancy

### ⚡ Performance Enhancements

#### Test Execution

- **Optimized Suite**: Reduced from 21 to 13 tests to simplify and reduce redundancy
- **Efficient Selectors**: Targeted DOM queries with multiple fallback strategies
- **Smart Timeouts**: Appropriate wait times for Nebula hub interactions
- **Resource Management**: Proper browser context and page cleanup

#### Development Experience

- **Faster Iteration**: Quick test feedback with detailed logging
- **Debug Support**: Visual debugging and step-by-step execution modes
- **Error Diagnostics**: Clear failure messages with troubleshooting guidance

## [0.1.0] - 2025-08-20

### 🎯 Initial Template Release

#### Core Extension Template

- **Nebula.js Integration**: Modern extension structure with React hooks
- **Basic Testing**: Initial Playwright E2E test framework
- **Development Tools**: Nebula CLI integration with hot reload
- **Project Structure**: Organized source code and build configuration

#### Foundation Features

- **Extension Boilerplate**: Complete Qlik Sense extension template
- **Property Panel**: Basic object properties configuration
- **Data Integration**: Sample data processing and visualization
- **Build System**: Automated packaging for Qlik Sense deployment

#### Documentation Foundation

- **README**: Basic setup and usage instructions
- **Contributing**: Guidelines for template enhancement
- **Setup Guides**: Environment configuration for Qlik platforms

---

## Template Usage & Migration

### Using This Template

This template provides a starting point for Qlik Sense extension development, including example code, testing setup, and documentation. For technical details, see code in `src/` and `test/` folders.

1. Foundation: Extension structure with modern tooling
2. Automated Testing: Playwright-based suite with Nebula integration
3. Development Workflow: Hot reload, linting, packaging
4. Deployment Ready: One-command packaging for Qlik Sense environments

### Migrating to v0.2.0

If upgrading from v0.1.0, see the updated testing framework and code organization. Review code files for migration steps and details.

#### Key Changes

- **Test Configuration**: Now uses Nebula hub dropdown interactions
- **Measure Format**: Uses `{field, aggregation}` objects instead of expression strings
- **Cleanup System**: Targeted removal replaces generic cleanup approach

#### Migration Steps

1. **Update Dependencies**: Run `npm install` to get latest versions
2. **Test Data**: Ensure test app has required fields (`Dim1`, `Expression1`)
3. **Validate**: Run `npm test` to confirm all tests pass

### Template Benefits

- Faster development: Pre-configured tooling and examples
- Built-in testing: Example Playwright tests
- Best practices: Follows Nebula.js and Qlik extension standards

---

## Support & Resources

### Technical References

- **Source Code**: See `src/` directory for extension implementation patterns
- **Test Examples**: Review `test/` directory for testing strategies
- **Configuration**: Check `test/helpers/test-utils.js` for Nebula integration

### External Documentation

- **Nebula.js**: [qlik.dev/libraries-and-tools/nebulajs](https://qlik.dev/libraries-and-tools/nebulajs)
- **Qlik Developer Portal**: [qlik.dev](https://qlik.dev/)
- **Playwright Testing**: [playwright.dev](https://playwright.dev/)

### Contributing

This template benefits from community contributions. See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on enhancing the template for all users.

---

_This changelog documents template evolution to help developers understand capabilities and migration paths._
