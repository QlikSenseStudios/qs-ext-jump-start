# AI Context System

Hierarchical context management for AI agents working on this Qlik Sense extension project.

**AI Agent Entry Point**: Load `context.global.md` at the start of every session.

```
Always start by loading context from './.ai-toolbox/context.global.md' and follow the established maintenance rules automatically.
```

---

## Context Loading Paths

```
context.global.md + context.local.md     # core — always loaded
context.global.md -> context.state.md     # project status
context.global.md -> commands/initialization.md   # first-time setup
```

## System Structure

```
.ai-toolbox/
├── context.global.md        # START HERE — central routing and maintenance rules
├── context.local.md         # personal environment and preferences (not in version control)
├── context.state.md         # current project status
├── context.backlog.md       # upcoming work and recently completed items
├── commands/                # operation patterns (initialization, development, project, context)
├── docs/                    # documentation about this context system
├── project/                 # project overview and quality standards
├── domains/                 # domain-specific contexts
│   ├── qlik-extension.md    # Nebula.js, state management, test infrastructure
│   └── research.md          # example — add more as needed
├── patterns/                # reusable patterns (setup.md example)
└── tools/                   # tool-specific contexts
    └── git.md               # Git conventions, PR methodology, milestone workflow
```

## Core Principles

- **Minimal loading**: Load only what the task requires
- **DRY**: Single source of truth — no duplicated information except approved mirrors
- **Current state only**: context.state.md reflects the present; history lives in context.backlog.md
- **Agent agnostic**: No agent-specific references except in context.local.md

## Growing the System

Add domain, pattern, or tool contexts as needed. See the guides in `docs/` for how to extend each area. Update `context.global.md` Available Contexts when adding new files so agents can discover them.

---
*See `docs/` for human-readable guides. See `context.global.md` for maintenance rules.*
