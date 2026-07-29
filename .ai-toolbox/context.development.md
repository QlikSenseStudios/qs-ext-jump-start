# qs-ext-jump-start — Template Development Context

**TEMPLATE DEVELOPMENT ROOT CONTEXT**: Load this before `context.global.md` when working ON the qs-ext-jump-start template itself — enhancing, maintaining, or improving it as a reusable Qlik extension starting point.

## Template Development Mode

- **Purpose**: Working ON the qs-ext-jump-start template, not using it to build a specific Qlik extension
- **State**: Template enhancement and maintenance
- **Context Hierarchy**: This file → context.global.md → operational contexts
- **Scope**: Template architecture, boilerplate improvements, documentation, and context system enhancements
- **Context Placement**: Anything that applies only while working ON the template — and is not relevant to extension developers — belongs in this file. This file is deleted at initialization, so anything here must be safe to lose from the extension developer's perspective. If a rule or principle is useful to extension developers, it belongs in `context.global.md` or another surviving context file instead.
- **Extension-Mode File Protection**: `tools/`, `domains/`, `project/`, and `context.state.md` are written for extension developers — do not add template development state, progress notes, or temporary tracking to these files. Any template-dev-only content in these files becomes a trace visible to extension developers. Template development tracking lives in exactly two places: this file's Upcoming Work section (the item list) and `plans/` (one pre-planning context file per item — deleted at initialization along with this file; the `plans/` folder and its README survive as a generic context-system feature).

## Dual Context Overview

_The two distinct ways this project is used. (The context struggle is real)_

1. **Template Development** (this file): Improving the qs-ext-jump-start as a reusable starting point for Qlik extension developers.
   - Forked repository
   - Changes must be generic and reusable — not tied to a specific extension's business logic
   - This file overrides (yet uses) the boilerplate context to ensure it self-follows the rules.
   - The template is a product that allows collaboration development; it must operate with development context for collaborators who fork it

2. **Extension Development** (`context.global.md`): Using the jump-start as a foundation for building an actual Qlik Sense extension.
   - Fresh repository started with "Use this template" or by downloaded zipped codebase.
   - `context.global.md` is the primary entry point
   - The user will initialize their own extension project using the provided initialization command, which will delete this file.
   - The user will then use this base extension to develop their extension project.
   - The extension project must then feel like it belongs to the user and their project so it should not self-reference as a "template" or "boilerplate" in user-facing documentation or contexts.

## Template Development Language Rules

_Critical: Applied to ALL documentation and context files during template enhancement_

### User-Facing Language Standards

- **Template References**: Refer to this project as the "jump-start" or "template" — not "your extension" or "your project"
- **User Perspective**: Write user-facing documentation as if a developer has just downloaded the source or used "Use this template" and is about to build their extension
- **Ready State Language**: "ready to build your extension", "operational", "available"
- **Avoid Development Language**: No "building", "creating", or "developing" references in user documentation
- **Clean Separation**: Template infrastructure vs user extension development must be clearly distinguishable

### Documentation in Development Mode

_Global documentation rules apply. These are development-mode-specific additions._

- **docs/ Scope**: `docs/` describes the template as it currently stands — its features, setup, architecture, and usage; no past-iteration references
- **Contributor Scope**: `CONTRIBUTING.md` covers contributing to the template (fork → change → PR) — it does not describe extension development workflows
- **AI Toolbox Docs Format**: Each guide in `.ai-toolbox/docs/` follows: common prompts first, what-belongs table, worked example with link to the example file, how-to for adding new items

### Template Content Eligibility Rules

_Applied when adding or modifying any file in the template during this boilerplate template's development or enhancement_

Any item added to the template must satisfy at least one of these criteria:

1. **Generic Functionality**: Provides value to any future project regardless of domain, language, or workflow — not specific to this template's own development or opinionated by any projected use of this template.
2. **Generic Extension Pattern**: Useful to any Qlik Sense extension developer — not specific to this template's example table visualization
3. **Reusable Boilerplate**: Infrastructure (build config, test setup, context system) that any extension developer would need from the start
4. **How-To Documentation**: Teaches users how to add, extend, or build features within the template for use in their own current project
5. **Educational Value**: Demonstrates a Nebula.js or Qlik extension pattern that a new developer should learn

Items that exist solely to support this template's own development process do not qualify and must not be committed to the base template.
Items specific to the example implementation (`src/` — the example table visualization) are acceptable but must be clearly understood as "example — replace with your own implementation."

## Upcoming Work

_Forward-looking only. No history. Remove items when complete — do not mark or annotate them, and delete the item's `plans/` file at the same time._

_`context.state.md` is not used to track template development progress — it represents the initial delivered state that extension developers inherit and evolve. Template development progress lives only in this section and `plans/`._

### Template Improvement Roadmap

_Sourced from downstream extension-project learnings. Each item has a pre-planning context file in `plans/` — to pick up an item, prompt: "Build an implementation plan for [item] using plans/[file]". Each item is roughly one PR. Stages are ordered by usefulness/need; items within a stage are ordered by dependency._

_Annotations: `[complexity / execution tier]` — complexity is Low/Medium/High; execution tier guides model selection: **light** = fast economical model (mechanical, fully specified), **standard** = default model, **deep** = strongest reasoning model (design judgment, cross-file consolidation, subtle async behavior)._

**Stage 1 — Commands & initialization** _(immediately useful operational tooling)_

