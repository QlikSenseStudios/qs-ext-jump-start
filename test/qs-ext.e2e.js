/**
 * @fileoverview E2E tests for validating user environment setup.
 *
 * These tests validate that the user has correctly configured their development environment.
 * If either test fails, it indicates a problem that requires user intervention to fix.
 *
 * Tests:
 * - Connection: Validates Qlik Cloud connection and Nebula Hub access
 * - Environment: Validates essential UI components are accessible
 */

const { test, expect } = require('@playwright/test');
const { getNebulaQueryString, getQlikServerAuthenticatedContext } = require('./qs-ext.connect');
const { NebulaHubPage } = require('./lib');

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
 * Environment validation tests.
 *
 * Validates that the user has correctly set up their development environment.
 * Failures indicate setup issues that require user intervention.
 */
test.describe('Qlik Sense Extension E2E Tests', () => {
  const nebulaQueryString = getNebulaQueryString();

  let context;
  let page;

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

  /**
   * Validates Qlik Cloud connection and Nebula Hub access.
   * Failure indicates incorrect environment setup requiring user intervention.
   */
  test.describe('Connection', () => {
    test('validates nebula hub connection', async () => {
      const url = page.url();

      // Validate nebula development mode
      expect(url).toContain('/dev/');

      // Validate page title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      expect(title.toLowerCase()).toBe('nebula hub');

      // Validate Qlik Cloud connection
      expect(url).toContain('engine_url=');

      // Validate nebula.js version element
      await page.waitForSelector('div[data-nebulajs-version]', { state: 'attached' });
      const versionDiv = await page.$('div[data-nebulajs-version]');
      expect(versionDiv).toBeTruthy();
      const version = await versionDiv.getAttribute('data-nebulajs-version');
      expect(version).toMatch(/^\d+\.\d+\.\d+(-.+)?$/);

      const appDiv = await page.$('#app');
      expect(appDiv).toBeTruthy();

      console.log(`✅ Connected to Nebula Hub with Nebula.js version: ${version}`);

      test.info().annotations.push({
        type: 'info',
        description: `Nebula hub validated at: ${url}`,
      });
    });
  });

  test.describe('Environment', () => {
    let hub;

    test.beforeEach(async () => {
      // Should give us access to the page components for use in tests
      hub = new NebulaHubPage(page);
    });

    test.afterEach(async () => {
      // Clear validation cache for clean state between tests
      const { clearValidationCache } = require('./lib/core/validation');
      clearValidationCache(page);
      console.log('🧹 Cleared validation cache for clean state');

      await slowForShow(test.info(), page, 2000);

      // Reset extension configuration to clean state
      console.log('🧹 Clearing nebula hub configuration in Environment teardown');
      const resetSuccess = await hub.resetConfiguration();
      if (resetSuccess) {
        console.log('   • Configuration reset: ✅ Success');
      } else {
        console.log('   • Configuration reset: ⚠️ Skipped (already empty or unavailable)');
      }
    });

    test('validates environment components', async () => {
      // Validate required components using hub object
      const validation = await hub.validateEnvironment();

      expect(validation.components.propertyCacheCheckbox).toBe(true);
      console.log('   • Property cache checkbox (Identifies configuration panel for updating properties): ✅ Found');
      expect(validation.components.modifyPropertiesButton).toBe(true);
      console.log('   • Modify properties button (Accesses currently declared property state): ✅ Found');
      expect(validation.components.extensionView).toBe(true);
      console.log('   • Extension view component (Renders the extension being developed): ✅ Found');

      console.log('✅ All key environment components validated');
      test.info().annotations.push({
        type: 'info',
        description: 'Environment components validated successfully',
      });
    });
  });
});
