# Tool-Specific Contexts

Tool contexts tell AI agents how your team uses specific development tools — the project's shared conventions, configurations, and workflow standards. Load only the tools relevant to your current task.

## Available Tools

- [**git.md**](git.md) — Version control context and conventions
- [**github-actions.md**](github-actions.md) — CI/CD workflows, dependency audit, and version bump automation

*Add new tool contexts as your project needs them. See [docs/Tools.md](../docs/Tools.md) for how to add a tool context.*

## Usage

Tool contexts provide:
- Your team's conventions and preferences for a specific tool
- Configuration patterns relevant to this project
- Integration points with domains/ and patterns/

```
context.global.md → tools/{tool}.md
```

Combine with domain or pattern context when tool-specific guidance is needed:
```
patterns/setup.md + tools/git.md → version-controlled project setup
```

---
*See [docs/Tools.md](../docs/Tools.md) for prompt examples and usage guidance.*