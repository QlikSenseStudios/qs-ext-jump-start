# Project Standards

Essential quality guidelines that apply regardless of project type.

## Universal Principles
1. **Clarity**: Code and documentation should be self-explanatory
2. **Consistency**: Follow established patterns within each domain
3. **Simplicity**: Prefer straightforward solutions
4. **Maintainability**: Consider future modifications

## File Organization
- Use descriptive names for files and directories
- Group related files logically
- Separate concerns appropriately (source, tests, docs, config)
- Follow domain conventions for naming and structure

## Documentation Requirements
- **README.md**: Purpose, usage, setup instructions
- **Code Comments**: Explain why, not what
- **Decision Records**: Document significant choices and rationale

## Version Control
- Use Git with descriptive commit messages
- Include appropriate .gitignore for project type
- Never commit secrets or credentials
- Conventional commit messages: `type: description` with bulleted body
- Branch naming: `feature/`, `fix/`, `chore/`, `docs/`, `ci/`
- Squash merge to `main`

## Quality Gates
- Establish validation appropriate for project type
- Use automated formatting where available
- Include basic testing where applicable
- Review before committing
- `npm run lint` must pass before committing
- `npm run build` must pass before PRs to `main`
- All non-skipped tests must pass (or be explicitly documented as environment-gated)

## Context Integration
- Load domain-specific standards from domains/{type}.md
- Reference patterns/ for implementation approaches
- Use tools/ contexts for tool-specific configurations

---
*Adapt these standards based on loaded domain contexts*