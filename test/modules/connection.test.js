/**
 * @fileoverview Connection validation test module.
 *
 * Validates Qlik Cloud connection and Nebula Hub access.
 * Failure indicates incorrect environment setup requiring user intervention.
 */

const { test, expect } = require('@playwright/test');

/**
 * Connection validation tests.
 *
 * @param {Object} context - Test context with page, hub, and utilities
 * @param {import('@playwright/test').Page} context.page - Playwright page object
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} context.hub - Nebula Hub page object
 * @param {Function} context.slowForShow - Visual inspection helper
 */
function connectionTests(testContext) {
  test.describe('Connection', () => {
    test('validates nebula hub connection', async () => {
      const { page } = testContext;
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
}

module.exports = { connectionTests };
