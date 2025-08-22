# Qlik Cloud Setup Guide

This guide describes how to set up Qlik Cloud for use developing an extension based on the QS-Ext-Jump-Start template. For technical details, see code files in `src/` and `test/` folders, including a data load script for a Qlik Sense app in `test/qlik-sense-app/`.

## Prerequisites

- Access to a Qlik Cloud tenant with administrator privileges
- A test application created using the load script in `test/qlik-sense-app/load-script.qvs`

## Setup Steps

1. **Create a test user** and grant access to your test application.

2. **Configure Web Integration ID** in your tenant's administration menu:
   - Navigate to the "Web" section
   - Whitelist the following origins:
     - `http://localhost:8000` (development server)
     - `http://localhost:8077` (test server)

3. **Create `.env` file** in the project root with these variables:

| Variable                | Example Value                    | Description                                |
| ----------------------- | -------------------------------- | ------------------------------------------ |
| QLIK_ENGINE_HOST        | your-tenant.region.qlikcloud.com | Qlik Cloud tenant host                     |
| QLIK_WEB_INTEGRATION_ID | tenant-web-integration-id        | Web Integration ID for cross-site requests |
| QLIK_USERNAME           | username                         | Username for authentication                |
| QLIK_PASSWORD           | password                         | Password for authentication                |
| QLIK_APP_ID             | test-app-id                      | The Qlik Sense app ID for testing          |

## Next Steps

- Return to the main [README.md](../README.md) to continue development
- See [Testing Guide](./TESTING.md) for running Playwright tests
