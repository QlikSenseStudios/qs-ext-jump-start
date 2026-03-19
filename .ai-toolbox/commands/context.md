# Context Management Commands

Operations for managing the hierarchical context system.

## List Commands
**Purpose**: Display all available commands grouped by file, in logical use order, with sub-commands shown hierarchically
**Pattern**: Read all files in commands/; for each file list command names in the order they appear; identify sub-commands by checking whether a command contains named sub-steps or explicitly sequences into another named command; produce plain text output in the format below
**Context**: commands/ directory
**Output format** (plain text):
```
[Group label] (filename.md)
  [Command name]
    -- [Sub-step or sequenced command name]
  [Command name]
```
**Hierarchy rules**:
- Named workflow sub-steps within a command (e.g., phases of an initialization sequence) appear as sub-items under their parent command
- Commands that are explicitly called or must run before/after another command as part of a defined sequence appear as sub-items under the initiating command
- Independent commands at the same logical level appear at the same indent

## Load Context Chain
**Purpose**: Load contexts following hierarchy for specific task
**Pattern**: Start with global routing, add contexts as needed
**Context**: Always start with context.global.md
**Example**: 
```
Load: context.global.md → context.local.md → domains/research.md
```

## Validate Context Chain
**Purpose**: Check context references and consistency
**Pattern**: Follow reference chains, verify files exist
**Context**: context.global.md + all referenced contexts
**Example**: Ensure no broken references, no duplicate info

## Update Work Context
**Purpose**: Update current work tracking and backlog
**Pattern**: Add, update, or complete items in context.backlog.md
**Context**: context.backlog.md + context.state.md
**Example**: Add backlog items, mark completions, adjust priorities

## Add Domain Context
**Purpose**: Create new domain-specific context
**Pattern**: Create in domains/ with standard structure
**Context**: domains/README.md for patterns
**Example**: New domain for specific project type

---
*Focus on maintaining clean context hierarchy*