# Nebula Hub vs Production Property Panel

**Roadmap entry**: Document property panel components absent from Nebula Hub, the Monaco-editor dev workflow, and the settings-accordion label behavior; park the unresolved Qlik Cloud components:[] finding.
**Depends on**: none
**Complexity**: Low
**Execution tier**: light

## Target Files
- .ai-toolbox/domains/qlik-extension.md — modify — new "Nebula Hub vs Production Property Panel" section; Known Environment Unknowns gains the parked Qlik Cloud finding

## Source Notes

**Confirmed absent from Nebula Hub** (verified in a production Qlik Sense tenant; components silently do not render, no error):
- `attribute-expression-reference`
- `switch` — boolean toggle with labelled options (Auto/Custom)
- `item-selection-list` — horizontal icon picker (e.g., Left/Center/Right alignment)
- `icon-item` — icon entry within `item-selection-list`

**Implication**: property panel UI using these components is production-Qlik-Sense-only — cannot be tested, configured, or seen in Nebula Hub. Development workflow for dependent features:
1. Configure via the JSON properties editor (Modify Object Properties → Monaco editor) in Nebula Hub
2. Validate the full property panel UI in production Qlik Sense

Onboarding note to include: "The property panel as seen in Nebula Hub is not representative of production — configure via Monaco editor for Nebula Hub development."

**Settings accordion sub-sections**: `type: 'items'` groups nested within `settings.appearance.items` do NOT render a visible section header label in Qlik Sense. Put controls directly in `appearance.items` with descriptive `label` values on each control — a wrapping group adds no visible UI and appears blank.

**Park in Known Environment Unknowns**: recent Qlik Cloud native visualizations expose a global visual styling panel (font size, header colors, hover colors) apparently using a `components: []` property panel construct distinct from per-cell attribute expressions. As of June 2026 its source is not on public GitHub — requires web frontend inspection of a running Qlik Cloud instance. Do not attempt to implement without verified source or documentation.

## Prior Art in Repo
- domains/qlik-extension.md — documents Nebula Hub behaviors extensively but has no Hub-vs-production contrast section; Known Environment Unknowns section exists
- plans/attribute-expression-styling-pattern.md — the AER absence is load-bearing there too; full component list lives HERE, the pattern references it (DRY)

## Open Questions
- none
