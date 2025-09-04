# TODOs for QS-Ext-Jump-Start (Template Project)

This file lists suggested improvements and additions and their progress for the QS-Ext-Jump-Start template. Edit or expand as needed for your own extension project.

## Code Quality & Structure ✅

- [x] ~~Add TypeScript support or starter config~~ → ESLint configuration modernized
- [x] ~~Annotate key files with explanatory comments~~ → Added comprehensive JSDoc comments
- [x] Add component utilities for better code organization
- [x] Implement modern ESLint v9 configuration

## Accessibility & Internationalization ✅

- [x] ~~Add ARIA attributes and basic i18n support~~ → Comprehensive ARIA support added
- [x] Add keyboard navigation support
- [x] Add high contrast and reduced motion support

## Testing

- [x] Expand Playwright tests: responsiveness, accessibility refinements, robustness/re-renders, and error handling
- [ ] Add unit test setup (e.g., Jest) for non-UI logic
- [ ] Optional: Add visual regression tests (screenshots)

## Extension Features ✅

- [x] ~~Add more property examples (dimensions, measures, custom settings)~~ → Enhanced properties
- [x] ~~Improve error handling and user feedback~~ → Comprehensive error handling
- [x] Add basic styling and theming support
- [x] Selections example: 2-column table UI and sn-style selection flow
- [x] No-data guidance when configuration is invalid
- [ ] Optional: Keyboard shortcuts for confirm/cancel selection session

## Documentation ✅

- [x] ~~Add troubleshooting and FAQ sections~~ → Comprehensive docs/ folder structure
- [x] Document two usage workflows (fork vs starter)
- [x] Add Project Structure and Workflows guides
- [x] Fix references from `reports/` → `report/`
- [x] Add Rename & Rebrand checklist
- [x] Add VS Code extension recommendations
- [x] Update AI metadata (.aiconfig)
- [x] README selections example section
- [x] Changelog entry for 0.3.0

## Community & Support ✅

- [x] ~~Add CODEOWNERS, SECURITY.md, and support.md files~~ → Complete .github/ setup

## Deployment & Automation

- [ ] Add GitHub Actions workflows for linting, testing, and packaging
- [ ] Optional: Add release workflow to publish packaged zip as artifact
- [ ] Optional: Add automatic version bump and changelog verification

## Build & Tooling

- [ ] Optional: Switch package to ESM (add `"type": "module"`) to align with ESLint flat config
- [x] Version bump to 0.4.1 (test wait normalization, lint gate in .aiconfig)

## Reference & Inspiration ✅

- [x] ~~Document how to use sn-\* projects from Qlik OSS~~ → Added to knowledge base

## Recent Improvements ✅

- [x] Modern ESLint v9 configuration with flat config
- [x] Comprehensive accessibility features (ARIA, keyboard nav, high contrast)
- [x] Enhanced error handling and user feedback
- [x] Component utilities for better code organization
- [x] CSS styling with responsive and accessibility considerations
- [x] Improved testing with better coverage (a11y, responsiveness, robustness)
- [x] Enhanced property configurations with examples
- [x] Better documentation and JSDoc comments
- [x] Two usage workflows documented (fork vs starter)
- [x] Project Structure and Workflows guides added
- [x] Report folder naming aligned across docs
- [x] Rename & Rebrand checklist added
- [x] Recommended VS Code extensions added
- [x] AI metadata updated (.aiconfig)

## Declarative Rendering (❌ NON-FUNCTIONAL BETA)

**Status**: ❌ **NON-FUNCTIONAL BETA WORK IN PROGRESS** - Implementation exists but does not activate properly

### Current Status:

- [❌] **Core Implementation** - Codebase exists but `shouldUseDeclarativeRendering()` never activates
- [❌] **All Configurations Non-Functional** - None of the 5 declarative configurations work (dataTableView, dashboardView, flexibleContentView, errorStateView, loadingStateView)
- [❌] **Property Panel Integration** - Configuration possible but no actual rendering occurs
- [❌] **Test Suite** - All tests disabled and marked as NON-FUNCTIONAL BETA
- [❌] **Template System** - Exists in codebase but never used due to activation issues

### Issues Identified:

- [❌] **Activation Logic** - `shouldUseDeclarativeRendering()` function never returns true despite proper configuration
- [❌] **Integration Gaps** - Implementation gaps between configuration and actual rendering
- [❌] **Template Activation** - Declarative templates never override default template system
- [❌] **DOM Output** - No declarative DOM elements ever generated

### Work Completed:

- [✅] **Beta Code Structure** - Implementation framework exists and preserved
- [✅] **Configuration Schema** - JSON configuration structure defined
- [✅] **Template Structure** - Declarative template system outlined
- [✅] **Test Framework** - Comprehensive test suite exists (currently disabled)
- [✅] **Documentation** - Architecture documented for future development

### Future Work Required:

- [ ] **Debug Activation Logic** - Fix `shouldUseDeclarativeRendering()` to properly detect configuration
- [ ] **Integration Fixes** - Bridge gaps between configuration and rendering systems
- [ ] **Template System** - Connect declarative templates to rendering pipeline
- [ ] **Testing** - Re-enable test suite once functionality is working
- [ ] **Documentation** - Update guides once feature is functional

**Note**: This feature represents significant development work but is not functional in current state. Code preserved for future development iteration.

---

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
