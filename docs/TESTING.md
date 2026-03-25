# Testing Guide

Tests run against a live Qlik Sense environment via Playwright and the Nebula Hub development server. There are three test suites:

| Suite | What it validates |
| --- | --- |
| Connection | Nebula Hub URL, page title, app element |
| Environment | Property panel checkbox, modify properties button, extension view |
| Extension unconfigured | "Incomplete visualization" message, configuration panel fields |

## Setup

**1. Install dependencies**

```bash
npm install
npx playwright install
```

**2. Configure your Qlik environment**

Create a test application in Qlik Sense using `test/qlik-sense-app/load-script.qvs`. This provides the `Dim1` and `Expression1` fields the tests expect.

Then configure your connection:

- [Qlik Cloud Setup](./QLIK_CLOUD_SETUP.md)
- [Enterprise Setup](./QLIK_ENTERPRISE_SETUP.md)

**3. Start the development server**

```bash
npm run serve
```

## Running Tests

```bash
npm test                                        # run all tests
npx playwright test --headed                    # watch in browser
npx playwright test --grep "connection"         # run specific suite
npx playwright test --debug                     # step-by-step debugging
npx playwright show-report test/report          # open last HTML report
npm test -s -- --reporter=list                  # list reporter (CI-friendly)
```

## Troubleshooting

**Connection test fails**
- Verify Qlik Cloud/Enterprise credentials and application access
- Confirm the test application exists and data is loaded
- Check network connectivity to your Qlik tenant or server

**Environment test fails**
- Verify the app ID in your Nebula Hub URL matches your test application
- Run with `--headed` to visually inspect the Nebula Hub interface
- Confirm the extension loads in the Nebula Hub without errors

**Extension unconfigured test fails**
- Check `src/index.js` renders the "Incomplete visualization" state when unconfigured
- Verify `src/qae/object-properties.js` caption properties (title, subtitle, footnote) are present
- Confirm `src/qae/data.js` dimension/measure constraints are correctly configured

**Timeout errors**
- Verify your Qlik connection is stable
- Run with `--headed --workers=1` to isolate flaky behavior
- Increase timeout values in `playwright.config.js` if environment latency is high