1. **Initialization footnote prompt** `[Low / light]` — initialize flow writes a project-specific footnote in src/qae/object-properties.js. Context: plans/initialization-footnote-prompt.md

**Stage 2 — Corrections** _(existing content is wrong and actively misleading)_

2. **Monaco editor read correction** `[Medium / standard]` — replace the .view-line read approach with Ctrl+A → Ctrl+C → clipboard in docs and test helpers. Context: plans/monaco-editor-read.md

**Stage 3 — Scaffold correctness & robustness** _(latent bugs and blind spots every downstream project inherits)_

3. **Selection double-call guard** `[Medium / standard]` — optimistic lastInSelection flag prevents intermittent pending-selection wipe. Context: plans/selection-double-call-guard.md
4. **Limits single source of truth** `[Medium / standard]` — validation predicates and limit strings derived from data.js. Context: plans/limits-single-source.md
5. **Extension container test identifier** `[Low / standard]` — second identifier so broken validation cannot pass silently. Context: plans/extension-container-identifier.md

**Stage 4 — Structure** _(prerequisite for Stage 5)_

6. **Testing domain split** `[Medium / standard]` — move testing content into domains/qlik-extension-testing.md; refresh the stale module listing into a module/describe table. Context: plans/testing-domain-split.md

**Stage 5 — Testing guidance** _(all depend on item 7)_

7. **Targeted test commands** `[Low / light]` — --grep run patterns and the full-suite-at-commit-gates policy. Context: plans/targeted-test-commands.md
8. **Playwright robustness patterns** `[Medium / standard]` — null-safe style assertions, multi-click race guard, MEAS_MIN=0 measure-add signal, DUAL-field assertions. Context: plans/playwright-robustness.md
9. **Engine selections persistence** `[Low / light]` — resetConfiguration() does not clear engine selections; clearSelections() in the pre-test guard. Context: plans/engine-selections-persistence.md
10. **Test-time config injection** `[Low / light]` — nebula serve is webpack-based; globalSetup/globalTeardown file-swap pattern. Context: plans/test-time-config-injection.md
11. **Render cycle & styling principle** `[Low / light]` — two-render cycle and static-vs-expression-driven styling rule. Context: plans/render-cycle-and-styling-principle.md

**Stage 6 — Engine & property-panel domain knowledge**

12. **Hypercube pagination** `[High / deep]` — fetchAllDataPages scaffold utility, INITIAL_FETCH_HEIGHT, cancellation-safe integration. Context: plans/hypercube-pagination.md
13. **Schema normalization & getProperties()** `[Medium / standard]` — engine strips unknown properties at both levels; getProperties() read pattern. Depends on item 12. Context: plans/schema-normalization-getproperties.md
14. **Engine model additions** `[Low / light]` — associative model bullets, DUAL semantics, em-dash encoding. Context: plans/engine-model-additions.md
15. **Nebula Hub vs production property panel** `[Low / light]` — components absent from Nebula Hub; Monaco dev workflow; parked Qlik Cloud finding. Context: plans/nebula-hub-vs-production.md
16. **Property configuration architecture** `[Low / light]` — three-file role-boundary table plus scaffold boundary comments. Context: plans/property-config-architecture.md

**Stage 7 — Attribute expression styling**

17. **Attribute expression styling pattern** `[High / deep]` — consolidated qAttributeExpressions pattern incl. the one-AER-per-ref rule. Depends on items 12 and 16. Context: plans/attribute-expression-styling-pattern.md
18. **Color normalization utils** `[Medium / standard]` — d3-color based toRGB/isDarkColor scaffold helpers. Depends on item 17. Context: plans/color-normalization-utils.md

### Optional Enhancements

_Not scheduled — consider for future branches_

- **Unit testing** (High Value): Add Jest (or equivalent) for non-UI logic in `src/` — currently only Playwright E2E exists. `src/state/` and `src/qae/` contain pure functions (state management, data transforms, validation) with zero coverage. Medium effort; catches regressions in complex business logic.
- **Visual regression tests** (Medium Value): Screenshot-based regression coverage for rendered extension states. Extension renders dynamic table with 6+ error types and selection variants; useful post-refactor but requires strict CI environment consistency. High setup effort; medium ongoing cost.
- **Keyboard shortcut for selection** (Medium Value): Add keyboard confirm/cancel shortcuts (e.g., Escape to cancel) during active selection sessions. Selection handler already has infrastructure (`exitSelectionMode()` function). Low effort (~50 lines); improves UX for keyboard-first and a11y users.
- **i18n support** (Medium–High Value): Internationalization scaffolding for extensions targeting multi-language tenants. Found ~30+ hardcoded UI strings (errors, hints, labels). Prerequisite: determine target locales and Qlik Sense locale strategy. Medium setup; high ongoing (string extraction and translation maintenance).

## Template Development Loading Paths

When working on template features:
→ context.development.md (entry) → domains/qlik-extension.md → tools/git.md

_Note: Template development paths are defined here, not in context.global.md. Extension developers never see this file; all their loading paths are in context.global.md._

## System Development Lifecycle Management

**This context file gets deleted during extension project initialization** - ensures clean user experience with context.global.md as primary entry point.

**Purpose**: Contains ONLY template development processing rules - nothing essential to template operation when deleted.

---

### Continue Context Loading

**Next**: Load `context.global.md` for project-focused routing and operational contexts
