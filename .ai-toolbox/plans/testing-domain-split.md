# Testing Domain Split

**Roadmap entry**: Create domains/qlik-extension-testing.md by moving testing content out of domains/qlik-extension.md; refresh the stale test-module listing.
**Depends on**: none (prerequisite for all Stage 5 testing-guidance items)
**Complexity**: Medium
**Execution tier**: standard

## Target Files
- .ai-toolbox/domains/qlik-extension-testing.md — create — testing sections moved here
- .ai-toolbox/domains/qlik-extension.md — modify — testing sections removed; pointer to the new file retained
- .ai-toolbox/context.global.md — modify — Available Contexts, Hierarchy Levels domain listing, Task-Based Paths (Test Environment Troubleshooting path currently points into qlik-extension.md sections)
- .ai-toolbox/README.md — modify — System Structure tree domains listing
- .ai-toolbox/domains/README.md — modify — available domains listing

## Source Notes
The downstream project split testing content into `qlik-extension-testing.md` and all subsequent testing findings target that file. qlik-extension.md is ~282 lines; roughly half its sections are testing-specific.

Candidate sections to move (current qlik-extension.md headings): Test Environment, Test Browser Session Model, Test App Broken State, Test Commands, Nebula Hub DOM Patterns, Test Teardown — Why resetConfiguration() Matters, Test Utilities — Single Source of Truth, Playwright Robustness Patterns, Test Debugging Protocol, Nebula Hub — Selection Mode DOM. Judgment needed on: Learning Protocol (applies to both), Known Environment Unknowns (split by topic or keep in one place).

**While moving, refresh the stale module listing**: the Test Environment module tree does not list `extensionSelectionsQlikTests` and `extensionPropsConfigTests`, which test/qs-ext.e2e.js imports via test/modules/index.js. Convert the listing into a combined table — module file → describe-block name → responsibility — which plans/targeted-test-commands.md later extends with --grep usage (one table, not two lists; DRY).

## Prior Art in Repo
- test/qs-ext.e2e.js + test/modules/index.js — authoritative module list for the refreshed table
- context.global.md Task-Based Paths — "Test Environment Troubleshooting: → domains/qlik-extension.md (Test Environment + Test Debugging Protocol sections)" must be repointed

## Open Questions
- Boundary calls: DOM patterns used by both runtime debugging and tests (e.g., Nebula Hub DOM Patterns) — testing file is the likely home since they exist for test automation
- Does the Extension Feature Development loading path gain the testing file, or is it loaded only via the troubleshooting path?
