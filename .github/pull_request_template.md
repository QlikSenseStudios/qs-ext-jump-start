## Summary

- What changed and why?
- Link to issue(s) if any

## Version bump

Apply one label to trigger an automatic version bump on merge — or omit to skip:
- `version:major` — breaking changes (API, requirements, behavior, dropped support)
- `version:minor` — new features, backwards-compatible additions, new capabilities
- `version:patch` — bug fixes and dependency updates affecting users or product code (src/, test/)
- *(Omit label)* — infrastructure only (CI/CD, context system, build tooling, templates)

## Checklist

- [ ] Version bump label applied (or intentionally omitted)
- [ ] Lint passes locally (npm run -s lint)
- [ ] I ran tests locally (npm test -s -- --reporter=list) and they passed for my environment
- [ ] If package.json changed, I ran `npm install` and committed package-lock.json
- [ ] Docs updated if behavior changed (README/docs)

## Notes for reviewers

- Risks, roll-out plan, or anything unusual reviewers should know
