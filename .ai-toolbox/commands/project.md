# Project Management Commands

Operations for managing project lifecycle and organization.

## Define Project Scope
**Purpose**: Establish clear project boundaries and goals
**Pattern**: Document purpose, requirements, constraints
**Context**: project/ contexts + domains/{type}.md
**Example**: Update project/overview.md with scope details

## Track Progress
**Purpose**: Monitor project status and milestones
**Pattern**: Update context.state.md and context.backlog.md
**Context**: context.state.md + context.backlog.md
**Example**: Mark completions, identify blockers, plan next steps

## Maintain Standards
**Purpose**: Ensure consistent quality across project
**Pattern**: Reference and enforce project/standards.md
**Context**: project/standards.md + domains/{type}.md
**Example**: Code review, documentation review, consistency checks

## Plan Next Phase
**Purpose**: Identify and prepare for upcoming work
**Pattern**: Analyze current state, identify dependencies
**Context**: context.state.md + context.backlog.md + project/ contexts
**Example**: Review backlog, update priorities, add next steps

---
*Scale management approach to project complexity*