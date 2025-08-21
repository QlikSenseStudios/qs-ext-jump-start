const { expect } = require('@playwright/test');

/**
 * Common Test Utilities Module
 * Provides shared functionality for extension state detection and validation
 * Used across all test modules to maintain consistency
 */
module.exports = {
  /**
   * Detects the current state of the extension by checking for state-specific CSS classes
   * @param {Page} page - Playwright page object
   * @param {string} content - Extension content selector
   * @returns {Promise<string>} Current state name or 'unknown' if undetected
   */
  async getExtensionState(page, content) {
    await page.waitForSelector(content, { visible: true });

    // Define state hierarchy - check in order of specificity
    const stateClasses = ['extension-container', 'no-data', 'selection-mode', 'error-message'];

    for (const stateClass of stateClasses) {
      const element = await page.$(content + ` .${stateClass}`);
      if (element) {
        return stateClass;
      }
    }

    return 'unknown';
  },

  async waitForExtensionRender(page, content) {
    await page.waitForSelector(content, { visible: true });
    await page.waitForTimeout(500); // Allow for render completion
  },

  async validateStateExists(page, content, expectedStates) {
    const currentState = await this.getExtensionState(page, content);
    expect(expectedStates).toContain(currentState);
    return currentState;
  },

  async testResponsiveDesign(page, content, viewports) {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      // Ensure content is still visible
      const container = await page.$(content);
      expect(container).toBeTruthy();

      const boundingBox = await container.boundingBox();
      expect(boundingBox.width).toBeGreaterThan(0);
      expect(boundingBox.height).toBeGreaterThan(0);

      // Should fit within viewport (with tolerance for scrollbars)
      expect(boundingBox.width).toBeLessThanOrEqual(viewport.width + 50);
    }
  },

  async validateBasicAccessibility(page, content) {
    // Basic accessibility check that applies to all states
    const container = await page.$(content);
    expect(container).toBeTruthy();

    // Check that container is visible
    const isVisible = await container.isVisible();
    expect(isVisible).toBe(true);

    // Check that there's some content
    const hasContent = await container.evaluate((el) => el.innerHTML.length > 0);
    expect(hasContent).toBe(true);
  },
};
