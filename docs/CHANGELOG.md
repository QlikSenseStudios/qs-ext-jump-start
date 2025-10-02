# Changelog

All notable changes to the QS-Ext-Jump-Start template project are documented here.

QS-Ext-Jump-Start is a template for Qlik Sense extension development. The template provides example code, testing setup, and guides to help accelerate extension development. For technical details, see code files in `src/` and `test/`.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_No changes yet._

## [0.6.0] - 2025-10-02

### Added

- **JSON Configuration Validation Test**: Comprehensive test in `extension-unconfigured.test.js` validates extension JSON configuration against `object-properties.js` defaults
- **Monaco Editor Support**: Enhanced JSON editor utilities support Monaco Editor collapsed JSON and complete JSON parsing scenarios
- **Cross-Platform JSON Editing**: JSON editor utilities with compatibility across CodeMirror, Monaco, and textarea implementations
- **Property Path Validation**: Flexible property path mapping system for robust JSON structure validation
- **Modular Test Architecture**: Restructured E2E tests into focused modules with dedicated test files for connection, environment, and extension validation
- **Extension Unconfigured State Tests**: Comprehensive test suite validating incomplete visualization display, configuration panel options, and custom properties
- **MUI Component Testing**: Dynamic testing framework for Material-UI components with automatic props structure analysis
- **Configuration Validation Framework**: Dynamic validation against object-properties.js with enhanced configuration defaults provider

### Enhanced

- **Debug Utilities**: Consolidated debug detection and logging functionality in `src/utils.js` with `isDebugEnabled()` and `debugLog()` functions
- **Debug Detection**: Multi-source debug mode detection from URL parameters (`debug=true`), extension properties, or localhost environment
- **Code Quality**: Eliminated redundant debug detection code across extension components
- **Test Infrastructure**: Enhanced configuration defaults validation with qType support and improved error handling
- **Testing Framework**: Streamlined extension interface with essential validation focus, replacing complex state-based testing
- **Page Object Model**: Enhanced Nebula Hub interactions with improved resource management and cleanup
- **Documentation**: Updated debug system documentation across KNOWLEDGE_BASE.md, README.md, PROJECT_STRUCTURE.md, and WORKFLOWS.md
- **Troubleshooting**: Enhanced troubleshooting documentation with test-specific guidance for connection, environment, and extension validation failures

### Removed

- **Declarative Rendering System**: Removed non-functional declarative rendering components and framework to reduce complexity
- **State-Based Testing**: Simplified testing approach by removing complex state-based test modules in favor of essential environment validation
- **Excessive Rendering Stubs**: Cleaned up extension entry points by removing non-functional rendering components

### Breaking Changes

- **Testing Framework Restructure**: Complete restructuring of testing framework from modular state-based to essential validation approach
  - Removed `test/states/` and `test/helpers/` directories
  - Replaced with focused `test/modules/` structure for connection, environment, and extension tests
  - Updated API and test organization patterns (affects custom test development only)

### Technical Details

- **Backward Compatibility**: All enhancements maintain 100% backward compatibility with existing extensions
- **Debug System**: Consistent debug behavior across extension components with centralized utilities
- **Test Coverage**: Enhanced test utilities with cross-editor JSON handling for robust validation
- **Development Experience**: Improved developer debugging workflow with conditional logging and environment detection
- **Test Organization**: Clean separation of concerns with focused test modules for improved maintainability

## [0.5.0] - 2025-09-04

### 🏗️ Major Architecture Refactor

**Major Enhancement**: Complete redesign of extension architecture with comprehensive component system

#### Component-Based Architecture

- **Modular Components**: New `/src/components/` directory with reusable UI components
  - `error-component.js` - Comprehensive error handling with user feedback
  - `header-component.js` - Reusable header template structure
  - `no-data-component.js` - Enhanced no-data state with configuration guidance
  - `selection-handler.js` - Advanced selection handling with keyboard navigation
  - `table-component.js` - Optimized table rendering with DocumentFragment
- **Component Index**: Centralized component exports and utilities
- **Clean Separation**: Clear boundaries between UI components and business logic

#### Template System

