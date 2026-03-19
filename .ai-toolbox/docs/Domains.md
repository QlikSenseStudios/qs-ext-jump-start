# Domain Contexts — Usage Guide

Domain contexts in `domains/` tell AI agents about the type of project you're working on — technology stack, common patterns, recommended tools, and domain-specific standards.

## Common Prompts

### Load a domain
> "Load the research domain context for this session."

> "I'm building a web application — load the relevant domain context."

### Add a domain context
> "Create a domain context for [domain type] following the pattern in domains/research.md."

### Extend a domain
> "Add [technology or pattern] to the [domain] domain context."

### Use domain context for decisions
> "Based on the [domain] domain context, how should I approach [problem]?"

### Review available domains
> "What domain contexts are available and which are relevant to the current task?"

---

## What Belongs in a Domain Context

| Section | Contents |
|---------|----------|
| **Common Patterns** | Recurring approaches specific to this domain |
| **Typical Tools** | Recommended tools and when to use them |
| **References** | Related patterns/, tools/, project/ files |

Keep domain contexts focused on the domain — not on your specific project. Project-specific details belong in [project/overview.md](../project/overview.md) and [project/standards.md](../project/standards.md).

---

## Example Domain: research.md

[domains/research.md](../domains/research.md) is a working example showing the structure. It covers research and discovery workflows with patterns, tools, and cross-references to related contexts.

---

## Adding a New Domain

1. Create `domains/{name}.md` following the structure of [domains/research.md](../domains/research.md)
2. Add it to the Available Domains list in [domains/README.md](../domains/README.md)
3. Update [context.global.md](../context.global.md) Available Contexts if you want agents to discover it

**Prompt to create a new domain**:
> "Create a domain context for [domain type] in domains/{name}.md following the existing pattern."

Common domain types to consider: web, mobile, data, CLI, API, documentation, infrastructure.

---

*Load domain contexts when starting work in a specific area. The more specific the domain, the more targeted the guidance agents can provide.*
