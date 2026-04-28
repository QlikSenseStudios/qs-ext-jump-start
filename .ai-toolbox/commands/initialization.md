# Project Initialization Command

**Trigger**: When `context.local.md` is missing during context loading
**Purpose**: Set up this Qlik Sense extension template for your extension project

## Detection Pattern

If loading `context.global.md` and `context.local.md` doesn't exist → initiate this workflow

## Initialization Sequence

### Step 1 — Environment Detection

Auto-detect and record:
- Operating system (Windows, macOS, Linux)
- Primary shell (Bash, PowerShell, Zsh)
- Workspace root path
- Current date

### Step 2 — Extension Identity

Collect from user:
- **Extension name**: The name of your extension — used in `package.json`, `src/meta.json`, `README.md`, and the packaged output folder
- **Description**: What does this extension do? What problem does it solve?
- **Target platform**: Qlik Cloud, Qlik Sense Enterprise, or both
- **Starting version**: The initial version for the extension project — default `0.1.0` if the user has no preference; the template version in `package.json` is not meaningful to the extension project and must be replaced

### Step 3 — Work Style Preferences

Collect from user:
- **Contributor name**: Used to attribute completed work in backlog and state context
- **Work style**: How should the AI agent communicate and pace work? (e.g., one step at a time with explicit approval, verbose explanations vs. concise output)
- **Change management**: Iterative (small focused changes) or batch (larger grouped changes)

### Step 4 — Local Context Creation

Generate `context.local.md` with:
- **Environment Basics** (auto-detected): OS, shell, workspace root, date initialized
- **User Preferences** (from Step 3): contributor name, work style, change management style
- Clearly marked `<!-- USER EDITABLE SECTION -->` boundaries so automated updates never overwrite personal settings
- Note to user: this file is not committed to version control — it is personal to this workspace

### Step 5 — CI Workflow Decision

The template includes five GitHub Actions workflows in `.github/workflows/`: `build.yml`, `lint.yml`, `audit.yml`, `audit-fix.yml`, and `version-bump.yml`. These are documented in `tools/github-actions.md`.

Ask the user:
> "The template includes CI workflows for build, lint, dependency auditing, and automatic version bumping on merge. Would you like to keep these as-is, or remove them and implement your own CI strategy?"

- **Keep**: retain all workflows unchanged; remind the user to create the version bump labels (`version:patch`, `version:minor`, `version:major`) in the GitHub repo's Labels settings before the version-bump workflow can read them
- **Remove**: delete the entire `.github/workflows/` directory; note that the user will need to set up their own CI

### Step 6 — Apply Extension Identity

Apply the name and description from Step 2 to:
- **`package.json`**: Update `name`, `description`, and `version` fields — reset version to the value collected in Step 2
- **`src/meta.json`**: Update `name` field
- **`README.md`**: Replace the template title, description, and purpose with the extension's name and purpose; replace the Quick Start section with extension-specific setup steps (remove "Use this template" and AI initialization instructions — those are complete; retain `npm install`, environment setup links, `npm run serve`); remove the Contributing section (references `CONTRIBUTING.md` which is deleted in Step 7)
- **`project/overview.md`**: Populate mission, goals, and scope from the collected extension purpose

### Step 7 — Remove Template Artifacts

These files describe the template's own development process and are not relevant to extension development:
- **Delete `CONTRIBUTING.md`**: Describes contributing to the template, not to your extension project
- **Delete `.ai-toolbox/context.development.md`**: Template development rules; not applicable once initialized
- **Delete `.ai-toolbox/docs/Getting Started.md`**: Initialization guide; superseded by the initialized `README.md`

### Step 8 — Qlik Environment Setup

Direct the user to the appropriate setup guide based on the target platform from Step 2:
- Qlik Cloud → `docs/QLIK_CLOUD_SETUP.md`
- Qlik Sense Enterprise → `docs/QLIK_ENTERPRISE_SETUP.md`
- Both → complete both guides

Confirm the user has a test application and connection string ready before they run `npm test`.

### Step 9 — AI Agent Setup

Record in `context.local.md` and communicate clearly to the user:

**Essential prompt for every session**:
```
Always start by loading context from './.ai-toolbox/context.global.md' and follow the established maintenance rules automatically.
```

The `.ai-toolbox/` directory is the single source of truth for all project context. The AI agent loads domain context (`domains/qlik-extension.md`), project state (`context.state.md`), and user preferences (`context.local.md`) from there automatically. Add this prompt to your AI agent workspace configuration, session opener, or instructions file.

### Step 10 — Validation & Handoff

- Confirm `context.local.md` created and populated correctly
- Confirm `CONTRIBUTING.md` and `context.development.md` removed
- Confirm CI workflows retained or removed per Step 5; if retained, remind user to create version bump labels in GitHub
- Confirm `project/overview.md` reflects the extension's purpose
- Report what was completed and what still requires manual action (e.g., git remote configuration, Qlik environment setup)
- Provide the next steps: set up Qlik environment, run `npm install`, run `npm run serve` to verify the template extension loads

## Error Handling

**Skipped steps**: If the user skips a collection step (e.g., doesn't know the extension name yet), leave a clear `[TODO: update this]` placeholder in the affected file and note which files need manual update
**Graceful degradation**: Continue if non-critical steps fail; flag for manual completion

---

*After initialization, `context.development.md` has been removed. Load all future context from `context.global.md`.*
