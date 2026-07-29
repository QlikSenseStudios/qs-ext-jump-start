# Commands — Usage Guide

The `commands/` directory provides operation patterns for common tasks. Command contexts tell AI agents how to approach specific types of work — purpose, a general approach, required context, and an example.

## Common Prompts

### Load a command context

> "Load the review-change-set command context for this session."

> "What command should I use before committing this change set?"

### Add a command pattern

> "Add a command for [operation] as a new file in commands/ following the existing structure."

### Use a command for guidance

> "Based on the describe-change-set command, how should I write this commit message?"

### Review available commands

> "What commands are available for the current task?"

---

## What's in commands/

One file per command, listed in logical use order. See [commands/README.md](../commands/README.md) for the full index — it also lists example command ideas not currently implemented, for reference when adding a new one.

Commands provide patterns, not prescriptions. Adapt them to your project's workflow.

---

## Example: review-change-set.md

[commands/review-change-set.md](../commands/review-change-set.md) shows the structure. It covers a single command's Purpose, Pattern, Context, and checklist — workflow-agnostic so the structure applies regardless of language or toolchain.

---

## Adding a New Command Pattern

1. Create a new `commands/{command-name}.md` file following the existing structure
2. Add it to the Available Commands list in [commands/README.md](../commands/README.md)

Only add a command when there is a real, current need for it — commands/README.md lists example command ideas as reference, not as stubs to fill in.

**Prompt to add a command**:

> "Add a new command pattern for [operation] as commands/{command-name}.md and add it to commands/README.md."

---

_Load command contexts when you want structured guidance for a specific type of operation. Commands work best when combined with the relevant domain and tool contexts._
