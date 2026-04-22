/**
 * @fileoverview Hub ready validation test module.
 *
 * Validates that the Nebula Hub environment is available and the extension
 * is loaded and accessible for testing. Failure indicates a setup issue
 * requiring user intervention — the test environment cannot be corrected
 * automatically. Check the setup guide for your target platform:
 *   - Qlik Cloud:      docs/QLIK_CLOUD_SETUP.md
 *   - Qlik Enterprise: docs/QLIK_ENTERPRISE_SETUP.md
 */

import { test, expect } from '@playwright/test';
import { IDENTIFIERS, TIMEOUTS } from '../lib/core/identifiers.js';

/**
 * Hub ready validation tests.
 *
 * Checks that the three core Nebula Hub UI controls are present and accessible.
 * These controls are the foundation for all subsequent extension tests — if any
 * are missing, extension tests will fail for environmental reasons, not code reasons.
 *
 * @param {Object} testContext - Test context with page, hub, and utilities
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} testContext.hub - Nebula Hub page object
 */
function hubReadyTests(testContext) {
  test.describe('Hub Ready', () => {
    test('validates nebula hub controls are accessible', async () => {
      const { hub } = testContext;

      // Property cache checkbox — confirms the Nebula Hub settings panel is rendered.
      // Missing: Nebula Hub did not load correctly or the UI structure has changed.
      // Action: verify `npm run serve` is running and the hub loads at localhost:8077/dev/.
      await expect(
        hub.page.locator(IDENTIFIERS.PROPERTY_CACHE_CHECKBOX),
        'Property cache checkbox not found — Nebula Hub settings panel did not render. ' +
          'Verify the dev server is running (`npm run serve`) and the hub loads correctly.'
      ).toBeVisible({ timeout: TIMEOUTS.NETWORK });
      console.log('   • Property cache checkbox: ✅ Nebula Hub settings panel accessible');

      // Modify properties button — confirms the extension object is present in the hub.
      // Missing: extension did not register or the hub failed to create a visualization object.
      // Action: check browser console for extension load errors; verify `npm run serve` output.
      await expect(
        hub.page.locator(IDENTIFIERS.MODIFY_PROPERTIES_BUTTON),
        'Modify properties button not found — extension object was not created in Nebula Hub. ' +
          'Check the browser console for extension load errors and verify `npm run serve` output.'
      ).toBeVisible({ timeout: TIMEOUTS.NETWORK });
      console.log('   • Modify properties button: ✅ Extension object present in hub');

      // Extension view container — confirms the extension rendered and its aria-label matches package.json name.
      // Missing: extension name in package.json does not match what Nebula Hub loaded, or render failed.
      // Action: verify `name` in package.json matches the extension loaded in the hub; check for render errors.
      await expect(
        hub.page.locator(IDENTIFIERS.EXTENSION_VIEW),
        `Extension view not found (aria-label="${IDENTIFIERS.EXTENSION_TITLE}") — ` +
          'extension did not render or the name in package.json does not match what is loaded in Nebula Hub. ' +
          'Verify the extension name and check for render errors in the browser console.'
      ).toBeAttached({ timeout: TIMEOUTS.NETWORK });
      console.log(`   • Extension view: ✅ Extension rendered (${IDENTIFIERS.EXTENSION_TITLE})`);

      console.log('✅ Nebula Hub ready — all controls accessible');
      test.info().annotations.push({
        type: 'info',
        description: 'Nebula Hub controls validated — environment ready for extension testing',
      });
    });
  });
}

export { hubReadyTests };
