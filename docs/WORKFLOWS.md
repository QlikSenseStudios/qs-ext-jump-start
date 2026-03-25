# Workflows & Common Tasks

Common tasks for extension developers building on this template.

## Rename & Rebrand

After creating your repo from this template:

1. Update `package.json` — name, description, repository, homepage, bugs
2. Update `src/meta.json` — name, icon, preview
3. Update titles and labels in `src/qae/object-properties.js`
4. Update `README.md` to reflect your extension's name and purpose

## Customize the Extension

| Goal | Where to start |
| --- | --- |
| Change extension logic | `src/index.js` |
| Add or modify property panel fields | `src/qae/object-properties.js` |
| Change data shape (dimensions/measures) | `src/qae/data.js` |
| Change styles | `src/styles.css` |
| Add utility functions | `src/utils.js` |

## Development Loop

```bash
npm run serve     # start dev server at localhost:8000
# edit src/ — changes reload automatically
npm run lint      # check for lint errors
npm test          # run E2E tests (requires live Qlik environment)
npm run package   # package for deployment when ready
```

## Write a New Test

Extend `test/qs-ext.e2e.js` using the patterns in the existing suite. See [Testing Guide](./TESTING.md) for setup and troubleshooting.

## Deploy

Build and package: `npm run package` — output goes to `<extension-name>-ext/`. Zip that folder and upload to Qlik Sense. See [Deployment](./DEPLOYMENT.md) for platform-specific steps.
