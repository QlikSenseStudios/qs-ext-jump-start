/**
 * @fileoverview Connection validation test module.
 *
 * Validates that the Nebula Hub dev server is reachable and that the Qlik
 * engine connection is established. Failure indicates a configuration or
 * connectivity issue requiring user intervention — the test environment
 * cannot be corrected automatically. Check the setup guide for your target
 * platform:
 *   - Qlik Cloud:      docs/QLIK_CLOUD_SETUP.md
 *   - Qlik Enterprise: docs/QLIK_ENTERPRISE_SETUP.md
 */

import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../lib/core/identifiers.js';

/**
 * Connection validation tests.
 *
 * Checks that the dev server is running, the page is Nebula Hub, and the
 * Qlik engine URL and nebula.js version are present. These are prerequisites
 * for all other tests — if connection fails, extension tests will not run
 * meaningfully.
 *
 * @param {Object} testContext - Test context with page and utilities
 * @param {import('@playwright/test').Page} testContext.page - Playwright page object
 */
function connectionTests(testContext) {
  test.describe('Connection', () => {
    test('validates nebula hub connection', async () => {
      const { page } = testContext;
      const url = page.url();

      // Dev server path — confirms the Playwright baseURL and webServer config are correct.
      // Failing: the dev server is not running or baseURL in playwright.config.js is wrong.
      // Action: run `npm run serve` manually and verify it starts at localhost:8077.
      expect(
        url,
        `URL does not contain "/dev/" — Nebula Hub dev server may not be running or baseURL is misconfigured. ` +
          'Run `npm run serve` and verify the server starts at localhost:8077.'
      ).toContain('/dev/');

      // Page title — confirms the page that loaded is actually Nebula Hub.
      // Failing: a different page loaded (login redirect, error page, wrong URL).
      // Action: open localhost:8077/dev/ in a browser and confirm it shows Nebula Hub.
      const title = await page.title();
      expect(
        title.toLowerCase(),
        `Page title is "${title}" — expected "nebula hub". ` +
          'A different page loaded — check for login redirects or server errors at localhost:8077/dev/.'
      ).toBe('nebula hub');

      // Engine URL param — confirms .env is populated with a valid Qlik engine URL.
      // Failing: QLIK_ENGINE_HOST or QLIK_APP_ID is missing or empty in .env.
      // Action: verify your .env file has all required variables set. See docs/QLIK_CLOUD_SETUP.md.
      expect(
        url,
        'URL does not contain "engine_url=" — required .env variables are missing or empty. ' +
          'Verify QLIK_ENGINE_HOST and QLIK_APP_ID are set in your .env file.'
      ).toContain('engine_url=');

      // Nebula.js version element — confirms nebula.js initialised successfully in the page.
      // Failing: nebula.js failed to load or the Qlik engine connection was rejected.
      // Action: check the browser console for auth errors; verify your Qlik credentials in .env.
      const versionDiv = page.locator('div[data-nebulajs-version]');
      await expect(
        versionDiv,
        'Nebula.js version element not found — nebula.js did not initialise. ' +
          'Check the browser console for connection or authentication errors. ' +
          'Verify your Qlik credentials and engine URL in .env.'
      ).toBeAttached({ timeout: TIMEOUTS.NETWORK });

      const version = await versionDiv.getAttribute('data-nebulajs-version');
      expect(
        version,
        `Nebula.js version "${version}" does not match expected semver format. ` +
          'The hub loaded but reported an unexpected version string.'
      ).toMatch(/^\d+\.\d+\.\d+(-.+)?$/);

      // App container — confirms the nebula.js app mounted successfully.
      // Failing: nebula.js loaded but the app failed to mount (JS error after init).
      // Action: check the browser console for runtime errors after page load.
      await expect(
        page.locator('#app'),
        '#app container not found — nebula.js loaded but the app did not mount. ' +
          'Check the browser console for runtime errors.'
      ).toBeAttached({ timeout: TIMEOUTS.STANDARD });

      console.log(`✅ Connected to Nebula Hub with nebula.js version: ${version}`);
      test.info().annotations.push({
        type: 'info',
        description: `Nebula Hub connection validated at: ${url}`,
      });
    });
  });
}

export { connectionTests };
