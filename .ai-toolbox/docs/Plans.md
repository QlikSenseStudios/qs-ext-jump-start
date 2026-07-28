# Plans — Usage Guide

Pre-planning context files in `plans/` — one file per upcoming work item. A plan file is not a plan: it holds just enough extracted context (target files, source findings, prior art, open questions) that an agent can build a full implementation plan for the item on demand, without re-researching from scratch.

## Common Prompts

### Build a plan from a plan file
> "Build an implementation plan for the [item name] item using plans/{item}.md."

### Create a plan file for a new work item
> "Create a plan file in plans/ for the [item] entry in the backlog, following the skeleton in plans/README.md."

### Review scheduled work
> "List the plans/ files and summarize what each item covers and its complexity."

### Update a plan file after scope changes
> "The [item] scope changed — update plans/{item}.md to reflect [change]."

---

## What Belongs in a Plan File

| Section | Contents |
|---------|----------|
| **Header fields** | Roadmap entry (one line), dependencies, complexity rating, execution tier |
| **Target Files** | Paths to create or modify, one line each |
| **Source Notes** | Extracts from the originating findings, trimmed to the load-bearing parts |
| **Prior Art in Repo** | What already exists that the work builds on or must stay consistent with |
| **Open Questions** | Unresolved decisions and DRY watch-items for the plan builder |

Keep plan files as context, not instructions — implementation steps belong in the plan built from them. Each file pairs with exactly one upcoming work item; delete the file when the item completes.

---

## Example Plan File

[plans/fix-security-advisories-command.md](../plans/fix-security-advisories-command.md) is a working example: a small, fully specified item whose Source Notes carry the complete command definition to be added.

---

## Adding a New Plan File

1. Add the work item to the upcoming work tracker first (`context.backlog.md`, or the template roadmap while in template development)
2. Create `plans/{kebab-case-item-name}.md` following the skeleton in [plans/README.md](../plans/README.md)
3. Reference the plan file from the work item entry (plain text path)

**Prompt to create a new plan file**:
> "Create a plan file for [item] in plans/ following the skeleton, extracting context from [source]."

---

*Plan files keep planning costs low: research happens once when the item is scheduled, and the implementation plan is built only when the item is picked up.*
