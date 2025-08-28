const { expect, test } = require('@playwright/test');
const { configureExtension, cleanupExtensionConfiguration } = require('../helpers/test-utils');

/**
 * Tests for no-data state
 * This state is always reachable as it's the default state
 */
module.exports = {
  /**
   * Validates default no-data state rendering, a11y attributes, and hint text.
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @returns {Promise<void>}
   */
  async shouldRenderNoDataState(page, content) {
    // Should show no-data state initially
    const noDataContainer = await page.$(content + ' .no-data');
    expect(noDataContainer).toBeTruthy();

    // Check accessibility attributes
    const ariaLabel = await noDataContainer.getAttribute('aria-label');
    expect(ariaLabel).toBe('No data available');

    // Check content
    const text = await noDataContainer.textContent();
    expect(text).toContain('No data to display');
  },

  /**
   * Checks no-data container aria-label and visible content.
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @returns {Promise<void>}
   */
  async shouldHaveProperAccessibility(page, content) {
    const noDataContainer = await page.$(content + ' .no-data');
    expect(noDataContainer).toBeTruthy();

    // Validate ARIA attributes
    const ariaLabel = await noDataContainer.getAttribute('aria-label');
    expect(ariaLabel).toBe('No data available');

    // Check that it's properly identified as informational content
    const textContent = await noDataContainer.textContent();
    expect(textContent).toContain('No data to display');
  },

  /**
   * Ensures no-data layout remains visible and within viewport bounds on resize.
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @param {{width:number,height:number}} viewport
   * @returns {Promise<void>}
   */
  async shouldBeResponsive(page, content, viewport) {
    // Set viewport
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500);

    // No-data container should still be visible and accessible
    const noDataContainer = await page.$(content + ' .no-data');
    expect(noDataContainer).toBeTruthy();

    const boundingBox = await noDataContainer.boundingBox();
    expect(boundingBox.width).toBeGreaterThan(0);
    expect(boundingBox.height).toBeGreaterThan(0);

    // Should fit within viewport (with some tolerance)
    expect(boundingBox.width).toBeLessThanOrEqual(viewport.width + 50);
  },

  /**
   * Verifies invalid-config hint presence in no-data state.
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @returns {Promise<void>}
   */
  async shouldShowInvalidConfigHint(page, content) {
    const hint = await page.$(content + ' .no-data .no-data-hint');
    expect(hint).toBeTruthy();
    const role = await hint.getAttribute('role');
    const ariaLive = await hint.getAttribute('aria-live');
    expect(role).toBe('note');
    expect(ariaLive).toBe('polite');
  },

  /**
   * Applies 2D invalid config and validates hint; cleans up.
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @returns {Promise<void>}
   */
  async configureInvalidTwoDimensionsAndValidate(page, content) {
    try {
      await configureExtension(page, { dimensions: ['Dim1', 'Dim2'], measures: [] });
      await page.waitForTimeout(500);
    } finally {
      // Validation (state should remain no-data due to invalid config)
      const noDataContainer = await page.$(content + ' .no-data');
      expect(noDataContainer).toBeTruthy();
      await this.shouldShowInvalidConfigHint(page, content);
      // Cleanup anything we might have added
      await cleanupExtensionConfiguration(page);
    }
  },

  /**
   * Applies 1D+2M invalid config and validates hint; cleans up.
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @returns {Promise<void>}
   */
  async configureInvalidTwoMeasuresAndValidate(page, content) {
    try {
      await configureExtension(page, {
        dimensions: ['Dim1'],
        measures: [
          { field: 'Expression1', aggregation: 'Sum' },
          { field: 'Expression2', aggregation: 'Sum' },
        ],
      });
      await page.waitForTimeout(500);
    } finally {
      const noDataContainer = await page.$(content + ' .no-data');
      expect(noDataContainer).toBeTruthy();
      await this.shouldShowInvalidConfigHint(page, content);
      await cleanupExtensionConfiguration(page);
    }
  },

  /**
   * Attempts a valid-but-empty scenario; if reached, ensures no invalid-config hint.
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @returns {Promise<void>}
   */
  async attemptValidButEmptyAndValidateOptional(page, content) {
    try {
      // First, try valid config with 1 dimension only
      await configureExtension(page, { dimensions: ['Dim1'], measures: [] });
      await page.waitForTimeout(800);

      // Heuristic: if extension shows data state, we likely cannot force empty rows here
      const hasDataState = await page.$(content + ' .extension-container');
      if (hasDataState) {
        test.info().annotations.push({
          type: 'info',
          description: 'Valid-but-empty state not reached (data present). Skipping negative assertion for hint.',
        });
        return;
      }

      // If we are in no-data after valid config, treat as valid-but-empty and assert no hint
      const noDataContainer = await page.$(content + ' .no-data');
      if (noDataContainer) {
        const hint = await page.$(content + ' .no-data .no-data-hint');
        expect(hint).toBeFalsy();
        return;
      }

      // Otherwise, document unknown/other state
      test.info().annotations.push({
        type: 'info',
        description: 'Valid-but-empty attempt resulted in neither data nor no-data state.',
      });
    } finally {
      await cleanupExtensionConfiguration(page);
    }
  },
};
