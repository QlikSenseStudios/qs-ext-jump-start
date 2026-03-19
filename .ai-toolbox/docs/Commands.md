# Commands — Usage Guide

The `commands/` directory provides operation patterns for common tasks. Command contexts tell AI agents how to approach specific types of work — purpose, a general approach, required context, and an example.

## Common Prompts

### Load a command context
> "Load the development commands context for this session."

> "I need to organize my project structure — load the relevant command context."

### Add a command pattern
> "Add a command for [operation] to commands/development.md following the existing structure."

### Use a command for guidance
> "Based on the project management commands, how should I approach tracking progress?"

### Review available commands
> "What command contexts are available for the current task?"

---

## What's in commands/

| File | Purpose |
|------|---------|
| **initialization.md** | Project setup — auto-triggered when context.local.md is missing |
| **context.md** | Context management operations |
| **development.md** | Development workflow patterns |
| **project.md** | Project management operations |

Commands provide patterns, not prescriptions. Adapt them to your project's workflow.

---

## Example: development.md

[commands/development.md](../commands/development.md) shows the structure. It covers patterns for initializing a project, setting up quality controls, documenting, and organizing structure — all workflow-agnostic so they apply regardless of language or toolchain.

---

## Adding a New Command Pattern

1. Add to the relevant `commands/{area}.md` following the existing structure
2. Or create `commands/{area}.md` for a new functional area and add it to [commands/README.md](../commands/README.md)

**Prompt to add a command**:
> "Add a command pattern for [operation] to commands/{area}.md following the existing structure."

---

*Load command contexts when you want structured guidance for a specific type of operation. Commands work best when combined with the relevant domain and tool contexts.*
