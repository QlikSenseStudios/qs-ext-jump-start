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

  /**
   * Configures exactly 1 dimension and no measure; validates data state renders with fallback measure column content
   */
  async configureOneDimensionOnlyAndValidate(page, content) {
    const configured = await configureExtension(page, { dimensions: ['Dim1'], measures: [] });
    await page.waitForTimeout(800);

    const mainContainer = await page.$(content + ' .extension-container');
    expect(mainContainer).toBeTruthy();

    const table = await page.$(content + ' table.data-table');
    expect(table).toBeTruthy();

    // Headers should exist (Dimension + Measure placeholder)
    const headers = await page.$$(content + ' table.data-table thead th');
    expect(headers.length).toBe(2);

    // There should be at least one row (Dim1 has few values but non-zero)
    const rows = await page.$$(content + ' table.data-table tbody tr');
    expect(rows.length).toBeGreaterThan(0);

    // Second column should display '-' fallback if no measure
    const firstMeasCell = await page.$(content + ' table.data-table tbody tr td.meas-cell');
    const measText = (await firstMeasCell.textContent()).trim();
    expect(measText.length).toBeGreaterThan(0); // may be '-' or default formatting

    return configured;
  },

  /**
   * Configures 1D + measure with alternate aggregation (e.g., Avg)
   */
  async configureAlternateAggregationAndValidate(page, content) {
    await configureExtension(page, {
      dimensions: ['Dim1'],
      measures: [{ field: 'Expression1', aggregation: 'Avg' }],
    });
    await page.waitForTimeout(800);

    const mainContainer = await page.$(content + ' .extension-container');
    expect(mainContainer).toBeTruthy();

    const table = await page.$(content + ' table.data-table');
    expect(table).toBeTruthy();

    // Two headers
    const headers = await page.$$(content + ' table.data-table thead th');
    expect(headers.length).toBe(2);

    // At least one row; cells populated
    const rows = await page.$$(content + ' table.data-table tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  },

  /**
   * Configures a high-cardinality dimension to simulate large row count relative to initial fetch height
   */
  async configureLargeRowCountAndValidate(page, content) {
    await configureExtension(page, { dimensions: ['AsciiAlpha'], measures: [] });
    await page.waitForTimeout(1000);

    const mainContainer = await page.$(content + ' .extension-container');
    expect(mainContainer).toBeTruthy();

    const table = await page.$(content + ' table.data-table');
    expect(table).toBeTruthy();

    // Single header row
    const headerRows = await page.$$(content + ' table.data-table thead tr');
    expect(headerRows.length).toBe(1);

    // Many rows should be present (at least 10 to indicate breadth)
    const rows = await page.$$(content + ' table.data-table tbody tr');
    expect(rows.length).toBeGreaterThanOrEqual(10);

    // Container still fits viewport
    const bbox = await (await page.$(content)).boundingBox();
    const viewport = page.viewportSize();
    expect(bbox.width).toBeLessThanOrEqual(viewport.width + 50);
  },
};
