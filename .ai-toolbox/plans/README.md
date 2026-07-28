# Plans

Pre-planning context for upcoming work items — one file per item. A plan file is **context, not a plan**: it carries just enough extracted material (target files, source findings, prior art, open questions) for an agent to build a full implementation plan when the item is picked up.

## Lifecycle

1. A work item is scheduled in the upcoming work tracker (`context.backlog.md`, or the template roadmap during template development)
2. A plan file is created here with the context available at scheduling time
3. When the item is picked up, an agent builds the implementation plan from the plan file plus current repo state
4. When the item completes, the plan file is deleted (the tracker entry is removed at the same time)

## File Skeleton

```markdown
# <Work Item Name>

**Roadmap entry**: <one line copied from the upcoming work entry>
**Depends on**: <prior items, or "none">
**Complexity**: <Low | Medium | High>
**Execution tier**: <light | standard | deep>

## Target Files
- <path> — <create|modify> — <one-line what>

## Source Notes
<extract from the originating findings — trimmed to load-bearing parts>

## Prior Art in Repo
- <path/section> — <what already exists that this builds on or must stay consistent with>

## Open Questions
- <unresolved decisions, DRY watch-items>
```

**Execution tier** guides model selection tool-neutrally: **light** = fast economical model (mechanical, fully specified work), **standard** = default model, **deep** = strongest reasoning model (design judgment, cross-file consolidation, subtle async behavior).

---
*See `../docs/Plans.md` for the human usage guide.*
