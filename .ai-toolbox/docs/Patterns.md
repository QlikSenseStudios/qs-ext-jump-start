# Patterns — Usage Guide

Reusable patterns in `patterns/` provide step-by-step approaches, decision guidelines, and proven procedures that work across any project type or domain.

## Common Prompts

### Load a pattern
> "Load the setup pattern context for this session."

> "I'm starting a new project — load the setup patterns."

### Add a pattern
> "Create a pattern context for [pattern type] following the structure in patterns/setup.md."

### Extend a pattern
> "Add [approach or procedure] to the [pattern] context."

### Use patterns for decisions
> "Based on the setup patterns, how should I structure this project?"

### Review available patterns
> "What patterns are available and which apply to the current task?"

---

## What Belongs in a Pattern Context

| Section | Contents |
|---------|----------|
| **Steps or Approaches** | Ordered procedures or decision guidelines |
| **Context Loading** | Suggested loading path for this pattern |
| **Adaptive Elements** | How to adjust the pattern for different situations |
| **Common Artifacts** | Typical outputs or deliverables |

Keep patterns domain-agnostic — they should apply to any project type. Domain-specific guidance belongs in `domains/` and project-specific details in [project/overview.md](../project/overview.md).

---

## Example Pattern: setup.md

[patterns/setup.md](../patterns/setup.md) is a working example showing the structure. It covers universal project initialization steps with adaptive guidance for different project types.

---

## Adding a New Pattern

1. Create `patterns/{name}.md` following the structure of [patterns/setup.md](../patterns/setup.md)
2. Add it to the Available Patterns list in [patterns/README.md](../patterns/README.md)
3. Update [context.global.md](../context.global.md) Available Contexts if you want agents to discover it

**Prompt to create a new pattern**:
> "Create a pattern context for [pattern type] in patterns/{name}.md following the existing pattern."

Common pattern types to consider: development workflow, testing approach, deployment, code review, documentation, maintenance.

---

*Load patterns when approaching a recurring type of challenge. Patterns work best when combined with the relevant domain context.*
