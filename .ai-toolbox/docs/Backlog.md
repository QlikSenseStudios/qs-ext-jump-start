# Backlog — Usage Guide

`context.backlog.md` is your project's cross-session work tracker. AI agents read and maintain it automatically when loaded.

## Common Prompts

### Add an item
> "Add to backlog: [item description]"

> "Add to backlog: Refactor authentication module — high priority, no dependencies, parallel safe"

### Suggest next steps
> "Based on the current project state, suggest possible next steps and add them to the backlog for my review."

AI will evaluate `context.state.md` and `context.backlog.md`, propose items, and wait for your approval before adding anything.

### Mark something complete
> "Mark [item] as complete in the backlog."

AI will move it to Recently Completed, mirror it to `context.state.md`, and apply age-out criteria.

### Review the backlog
> "Show me the current backlog."

> "What can be worked on in parallel right now?"

> "What's blocked and what's next?"

### Change age-out criteria
> "Update backlog age-out to keep only 5 newest per contributor."

> "Change backlog age-out to 60 days."

> "Set backlog age-out to 90 days OR 5 newest per contributor, whichever comes first."

AI will update the **Active criteria** line in `context.backlog.md`.

## Age-out Criteria

Controls how long completed items stay in Recently Completed before aging out to `context.state.md`.

**Default** (applied if not set during initialization): Age out after 30 days OR keep only 3 newest per contributor, whichever comes first.

Available options:
- After N days
- Keep only N newest per contributor
- After N days OR keep only N newest per contributor, whichever comes first

The active criteria is stored in the Age-out Criteria section of `context.backlog.md`. Change it at any time with a prompt (see above) or by editing directly.

## Recently Completed and context.state.md

All completed items exist in **both** `context.backlog.md` and `context.state.md` — this is one of the few approved duplications in the system.

| context.backlog.md | context.state.md |
|--------------------|------------------|
| Recent completions (per age-out criteria) | Full completed work history |
| Dynamic, actionable view | Stable historical record |
| Ages out automatically | Never loses completed items |

This means the root `README.md` (auto-synced from `context.state.md`) always reflects completed work, while the backlog stays focused on actionable items without overwhelming history.

## Upcoming Work Table Fields

| Field | Guidance |
|-------|----------|
| **Priority** | Number (1 = highest) or P1/P2/P3 label |
| **Item** | Short, action-oriented description |
| **Depends On** | Item number(s) it must wait for, or `—` if independent |
| **Parallel Safe?** | Yes — safe to split with another contributor; No — coordinate first |

Keep items specific and actionable. Break vague items ("improve docs") into concrete tasks before adding.

---
*AI agents maintain Recently Completed and aging automatically. Your focus: Upcoming Work.*
