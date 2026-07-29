# Initialization Footnote Prompt

**Roadmap entry**: Initialize flow writes a project-specific footnote in src/qae/object-properties.js from the collected description.
**Depends on**: none
**Complexity**: Low
**Execution tier**: light

## Target Files

- .ai-toolbox/commands/bootstrap-project-from-template.md — modify — Step 6 "Apply Extension Identity" gains the footnote target (the description is already collected in Step 2)

## Source Notes

The template leaves a generic `footnote` value in `src/qae/object-properties.js`:

```javascript
footnote: 'This is a template project for creating Qlik Sense extensions',
```

The initialize command should generate the correct `footnote` value at initialization time rather than leaving a placeholder that must be manually updated. The footnote is stored in the Qlik engine and visible in the extension caption; a project-specific value is required for production use.

## Prior Art in Repo

- .ai-toolbox/commands/bootstrap-project-from-template.md Step 2 — already collects "Description: What does this extension do?"; no new prompt needed, only a new application target in Step 6
- src/qae/object-properties.js:61 — the placeholder footnote line
- Engine character encoding finding (see plans/engine-model-additions.md): the engine silently replaces U+2014 em dash with a space in property-bag strings — the footnote written at init must use ASCII hyphen-minus

## Open Questions

- Should Step 6 derive a shortened one-line footnote from the description, or prompt for a separate caption-length string when the description is long?
