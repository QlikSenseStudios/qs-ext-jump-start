# Command Context Directory

Simple command patterns organized by functional area for hierarchical loading.

## Organization
- **initialization.md** - Project setup from template (auto-triggered)
- **context.md** - Context management operations
- **development.md** - General development workflows  
- **project.md** - Project management operations

## Usage Pattern
Load commands as part of context hierarchy:
```
context.global.md → commands/{area}.md
```

## Command Style
Commands are documented as:
- **Purpose**: What it accomplishes
- **Pattern**: General approach
- **Context**: Required context loading
- **Example**: Basic usage

Focus on patterns rather than specific implementations.

---
*See [docs/Commands.md](../docs/Commands.md) for prompt examples and usage guidance.*