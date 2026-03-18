# Milestone 1 Audit — Baseline Validation

**Branch**: `chore/validate-baseline`  
**Date**: 2026-03-18  
**Purpose**: Document the verified state of the project before any rework begins. This file is a living reference for later milestones and will be removed in Milestone 6 once its findings are absorbed into updated documentation.

---

## Build & Tooling Results

| Command | Result | Notes |
|---|---|---|
| `npm run lint` | ✅ Pass | No errors or warnings |
| `npm run build` | ✅ Pass | `dist/` output generated cleanly |
| `npm run package` | ✅ Pass | `-ext/` output generated (gitignored; build artifact only) |

**`qs-ext-jump-start-ext/` is gitignored** (`*-ext/` pattern in `.gitignore`). The `.qext` manifest and bundled JS are generated artifacts — not source-controlled. Version tracking is `package.json` only.

---

## Test Results

Tests are run via `@playwright/test` and require a live Qlik environment. All tests are environment-gated; none can run without a configured `.env` pointing to a Qlik Cloud or Enterprise tenant.

| Test | Module | Status | Notes |
|---|---|---|---|
| `validates nebula hub connection` | `connection.test.js` | ✅ Pass | Validates Nebula Hub URL, title, version attribute, `#app` element |
| `validates environment components` | `environment.test.js` | ✅ Pass | Validates property cache checkbox, modify properties button, extension view |
| `validates incomplete visualization display when unconfigured` | `extension-unconfigured.test.js` | ✅ Pass | Confirms "Incomplete visualization" message renders when no data is configured |
| `validates custom properties configuration options` | `extension-unconfigured.test.js` | ⏭ Skipped | Broke with latest Nebula CLI/Hub version; DOM selectors no longer match |
| `validates JSON configuration matches object-properties.js defaults` | `extension-unconfigured.test.js` | ⏭ Skipped | Broke with latest Nebula CLI/Hub version; DOM selectors no longer match |

### Test Failure Root Cause

The two skipped tests interact with the Nebula Hub property panel UI (MUI components, configuration forms, JSON editor). The Nebula Hub DOM structure changed in recent `@nebula.js/cli-serve` releases, breaking the selectors in:

- `test/lib/core/configuration-identifiers.js`
- `test/lib/utilities/props-structure-analyzer.js`
- `test/lib/utilities/json-editor.js`
- `test/lib/page-objects/nebula-hub.js`

These tests require re-synchronization against the current Nebula Hub DOM. This work is deferred to a dedicated test rework milestone (post-Milestone 4). Even the currently passing tests may need a deep-dive review once the DOM is stable.

---

## Code Audit Findings

### Pre-Work Corrections

The following items from the initial pre-work audit were **not confirmed** during MS1 verification:

| Original Pre-Work Entry | Verified Outcome |
|---|---|
| "`.qext` version `0.5.0` vs `package.json` `0.6.0`" | **Non-issue.** `qs-ext-jump-start-ext/` is gitignored; `.qext` is a generated artifact, not a source file. |
| "Declarative rendering is dead code — `shouldUseDeclarativeRendering()` never activates" | **Not present.** No declarative rendering code exists in `src/ext.js` or `src/qae/object-properties.js`. Pre-work assumption was incorrect. |
| "`test/qs-ext.fixture.js` removed from ESLint config" | **Not present.** No fixture reference exists in `eslint.config.mjs`. |

### Confirmed Findings Requiring Action in Later Milestones

| Finding | Location | Target Milestone |
|---|---|---|
| `.aiconfig`, `.cursorignore` present at root; targeted for removal with new context system | root | Milestone 2 |
| `KNOWLEDGE_BASE.md` and `TODO.md` serve as informal AI context | root | Milestone 2 |
| No GitHub Actions workflows | `.github/workflows/` absent | Milestone 5 |
| Dual module system: `src/` is ESM; `test/` is CommonJS (`require`/`module.exports`) | `test/modules/`, `test/lib/` | Milestone 4.2 |
| `"type": "module"` not declared in `package.json` | `package.json` | Milestone 4.2 |
| Two Playwright tests skipped due to Nebula Hub DOM drift | `test/modules/extension-unconfigured.test.js` | Post-Milestone 4 |

### Source Code — No Issues Found

| Area | Finding |
|---|---|
| `src/index.js` | Supernova entry point — hooks and render lifecycle look correct |
| `src/ext.js` | Property panel definition — clean; debug section is conditionally included via `isDebugEnabled()` |
| `src/qae/object-properties.js` | Extension defaults — clean; version and subtitle sourced dynamically from `package.json` |
| `src/components/` | Component system — no dead code identified |
| `src/state/` | WeakMap-based state — no dead code identified |
| `src/templates/` | Template system — no dead code identified |

---

## Module System Notes

The current dual module system is a known technical debt item:

- `src/` — ESM (`import`/`export`)
- `test/` — CommonJS (`require`/`module.exports`)
- `eslint.config.mjs` — explicitly sets `sourceType: 'commonjs'` for `test/**/*.js`

This split has had a negative effect on working with the `qae/object-properties.js` system from tests. Full ESM migration is planned in **Milestone 4.2**.

---

## Items With No Required Action

- `sandbox/` — gitignored developer notes folder; rename to `.sandbox/` deferred to Milestone 4.3
- `dist/` — gitignored build output; no issues
- `qs-ext-jump-start-ext/` — gitignored generated package; no issues
- `test/report/` — gitignored Playwright HTML report; no issues
- `test/artifacts/` — gitignored Playwright failure artifacts; no issues