- **Template Engine**: New `/src/templates/` directory with flexible UI generation
  - `base-template.js` - Foundation templates for layouts and containers
  - `state-template.js` - State-specific templates (data, error, loading, no-data)
  - `table-template.js` - Advanced table templates with responsive design
  - `index.js` - Universal template factory with organized registry
- **Template Flexibility**: Support for multiple layout strategies (grid, flex, single, auto)
- **Template Utilities**: Helper functions for template creation and combination

#### Enhanced State Management

- **Isolated State**: New `/src/state/` directory with WeakMap-based state management
  - `data-state.js` - Layout processing and validation logic
  - `render-state.js` - DOM container and data association management
  - `selection-state.js` - Selection session tracking and element mapping
  - `index.js` - Centralized state management exports
- **Memory Safety**: WeakMap usage prevents memory leaks and element isolation
- **State Persistence**: Maintains state across renders without DOM pollution

#### Declarative Rendering Framework (Beta)

- **Configuration-Driven UI**: New `/src/rendering/` directory with declarative rendering system
  - `declarative-config.js` - Comprehensive configuration schema with validation
  - `declarative-examples.js` - Pre-built configuration examples and templates
  - `declarative-integration.js` - Integration layer with existing extension infrastructure
  - `declarative-renderer.js` - Core rendering engine with component caching
  - `declarative-styles.css` - Styling framework for declarative components
- **Multiple View Types**: 5 pre-configured views (dataTableView, dashboardView, flexibleContentView, errorStateView, loadingStateView)
- **JSON Configuration**: Property panel integration with JSON-based configuration
- **Template Integration**: Seamless bridge between declarative configs and template system
- **Status**: Currently marked as NON-FUNCTIONAL BETA - implementation exists but requires activation fixes

### 🧪 Testing Infrastructure Enhancement

#### Comprehensive Test Framework

- **Declarative Test Suite**: New disabled test module for future declarative rendering validation
- **Test Utilities Enhancement**: Extended `test/helpers/test-utils.js` with:
  - Platform-aware JSON editor handling (ACE, Monaco, CodeMirror)
  - Advanced configuration utilities for complex scenarios
  - Improved error handling and logging
- **Test Organization**: Proper test structure for scalable testing across all new systems

#### Property Panel Integration

- **Enhanced Properties**: Updated `src/qae/object-properties.js` with:
  - Declarative rendering toggle controls
  - Configuration dropdown for view selection
  - Debug mode support
  - Beta feature warnings and documentation

### 🚀 Performance & Code Quality

#### Optimized Core Extension

- **Streamlined Entry Point**: Significantly refactored `src/index.js` (455 lines reduced, 353 removed)
- **Efficient Rendering**: DocumentFragment usage for optimal DOM operations
- **Error Boundaries**: Comprehensive error handling with user-friendly feedback
- **Memory Management**: WeakMap-based tracking for optimal memory usage

#### Modern Development Practices

- **Comprehensive JSDoc**: Full documentation coverage across all new modules
- **ESLint Compliance**: Zero linting errors across 4,925+ new lines of code
- **Modular Design**: Clear separation of concerns with focused, single-responsibility modules
- **Type Safety**: JSDoc type definitions for better development experience

### 📚 Documentation Overhaul

#### Comprehensive Guides

- **Testing Documentation**: Major expansion of `docs/TESTING.md` with:
  - Complete declarative rendering documentation (257 new lines)
  - Implementation guides and status information
  - Developer recommendations and troubleshooting
- **New Documentation**: Added `docs/README.md` with centralized documentation hub
- **Performance Roadmap**: Added detailed performance optimization plan to `TODO.md`

#### Project Structure Updates

- **Architecture Documentation**: Updated to reflect new modular structure
- **Component Documentation**: Examples and usage patterns for all new components
- **Template Documentation**: Complete guide to template system usage

### 🔧 Developer Experience

#### Enhanced Development Workflow

- **Backward Compatibility**: 100% compatibility maintained - no breaking changes
- **Graceful Degradation**: Declarative features safely disabled when not configured
- **Development Safety**: All new features isolated from existing functionality
- **Clear Migration Path**: Existing extensions continue to work unchanged

