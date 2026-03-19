# Project Information Directory

Essential project information that remains stable across different domains and project types.

## Core Files

- **overview.md** - Project mission and fundamental goals
- **standards.md** - Universal quality guidelines

## Usage in Context Hierarchy

Load project contexts when:
- Establishing quality standards for any project
- Defining project purpose, goals, and constraints
- Making decisions that affect project organization

## Context Loading Pattern
```
context.global.md → project/overview.md → project/standards.md
```

Combine with domain contexts for specific project types:
```
project/standards.md + domains/{type}.md → complete standards
```

---
*See [docs/Project Context.md](../docs/Project%20Context.md) for prompt examples and usage guidance.*