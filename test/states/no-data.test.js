const { expect, test } = require('@playwright/test');
const { configureExtension, cleanupExtensionConfiguration } = require('../helpers/test-utils');

/**
 * Tests for no-data state
 * This state is always reachable as it's the default state
 */
module.exports = {
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
   * Verifies that the invalid configuration hint is shown in no-data state
   * Applies to cases like 0 dimensions, 2+ dimensions, or >1 measures
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
   * Configures 2 dimensions (invalid), expects no-data with hint
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
   * Configures 1 dimension + 2 measures (invalid), expects no-data with hint
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
   * Attempts to reach a valid-but-empty state (1D, optional 1M, zero rows).
   * If reached, verifies that no invalid-config hint is shown.
   * If not reachable in this environment, records an info annotation and returns.
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
