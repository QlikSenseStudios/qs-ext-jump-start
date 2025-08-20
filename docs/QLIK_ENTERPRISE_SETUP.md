# Qlik Sense Enterprise Setup Guide

## Prerequisites

- Qlik Sense Enterprise November 2024 or later
- Administrator access to the Qlik Sense Management Console (QMC)
- A test application created with the load script from `./test/qlik-sense-app/load-script.qvs`

## Setup Steps

1. **Configure Virtual Proxy** in the QMC:
   - Set up Windows Ticket authentication
   - Whitelist the following URLs:
     - `http://localhost:8000` (development server)
     - `http://localhost:8077` (test server)

2. **Create test user**:
   - Create a local account on the Qlik Sense Enterprise Windows server
   - Log in to the Qlik Sense Hub with the new user to create the account
   - Grant access to the test application

3. **Create `.env` file** in the project root with these variables:

| Variable         | Example Value          | Description                       |
| ---------------- | ---------------------- | --------------------------------- |
| QLIK_ENGINE_HOST | qlik-sense-host-origin | Qlik Sense Enterprise host        |
| QLIK_VP_PREFIX   | virtual-proxy-prefix   | Virtual Proxy prefix              |
| QLIK_USERNAME    | username               | Username for authentication       |
| QLIK_PASSWORD    | password               | Password for authentication       |
| QLIK_APP_ID      | test-app-id            | The Qlik Sense app ID for testing |

## Next Steps

- Return to the main [README.md](../README.md) to continue development
- See [Testing Guide](./TESTING.md) for running Playwright tests
