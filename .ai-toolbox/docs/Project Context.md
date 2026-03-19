# Project Context — Usage Guide

[project/overview.md](../project/overview.md) and [project/standards.md](../project/standards.md) are your project's stable context: mission, goals, constraints, and quality guidelines. AI agents read them automatically when loaded.

## Common Prompts

### Populate project overview
> "Set up my project context: the project is [name], the goal is [description], and the main constraints are [constraints]."

AI will populate `project/overview.md` with the information provided.

### Update goals or scope
> "Update the project goals in the project context to include [new goal]."

> "Add [constraint] to the project scope as out of scope."

### Populate project standards
> "Set up project standards for a [language/framework] project following [style or approach]."

AI will update `project/standards.md` with appropriate quality guidelines for your project type.

### Update standards
> "Add a standard: all API responses must include error codes."

> "Update the documentation requirement to require JSDoc comments on all public functions."

### Check project direction
> "Based on the current project context, does [proposed approach] align with our goals and standards?"

### Review what's defined
> "Show me the current project overview and standards."

---

## project/overview.md Fields

| Field | Guidance |
|-------|----------|
| **Mission** | One or two sentences — what the project is and what problem it solves |
| **Goals** | Concrete, testable outcomes; 3–5 is typical |
| **Scope** | Explicit in/out — prevents scope creep and aligns expectations |
| **Key Constraints** | Hard requirements that shape decisions (e.g., must run offline, must support IE11) |

Keep it current. An outdated overview is worse than none — agents will make wrong assumptions from stale context.

---

## project/standards.md

Universal quality guidelines that apply regardless of domain or tool. Keep these at a principle level; domain-specific standards belong in `domains/{type}.md` once configured.

Good candidates:
- Naming and file organization conventions
- Documentation requirements
- Version control practices
- Quality gates (testing, formatting, review)

---

*AI agents use these files passively whenever project context is loaded. Update them as your project evolves.*
