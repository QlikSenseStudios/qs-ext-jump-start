const { expect } = require('@playwright/test');

/**
 * Common test utilities for all states
 */
module.exports = {
  async getExtensionState(page, content) {
    await page.waitForSelector(content, { visible: true });

    const states = ['extension-container', 'no-data', 'selection-mode', 'error-message'];

    for (const state of states) {
      const element = await page.$(content + ` .${state}`);
      if (element) {
        return state;
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
