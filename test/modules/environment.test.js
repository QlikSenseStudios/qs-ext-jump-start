/**
 * @fileoverview Environment validation test module.
 *
 * Validates essential UI components are accessible for extension development.
 * Failure indicates environment setup issues requiring user intervention.
 */

const { test, expect } = require('@playwright/test');

/**
 * Environment validation tests.
 *
 * @param {Object} context - Test context with page, hub, and utilities
 * @param {import('@playwright/test').Page} context.page - Playwright page object
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} context.hub - Nebula Hub page object
 * @param {Function} context.slowForShow - Visual inspection helper
 */
function environmentTests(testContext) {
  test.describe('Environment', () => {
    test('validates environment components', async () => {
      const { hub } = testContext;
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
}

module.exports = { environmentTests };
