# Monaco Editor Read Correction

**Roadmap entry**: Replace the .view-line Monaco read approach with Ctrl+A → Ctrl+C → clipboard.readText() in docs and test helpers.
**Depends on**: none
**Complexity**: Medium
**Execution tier**: standard

## Target Files
- test/lib/utilities/json-editor.js — modify — read implementation collects `.view-line` DOM text (~lines 59-64, 361)
- test/lib/page-objects/nebula-hub.js — modify — Monaco read usage (~line 123)
- .ai-toolbox/domains/qlik-extension.md — modify — "Nebula Hub DOM Patterns > Monaco editor — read" documents the incorrect approach (moves to the testing domain file if the testing-domain-split has landed first)

## Source Notes
The `.view-line` collection approach is **incorrect for documents with more than ~20 lines**: Monaco virtualizes rows and only renders lines in the visible viewport. Setting the container CSS height does not reliably trigger Monaco's ResizeObserver in time, so the DOM read sees only the initially rendered lines and produces truncated, unparseable JSON.

**Correct approach**: `Ctrl+A` (select all — targets Monaco's full document model, not the visible DOM) → `Ctrl+C` → `navigator.clipboard.readText()`. This bypasses virtual scrolling entirely. Requires `permissions: ['clipboard-read', 'clipboard-write']` on the browser context.

## Prior Art in Repo
- test/qs-ext.connect.js:29 — clipboard permissions already granted on the browser context; no config change needed
- Monaco editor — write documentation already uses a clipboard-paste approach; read and write become symmetrical after this change
- The existing docs mention sanitizing U+00A0 from `.view-line` text — verify whether clipboard text needs the same sanitization

## Open Questions
- Full E2E suite must stay green — the read helper is used by resetConfiguration/property verification paths
- Does any test depend on reading a *partial* document where the old approach happened to work?
