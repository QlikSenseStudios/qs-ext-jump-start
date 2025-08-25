const { expect } = require('@playwright/test');
const { configureExtension, cleanupExtensionConfiguration } = require('../helpers/test-utils');

/**
 * Data State Test Module
 * Tests extension behavior when successfully configured with dimensions and measures
 * Validates data rendering, accessibility, and interaction capabilities
 */
module.exports = {
  /**
   * Attempts to configure the extension with test dimensions and measures
   * Uses Nebula hub interface to add Dim1 dimension and Expression1 measure with Sum aggregation
   * @param {Page} page - Playwright page object
   * @param {string} _content - Extension content selector (unused, for interface consistency)
   * @returns {Promise<boolean>} True if configuration successful
   */
  async attemptConfiguration(page, _content) {
    const configured = await configureExtension(page, {
      dimensions: ['Dim1'],
      measures: [{ field: 'Expression1', aggregation: 'Sum' }],
    });

    return configured;
  },

  /**
   * Performs targeted cleanup of configured dimensions and measures
   * Removes only the items that were successfully added during configuration
   * @param {Page} page - Playwright page object
   * @param {string} _content - Extension content selector (unused, for interface consistency)
   * @returns {Promise<boolean>} True if cleanup successful
   */
  async cleanupConfiguration(page, _content) {
    return await cleanupExtensionConfiguration(page);
  },

  /**
   * Validates that the extension renders properly in data state
   * Checks for main container and basic accessibility attributes
   * @param {Page} page - Playwright page object
   * @param {string} content - Extension content selector
   */
  async shouldRenderDataState(page, content) {
    const mainContainer = await page.$(content + ' .extension-container');

    // Validate main container exists with proper accessibility
    if (mainContainer) {
      const role = await mainContainer.getAttribute('role');
      const ariaLabel = await mainContainer.getAttribute('aria-label');
      expect(role).toBe('main');
      expect(ariaLabel).toBe('Qlik Sense Extension Content');

      // Check that table exists
      const table = await mainContainer.$('table.data-table');
      expect(table).toBeTruthy();

      return true;
    }

    return false;
  },

  async shouldHaveProperAccessibility(page, content) {
    const mainContainer = await page.$(content + ' .extension-container');

    if (mainContainer) {
      // Validate accessibility attributes
      const role = await mainContainer.getAttribute('role');
      const ariaLabel = await mainContainer.getAttribute('aria-label');
      const tabindex = await mainContainer.getAttribute('tabindex');

      expect(role).toBe('main');
      expect(ariaLabel).toBe('Qlik Sense Extension Content');
      expect(tabindex).toBe('0');
    }
  },

  async shouldSupportKeyboardNavigation(page, content) {
    const mainContainer = await page.$(content + ' .extension-container');

    if (mainContainer) {
      // Test keyboard focus
      await mainContainer.focus();

      // Verify focus
      const activeElement = await page.evaluateHandle(() => document.activeElement);
      const isFocused = await page.evaluate(({ main, active }) => main === active, {
        main: mainContainer,
        active: activeElement,
      });
      expect(isFocused).toBe(true);

      // Verify tabindex
      const tabindex = await mainContainer.getAttribute('tabindex');
      expect(tabindex).toBe('0');
    }
  },

  async shouldDisplayDataCorrectly(page, content) {
    const mainContainer = await page.$(content + ' .extension-container');

    if (mainContainer) {
      // Check for content structure
      const contentDiv = await mainContainer.$('.content');
      expect(contentDiv).toBeTruthy();

      // Table should have header cells for Dimension and Measure
      const headers = await contentDiv.$$('table.data-table thead th');
      expect(headers.length).toBe(2);
      const headerTexts = await Promise.all(headers.map(async (h) => (await h.textContent()).trim()));
      expect(headerTexts[0].length).toBeGreaterThan(0); // Dimension title exists
      expect(headerTexts[1].length).toBeGreaterThan(0); // Measure title exists (or default)
    }
  },
};
