# Test-Time Configuration Injection

**Roadmap entry**: Document nebula serve as webpack-based and add the globalSetup/globalTeardown file-swap pattern.
**Depends on**: testing-domain-split
**Complexity**: Low
**Execution tier**: light

## Target Files
- .ai-toolbox/domains/qlik-extension.md — modify — Technology Stack notes `@nebula.js/cli-serve` uses webpack + WebpackDevServer internally
- .ai-toolbox/domains/qlik-extension-testing.md — modify — new canonical section: test-time configuration injection via file swap

## Source Notes
`@nebula.js/cli-serve` uses **webpack** + WebpackDevServer internally. Nebula's webpack config defines only its own internal variables — there is no extension point for injecting user-defined values into the browser bundle at runtime. Source file substitution via Playwright's `globalSetup`/`globalTeardown` is therefore the correct pattern for making source files use different values during E2E tests:

1. Define test-time constants in a dedicated file (e.g., `test/lib/core/test-limits.js`)
2. `playwright.config.js`: register `globalSetup` and `globalTeardown`; set `reuseExistingServer: false`
3. `globalSetup` (runs before all tests and before the webServer): back up the target source file, write a test version using the test-time constants
4. `globalTeardown` (runs after all tests): restore the original file from backup
5. `reuseExistingServer: false` is required to force a fresh webpack compilation that compiles the test version into the bundle

**Recovery**: if the process is interrupted before teardown, `cp src/qae/data.js.bak src/qae/data.js` restores the original.

Use case: testing limit enforcement without repeating 8+ interactions per test.

## Prior Art in Repo
- playwright.config.js — currently has NO globalSetup/globalTeardown; this item documents the pattern (with an example skeleton), it does not necessarily wire it into the template config
- Related: plans/limits-single-source.md — once limits are exported from data.js, a limits swap file is the natural worked example

## Open Questions
- Documentation-only, or also ship a commented-out/example globalSetup in the scaffold? Notes recommend a concrete example skeleton in the doc
