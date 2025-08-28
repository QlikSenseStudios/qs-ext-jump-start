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

    // Define state classes. Selection mode is indicated by 'in-selection' on extension-container.
    const stateClasses = ['extension-container', 'no-data', 'error-message'];

    // Selection mode check first for accuracy
    const inSelection = await page.$(content + ' .extension-container.in-selection');
    if (inSelection) {
      return 'selection-mode';
    }

    for (const stateClass of stateClasses) {
      const element = await page.$(content + ` .${stateClass}`);
      if (element) {
        return stateClass;
      }
    }

    return 'unknown';
  },

  /**
   * Waits for the extension root to render and adds a small delay for layout stabilization.
   * @param {Page} page - Playwright page object
   * @param {string} content - Extension content selector
   * @returns {Promise<void>}
   */
  async waitForExtensionRender(page, content) {
    await page.waitForSelector(content, { visible: true });
    await page.waitForTimeout(500); // Allow for render completion
  },

  /**
   * Asserts the current state is one of the expected states and returns it.
   * @param {Page} page - Playwright page object
   * @param {string} content - Extension content selector
   * @param {string[]} expectedStates - Allowed states
   * @returns {Promise<string>} The detected current state
   */
  async validateStateExists(page, content, expectedStates) {
    const currentState = await this.getExtensionState(page, content);
    expect(expectedStates).toContain(currentState);
    return currentState;
  },

  /**
   * Simple responsive smoke: resizes viewport and ensures content stays visible and within width tolerance.
   * @param {Page} page - Playwright page object
   * @param {string} content - Extension content selector
   * @param {{width:number,height:number}[]} viewports - List of viewport sizes to test
   * @returns {Promise<void>}
   */
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

  /**
   * Minimal a11y baseline: root exists, is visible, and contains some content.
   * @param {Page} page - Playwright page object
   * @param {string} content - Extension content selector
   * @returns {Promise<void>}
   */
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
