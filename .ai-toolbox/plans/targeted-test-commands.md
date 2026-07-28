# Targeted Test Commands

**Roadmap entry**: Document --grep targeted test run patterns and the full-suite-at-commit-gates policy.
**Depends on**: testing-domain-split
**Complexity**: Low
**Execution tier**: light

## Target Files
- .ai-toolbox/domains/qlik-extension-testing.md — modify — extend the Test Commands section with --grep patterns; extend the module/describe table from the split with --grep targets

## Source Notes
All tests route through a single `*.e2e.js` orchestrator, so file-level targeting is not available — `--grep` is the correct tool.

**Policy to document**: run the full suite at commit gates; use targeted runs during development iteration.

```bash
# Full suite
npm test

# Full suite — terminal output only (no browser report)
SKIP_OPEN_REPORT=1 npx playwright test --reporter=list

# Target by describe block name (substring match against full title path)
SKIP_OPEN_REPORT=1 npx playwright test --grep "Selection Mode" --reporter=list

# Target a single test by substring of its title
SKIP_OPEN_REPORT=1 npx playwright test --grep "some test name substring" --reporter=list

# Headed mode — visual inspection of a targeted group
SKIP_OPEN_REPORT=1 npx playwright test --grep "Selection Mode" --headed --reporter=list
```

`SKIP_OPEN_REPORT` suppresses the automatic browser report on failure. `--grep` does a substring match against the full title path (describe blocks + test name joined). `--grep-invert` excludes matching tests. Substitute the template's actual describe-block names.

## Prior Art in Repo
- domains/qlik-extension.md Test Commands section — already documents `npm test` and `SKIP_OPEN_REPORT=1` variants; this item adds --grep and the policy, not a new section
- Module/describe table created by the testing-domain-split — add the --grep column there rather than a second list (DRY)

## Open Questions
- Verify each module's actual describe-block names from test/modules/ sources when building the table
