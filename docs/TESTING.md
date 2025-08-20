# Testing Guide

## Setup

Install the Playwright web testing framework:

```bash
npx playwright install
```

## Environment Configuration

Create a `.env` file in the project root with your Qlik Sense environment variables. See setup guides for your environment:

- [Qlik Cloud Setup](./QLIK_CLOUD_SETUP.md)
- [Qlik Enterprise Setup](./QLIK_ENTERPRISE_SETUP.md)

## Running Tests

Execute the Playwright tests:

```bash
npm test
```

View the test report:

```bash
npm run serve:report
```

## Test Structure

- `test/qs-ext.e2e.js` - Main end-to-end tests
- `test/qs-ext.connect.js` - Qlik Sense connection utilities
- `test/qs-ext.fixture.js` - Test fixtures and configuration

## Writing New Tests

Add new tests to `test/qs-ext.e2e.js` following the existing patterns. For more guidance, see:

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Knowledge Base](../KNOWLEDGE_BASE.md)
