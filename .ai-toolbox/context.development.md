# qs-ext-jump-start — Template Development Context

**TEMPLATE DEVELOPMENT ROOT CONTEXT**: Load this before `context.global.md` when working ON the qs-ext-jump-start template itself — enhancing, maintaining, or improving it as a reusable Qlik extension starting point.

## Template Development Mode
- **Purpose**: Working ON the qs-ext-jump-start template, not using it to build a specific Qlik extension
- **State**: Template enhancement and maintenance
- **Context Hierarchy**: This file → context.global.md → operational contexts
- **Scope**: Template architecture, boilerplate improvements, documentation, and context system enhancements

## Dual Context Overview
*The two distinct ways this project is used. (The context struggle is real)*

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
*Critical: Applied to ALL documentation and context files during template enhancement*

### User-Facing Language Standards
- **Template References**: Refer to this project as the "jump-start" or "template" — not "your extension" or "your project"
- **User Perspective**: Write user-facing documentation as if a developer has just downloaded the source or used "Use this template" and is about to build their extension
- **Ready State Language**: "ready to build your extension", "operational", "available"
- **Avoid Development Language**: No "building", "creating", or "developing" references in user documentation
- **Clean Separation**: Template infrastructure vs user extension development must be clearly distinguishable

### Documentation in Development Mode
*Global documentation rules apply. These are development-mode-specific additions.*
- **docs/ Scope**: `docs/` describes the template as it currently stands — its features, setup, architecture, and usage; no past-iteration references
- **Contributor Scope**: `CONTRIBUTING.md` covers contributing to the template (fork → change → PR) — it does not describe extension development workflows
- **AI Toolbox Docs Format**: Each guide in `.ai-toolbox/docs/` follows: common prompts first, what-belongs table, worked example with link to the example file, how-to for adding new items

### Template Content Eligibility Rules
*Applied when adding or modifying any file in the template during this boilerplate template's development or enhancement*

Any item added to the template must satisfy at least one of these criteria:

1. **Generic Functionality**: Provides value to any future project regardless of domain, language, or workflow — not specific to this template's own development or opinionated by any projected use of this template.
2. **Generic Extension Pattern**: Useful to any Qlik Sense extension developer — not specific to this template's example table visualization
3. **Reusable Boilerplate**: Infrastructure (build config, test setup, context system) that any extension developer would need from the start
4. **How-To Documentation**: Teaches users how to add, extend, or build features within the template for use in their own current project
5. **Educational Value**: Demonstrates a Nebula.js or Qlik extension pattern that a new developer should learn

Items that exist solely to support this template's own development process do not qualify and must not be committed to the base template.
Items specific to the example implementation (`src/` — the example table visualization) are acceptable but must be clearly understood as "example — replace with your own implementation."

## CI — Dependency Audit

Two workflows handle dependency security:

- **`audit.yml`** — gate: runs `npm audit --audit-level=moderate` on every push and PR; fails if any moderate-or-above vulnerability is present
- **`audit-fix.yml`** — scheduled fix: runs every Monday at 06:00 UTC; applies `npm audit fix` and opens a PR targeting `main` if `package-lock.json` changes

**When a Dependabot PR fails the audit gate:**
1. Trigger **Audit Fix** manually from the Actions UI
2. Set `base-branch` to the Dependabot branch name
3. A `chore/audit-fix` PR opens targeting that branch — merge it
4. The audit gate on the Dependabot PR passes — merge as normal

Dependabot handles direct dependency version bumps (`package.json` ranges). The audit-fix workflow handles transitive lockfile vulnerabilities. They run on the same day but serve different purposes.

## Upcoming Work
*Forward-looking only. No history. Remove items when complete — do not mark or annotate them.*

- **Initialization command review** (branch: `chore/initialization`): Review and update `commands/initialization.md` for correctness and completeness; ensure `CONTRIBUTING.md` is removed or replaced during initialization (it describes template contribution, not extension development); validate all initialization steps work cleanly in a fresh template repo; consider a separate contributing initialization command that prompts contributors to record their fork/upstream topology in `context.local.md` (upstream = `QlikSenseStudios`, fork = contributor's remote) so GitHub URL references stay correct throughout development
- **Restore Playwright testing coverage** (branch: `fix/playwright-coverage`): Investigate and resolve the 2 skipped tests caused by Nebula Hub DOM drift with latest `@nebula.js/cli-serve`; restore full test suite to passing

### Optional Enhancements
*Not scheduled — consider for future branches*

- **Unit testing**: Add Jest (or equivalent) for non-UI logic in `src/` \u2014 currently only Playwright E2E exists
- **Visual regression tests**: Screenshot-based regression coverage for rendered extension states
- **Keyboard shortcut for selection**: Add keyboard confirm/cancel shortcut for active selection sessions
- **i18n support**: Internationalization scaffolding for extensions targeting multi-language tenants
- **Automated version management**: Automatic version bump and changelog verification as part of the release workflow

## System Development Lifecycle Management
**This context file gets deleted during extension project initialization** - ensures clean user experience with context.global.md as primary entry point.

**Purpose**: Contains ONLY template development processing rules - nothing essential to template operation when deleted.

---

### Continue Context Loading
**Next**: Load `context.global.md` for project-focused routing and operational contexts