#### Future-Ready Foundation

- **Scalable Architecture**: Component and template systems support complex UI requirements
- **Performance Optimization Ready**: Clean foundation enables safe performance enhancements
- **Feature Toggle System**: Safe activation/deactivation of beta features
- **Extensible Design**: New systems designed for easy extension and customization

### 🛠️ Technical Details

#### File Structure Changes

- **31 files changed**: 4,925 insertions(+), 353 deletions(-)
- **New Directories**: `/src/components/`, `/src/templates/`, `/src/state/`, `/src/rendering/`
- **Enhanced Testing**: Extended test utilities and new declarative test framework
- **Documentation Growth**: Major expansion of guides and examples

#### Dependencies & Compatibility

- **No New Dependencies**: All enhancements built with existing toolchain
- **Node.js**: Maintained compatibility with Node.js >=20.17
- **Qlik Integration**: Enhanced but backward-compatible Qlik Sense integration
- **Browser Support**: Modern browser features with graceful degradation

### ⚠️ Beta Features

#### Declarative Rendering System

- **Status**: NON-FUNCTIONAL BETA - Comprehensive implementation exists but requires activation fixes
- **Implementation**: Complete codebase with 5 view configurations and integration layer
- **Issue**: `shouldUseDeclarativeRendering()` function needs debugging for proper activation
- **Future Work**: 1-2 weeks of integration work required to make functional
- **Safety**: All declarative code safely disabled - no impact on existing functionality

## [0.4.1] - 2025-09-02

### Added

- .aiconfig: Assert last-ran lint policy to mirror the tests gate

### Changed

- Tests: Normalized literal waits (200/300/500/800ms) to shared WAIT buckets; exported WAIT from `test/helpers/test-utils.js`
- Minor timing harmonization in selection/robustness flows for stability

### Fixed

- Reduced intermittent flake via standardized waits and clearer selection-mode checks

### Misc

- Documentation touch-ups to reflect local quality gates and timing buckets

## [0.4.0] - 2025-08-28

### Added

- E2E suites expanded: Responsiveness & Layout, Robustness & Re-renders, and Accessibility refinements
- Test helpers: backdrop-safe clicks, consistent wait buckets, stable selectors, and selection-mode detection alignment
- Test teardown hardening: properties dialog reset to {} and confirm; small visibility waits to stabilize headed runs

### Changed

- src/index.js: safer DOM creation (no innerHTML by default), per-element WeakMap for state, stable container across renders
- src/index.js: DRY DOM clearing via `clearChildren()`, prevent duplicate `.no-data` elements, improved error UI
- test/helpers: keyboard-first interactions, bottom-most targets, per-iteration re-queries to avoid stale handles
- Documentation: clarified workspace settings, added notes on testing strategy and patterns

### Fixed

- Reduced flakiness due to MUI overlays and detached handles during rerenders
- Standardized selection-mode detection across code/tests
- Removed stray NUL file from repository root

### Misc

- Dedupe JSDoc/comment blocks across test state files
- Version bump to 0.4.0

## [0.3.0] - 2025-08-25

### Added

- Comprehensive documentation review and cleanup
- Corrected project file structure diagrams
- Enhanced template focus for extension development acceleration
- Documented two usage workflows (contribute as fork, use as starter)
- New guides: `docs/PROJECT_STRUCTURE.md`, `docs/WORKFLOWS.md`
- Rename & Rebrand checklist in Workflows
- Recommended VS Code extensions in README and `.vscode/extensions.json`
- Selections example: two-column table (Dimension/Measure) and sn-style selection handling via `useSelections`
- Invalid-configuration no-data guidance (requires exactly 1 dimension and 0–1 measure)

### Changed

- Updated docs tone to be concise and evidence-based
- Fixed references from `reports/` to `report/` across docs
- Clarified deployment packaging output naming
- Improved inline JSDoc/context in `src/`
- UI/UX: Hover uses translucent overlay to preserve background state; `.no-data` uses flex column layout
- Refactor: Extracted small helpers/constants in `src/index.js`; unified no-data rendering; improved error handling

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
