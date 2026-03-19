# Project Initialization Command

**Trigger**: When `context.local.md` is missing during context loading
**Purpose**: Complete workspace system setup to an operational project

## Detection Pattern

If loading `context.global.md` and `context.local.md` doesn't exist → initiate this workflow

## Initialization Sequence

### Environment Detection
**Auto-discover**:
- Operating system (Windows, macOS, Linux)
- Primary shell (Bash, PowerShell, Zsh)
- Workspace root path
- Current date/timezone

**Capability scan**:
- Git availability and configuration
- Code editors (VS Code, etc.)
- Runtime environments (Node.js, Python, Java)
- Package managers (npm, pip, gem)
- Development tools (Docker, databases)

### User Preference Collection
**Personal workflow preferences**:
- Change management style (iterative vs. batch)
- Communication style with AI agents (e.g., verbose explanations vs. concise output)

**Project backlog preferences**:
- Completed item age-out criteria (default applied if not specified: 30 days OR 3 newest per contributor, whichever comes first)
  - Option A: After N days
  - Option B: Keep only N newest per contributor
  - Option C: After N days OR keep only N newest per contributor, whichever comes first
- Update the **Active criteria** line in context.backlog.md with the chosen or default criteria
- Inform user they can change this at any time — see [docs/Backlog.md](../docs/Backlog.md)

**Development environment preferences**:
- Preferred editor/IDE setup
- Terminal and shell preferences
- Package manager choices
- Testing and debugging approaches

**File system preferences**:
- Cross-platform path handling
- Text encoding preferences
- Line ending management
- File naming conventions

**Local tool configuration**:
- Git user configuration
- IDE/editor settings
- Shell aliases and shortcuts
- Environment variables

### Local Context Creation
*Minimal context following system rules*

**Generate context.local.md** with:
1. **Environment Basics** (auto-detected)
   - OS, shell, workspace root, current date
2. **Available Tools** (auto-detected)
   - Detected development tools and capabilities
3. **User Preferences Section** (user editable area)
   - Minimal personal settings
   - Clear USER EDITABLE SECTION markers to protect from automatic updates

**User Customization Setup**:
- Explain manual editing options
- Provide prompt-based update examples
- Ensure user understands this file is not in version control
- Guide user through personalizing their development preferences

**Integration**:
- Auto-merge with global routing for all context operations
- Validate context loading paths
- Initialize preference persistence system

### Project Customization
**Structure setup**:
- Create directories based on project type
- Initialize domain contexts if applicable — see [docs/Domains.md](../docs/Domains.md) for domain context patterns
- Apply reusable patterns if applicable — see [docs/Patterns.md](../docs/Patterns.md) for pattern usage
- Configure tool contexts if applicable — see [docs/Tools.md](../docs/Tools.md) for tool context conventions
- Configure tool-specific settings

**Documentation**:
- Update root README with project info
- Populate `project/overview.md` with project name, mission, goals, and scope gathered during setup
- Populate `project/standards.md` with quality standards based on user's development preferences

### Version Control
**If Git detected**:
- Initialize repository (if needed)
- Create .gitignore for detected technologies
- Set up initial commit
- Configure user Git settings

### Validation & Handoff
**System check**:
- Verify context file linking
- Test context loading paths
- Confirm capability detection
- Validate user preferences active

**Documentation sync**:
- Update project status in README files
- Generate quick start instructions
- Create usage examples

**Completion**:
- Report initialization summary
- **Remove System Development Context**: Delete .ai-toolbox/context.development.md (not needed in project mode)
- **AI Agent Setup**: Add prompt instruction: "Load context from './.ai-toolbox/context.global.md' and follow maintenance rules automatically"
- Provide next steps

## User Configuration  
**Essential Prompt**: `"Always start by loading context from './.ai-toolbox/context.global.md' and follow the established maintenance rules automatically."`

## Error Handling

**Graceful degradation**: Continue if non-critical capabilities missing
**Fallbacks**: Provide alternatives for missing tools
**Recovery**: Offer re-initialization for failed setups

---

*This command creates a fully operational, environment-aware project workspace ready for immediate development.*