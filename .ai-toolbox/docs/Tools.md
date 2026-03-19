# Tool Contexts — Usage Guide

Tool contexts in `tools/` tell AI agents how your team uses specific development tools — the project's shared conventions, configurations, and workflow standards. Every team uses tools differently; tool contexts capture *your team's* approach without enforcing one.

## Common Prompts

### Load a tool context
> "Load the git tool context for this session."

> "I need to work with version control — load the relevant tool context."

### Add a tool context
> "Create a tool context for [tool name] following the structure in tools/git.md."

### Fill in your team's conventions
> "Update the git tool context with our branching strategy and commit message format."

### Use tool context for guidance
> "Based on our git conventions, how should I handle this version control task?"

### Review available tool contexts
> "What tool contexts are available and which are relevant to the current task?"

---

## What Belongs in a Tool Context

| Section | Contents |
|---------|----------|
| **Team Conventions** | Your team's agreed standards for this tool — not generic best practices |
| **Configuration** | Project-specific settings and artifacts for this tool |
| **Integration Points** | Related patterns/ and domains/ files |

Tool contexts reflect *your team's workflow*, not a prescribed workflow. Leave sections empty until the team has a convention to document — an empty section is better than a wrong assumption.

---

## Example Tool: git.md

[tools/git.md](../tools/git.md) is a working example showing the structure. It provides sections for documenting your team's version control conventions without prescribing how the project should use Git.

---

## Adding a New Tool Context

1. Create `tools/{name}.md` following the structure of [tools/git.md](../tools/git.md)
2. Add it to the Available Tools list in [tools/README.md](../tools/README.md)
3. Update [context.global.md](../context.global.md) Available Contexts if you want agents to discover it

**Prompt to create a new tool context**:
> "Create a tool context for [tool name] in tools/{name}.md following the existing structure."

Common tools to consider: editor/IDE settings, package manager, testing framework, deployment target, database, CI/CD pipeline.

---

*Load tool contexts when working with a specific tool. The more accurately your team's conventions are documented, the more precisely AI agents can adapt to the project's workflow.*
