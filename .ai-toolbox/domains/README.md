# Domain-Specific Contexts

Domain contexts tell AI agents about the type of project you're working on — technology stack, common patterns, recommended tools, and domain-specific standards. Load only the domains relevant to your current task.

## Available Domains

- [**qlik-extension.md**](qlik-extension.md) — Qlik Sense extension development: Nebula.js Supernova API, safe DOM patterns, WeakMap state, test infrastructure, build pipeline
- [**research.md**](research.md) — Research workflows, information gathering, and discovery processes (base system example)

*Add new domains as your project needs them. See [docs/Domains.md](../docs/Domains.md) for how to add a domain.*

## Usage

Domains provide:
- Common patterns and approaches for a project type
- Tool recommendations and configurations
- Best practices and standards specific to the domain
- Cross-references to relevant patterns/ and tools/ contexts

```
context.global.md → domains/{type}.md
```

Combine with project context for complete standards:
```
project/standards.md + domains/{type}.md → complete standards
```

---
*See [docs/Domains.md](../docs/Domains.md) for prompt examples and usage guidance.*