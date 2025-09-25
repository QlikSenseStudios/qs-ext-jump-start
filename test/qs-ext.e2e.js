/**
 * @fileoverview E2E test orchestrator for Qlik Sense extension testing.
 *
 * This file serves as the main entry point for all E2E tests, importing and
 * orchestrating test modules for comprehensive extension validation.
 *
 * Test modules:
 * - Connection: Validates Qlik Cloud connection and Nebula Hub access
 * - Environment: Validates essential UI components are accessible
 * - Extension Unconfigured: Tests extension unconfigured state behavior
 */

const { test } = require('@playwright/test');
const { getNebulaQueryString, getQlikServerAuthenticatedContext } = require('./qs-ext.connect');
const { NebulaHubPage } = require('./lib');
const { connectionTests, environmentTests, extensionUnconfiguredTests } = require('./modules');

/**
 * Pauses execution when running in headed mode to allow visual inspection.
 *
 * @param {import('@playwright/test').TestInfo} testInfo - Test information
 * @param {import('@playwright/test').Page} page - Browser page
 * @param {number} [timeoutInMs=2000] - Pause duration in milliseconds
 */
async function slowForShow(testInfo, page, timeoutInMs = 2000) {
  if (!testInfo.project.use.headless) {
    await page.waitForTimeout(timeoutInMs);
  }
}

/**
 * Main test orchestrator.
 *
 * Sets up the testing environment and coordinates the execution of all test modules.
 * Provides shared context and utilities to each test module.
 */
test.describe('Qlik Sense Extension E2E Tests', () => {
  const nebulaQueryString = getNebulaQueryString();

  let context;
  let page;
  let hub;

  test.beforeAll(async ({ browser }) => {
    context = await getQlikServerAuthenticatedContext({ browser });
  });

  test.afterAll(async () => {
    await context.close();
  });

  // Create fresh page for each test
  test.beforeEach(async () => {
    page = await context.newPage();
    console.log(`✅ Test page created.`);

    await page.goto(`/dev/${nebulaQueryString}`, { waitUntil: 'domcontentloaded' });
  });

  test.afterEach(async () => {
    if (page) {
      // Pause for visual inspection in headed mode
      await slowForShow(test.info(), page, 2000);

      // Close page to ensure clean state
      await page.close();
      console.log(`✅ Test page closed.`);
    }
  });

  // Test context shared across all modules
  const testContext = {
    get page() {
      return page;
    },
    get hub() {
      return hub;
    },
    slowForShow,
  };

  // Connection tests - don't need NebulaHubPage
  connectionTests(testContext);

  // Tests that require NebulaHubPage
  test.describe('Extension Development Tests', () => {
    test.beforeEach(async () => {
      // Initialize page object for tests that need it
      hub = new NebulaHubPage(page);
    });

    test.afterEach(async () => {
      if (hub) {
        // Pause for visual inspection in headed mode
        await slowForShow(test.info(), page, 3000);

        // Clear validation cache for clean state between tests
        const { clearValidationCache } = require('./lib/core/validation');
        clearValidationCache(page);
        console.log('🧹 Cleared validation cache for clean state');

        // Reset extension configuration to clean state
        console.log('🧹 Clearing nebula hub configuration in teardown');
        const resetSuccess = await hub.resetConfiguration();
        if (resetSuccess) {
          console.log('   • Configuration reset: ✅ Success');
        } else {
          console.log('   • Configuration reset: ⚠️ Skipped (already empty or unavailable)');
        }
      }
    });

    environmentTests(testContext);
    extensionUnconfiguredTests(testContext);
  });
});
