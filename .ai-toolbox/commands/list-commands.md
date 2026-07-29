# List Commands

**Purpose**: Display all available commands, in logical use order
**Pattern**: Read `commands/README.md` Available Commands section and echo it back — the README is the single source of truth for which commands exist; do not scan the commands/ directory independently, as this would risk surfacing a file that was added without being indexed
**Context**: commands/README.md
**Output format** (plain text):

```
[Command name] (filename.md) — [one-line purpose]
```

---

_Focus on maintaining clean context hierarchy_
