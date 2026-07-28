# Property Configuration Architecture

**Roadmap entry**: Document the three-file property configuration split (object-properties.js / data.js / ext.js) and add boundary comments to the scaffold files.
**Depends on**: none
**Complexity**: Low
**Execution tier**: light

## Target Files
- .ai-toolbox/domains/qlik-extension.md — modify — Property Panel (QAE) section gains the role-boundary table
- src/qae/object-properties.js — modify — boundary comment naming the other two files
- src/qae/data.js — modify — boundary comment
- src/ext.js — modify — boundary comment

## Source Notes
Property configuration is split across three files with strict role boundaries:

| File | Owns | Does NOT own |
|------|------|-------------|
| `src/qae/object-properties.js` | Default property state not defined by data.js item definitions — hypercube structure (`qHyperCubeDef`), caption fields (`title`, `subtitle`, `footnote`), custom top-level props (`props.*`) | Property panel structure; show conditions; item definitions |
| `src/qae/data.js` | All property item definitions — refs, ids, labels, `change` callbacks, component types, `defaultValue`; named group exports for ext.js; private AER wrappers in data targets | Show conditions; panel display order; panel visibility logic |
| `src/ext.js` | Property panel display assembly — imports named item groups from data.js; controls display order via key order in the items object; adds all `show` conditions | Property data definitions; refs; `change` callbacks; `defaultValue` |

Why the separation matters:
- data.js is the data definition, not the panel organizer — ext.js decides where items appear; data.js decides what they are
- Show conditions belong exclusively in ext.js — items in data.js have no `show`; ext.js spreads the item and decorates it, so items are reusable across panel sections with different visibility rules
- object-properties.js sets defaults, not item behavior — items write to the property tree at their `ref` paths; object-properties.js does not pre-declare those slots

**Practical rule**: a `ref`, `type`, `defaultValue`, or `change` callback outside data.js belongs in data.js; a `show` condition outside ext.js belongs in ext.js.

## Prior Art in Repo
- domains/qlik-extension.md Property Panel (QAE) section — already assigns coarse roles (object-properties.js defaults, ext.js accordion, data.js data binding); this item deepens it with the table and the practical rule
- The AER-wrapper language in the table only becomes concrete once plans/attribute-expression-styling-pattern.md lands — phrase generically if this item lands first

## Open Questions
- Comment wording must survive the template's example-vs-boilerplate distinction: these three files are partly "example implementation — replace with your own" per context.development.md eligibility rules
