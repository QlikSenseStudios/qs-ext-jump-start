const { expect } = require('@playwright/test');

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
    expect(text).toBe('No data to display');
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
};
