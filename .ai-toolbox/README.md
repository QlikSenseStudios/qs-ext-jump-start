# AI Project Context Management System

A flexible, hierarchical context management system for AI agents that supports any type of project without assumptions or opinions.

## Getting Started with Your Project

**Quick Setup**: See [docs/Getting Started.md](docs/Getting%20Started.md) for the simple 3-step process.

**What This System Provides**: Environment detection, preference collection, and hierarchical context management that works with any AI agent system.

---

## Context Loading Patterns

```bash
# Core context always loaded first
context.global.md + context.local.md (auto-merged)

# Project initialization
context.global.md → commands/initialization.md

# Project status check
context.global.md → context.state.md
```

*See the docs/ guides for extending domains, patterns, tool contexts, and commands as your project grows.*

## System Features

### Built-In Initialization
- **Automatic Setup**: Local environment detection and context file creation
- **User Preference Collection**: Guided configuration of development workflows  
- **Zero Configuration**: Ready-to-use context system from first project use
- **Cross-Platform**: Supports Windows, macOS, and Linux development environments

See [docs/Getting Started.md](docs/Getting%20Started.md) for complete setup process.

### Intelligent Maintenance
- **Real-Time Updates**: Environment and capability changes automatically detected
- **Preference Persistence**: User workflows maintained across updates
- **Documentation Sync**: Project status automatically updated across all files

See [docs/Local Context.md](docs/Local%20Context.md) for local environment management details.

### Project Backlog
- **Cross-Session Tracking**: Upcoming work and recently completed items persist across sessions
- **Collaboration Ready**: Dependency and parallel safety signals for team coordination
- **AI-Maintained**: Completed items automatically mirrored to project state and aged out per configurable criteria
- **Prompt-Driven**: Add items, suggest next steps, and mark completions via natural language

See [docs/Backlog.md](docs/Backlog.md) for prompt examples and backlog management guidance.

## Core Principles

- **Minimal Loading**: Load only what you need
- **Domain Agnostic**: No assumptions about project type  
- **DRY Information**: Single source of truth
- **Minimal Context**: Essential information only

## Context System Structure

**Before Initialization**:
```
project-space/
├── .ai-toolbox/         # AI context management system
├── .sandbox/            # Work area for references (gitignored)
├── README.md            # Project state documentation
└── .gitignore           # Version control patterns
```

**After Initialization**:
```
your-project/
├── .ai-toolbox/         # AI context system
├── .sandbox/            # Work area for references (gitignored)
├── */*                  # Your project structure defined by you
├── README.md            # Your project documentation
└── .gitignore           # Version control patterns
```

**AI Context System Structure**:
```
.ai-toolbox/
├── docs/                # 📚 System documentation  
│   ├── Getting Started.md # Simple 3-step user guide
│   ├── Local Context.md # Local environment guide
│   ├── Backlog.md       # Backlog usage guide
│   ├── Project Context.md # Project overview and standards guide
│   ├── Domains.md       # Domain context guide
│   ├── Patterns.md      # Patterns usage guide
│   ├── Tools.md         # Tool contexts guide
│   └── Commands.md      # Commands usage guide
├── context.local.md     # User environment basics (minimal personal preferences)
├── context.global.md    # 🚀 START HERE - Central routing
├── context.state.md     # Current project status
├── context.backlog.md   # Project backlog and recently completed work
├── commands/            # Available operations
├── project/             # Project context (overview, standards)
├── domains/             # Domain contexts (research.md example provided)
├── patterns/            # Reusable patterns (setup.md example provided)
└── tools/               # Tool-specific contexts (git.md example provided)
```

## Usage Examples

*Note: context.local.md is automatically merged with context.global.md in all scenarios*

### Common Paths
```
context.global.md → context.state.md (project status)
context.global.md → commands/initialization.md (setup new project)
```

### With Domain, Pattern, and Tool Contexts
- Domain-specific contexts for specialized project types (research.md example provided)
- Reusable patterns for common development approaches (setup.md example provided)
- Tool-specific contexts for your team's development tools (git.md example provided)

See [docs/Domains.md](docs/Domains.md) for domain context patterns and how to add new domains.
See [docs/Patterns.md](docs/Patterns.md) for pattern usage and how to add new patterns.
See [docs/Tools.md](docs/Tools.md) for tool context usage and how to add new tool contexts.
See [docs/Commands.md](docs/Commands.md) for command context usage and how to extend commands.

## Growing the System

Add contexts as needed following DRY principles and updating context.global.md routing.

## AI Agent Integration

### Example Integration
```
Your Agent Config → ai-toolbox/context.global.md → [context hierarchy]
```

### AI Agent Requirements
- **Documentation Sync**: Automatically update documentation when modifying routing
- **DRY Maintenance**: Eliminate redundancies across context files
- **Rule Application**: Follow all maintenance rules automatically

## Philosophy

This system grows organically with your needs while maintaining:
- ✅ Flexibility for any project type
- ✅ Minimal context loading overhead
- ✅ Information consistency (DRY)
- ✅ Clear navigation paths
- ✅ AI agent collaboration support

---
**AI context management system ready for any project type.**