## Summary

- What changed and why?
- Link to issue(s) if any

## Version bump

Apply one label to trigger an automatic version bump on merge — or none to skip:
- `version:patch` — bug fixes, dependency updates, minor corrections
- `version:minor` — new features, backwards-compatible additions
- `version:major` — breaking changes

## Checklist

- [ ] Version bump label applied (or intentionally omitted)
- [ ] Lint passes locally (npm run -s lint)
- [ ] I ran tests locally (npm test -s -- --reporter=list) and they passed for my environment
- [ ] If package.json changed, I ran `npm install` and committed package-lock.json
- [ ] Docs updated if behavior changed (README/docs/CHANGELOG)

## Notes for reviewers

- Risks, roll-out plan, or anything unusual reviewers should know
