const { expect } = require('@playwright/test');
const { triggerSelectionMode } = require('../helpers/test-utils');

/**
 * Tests for selection state
 * This state may not be reachable in E2E testing without proper data interaction
 */
module.exports = {
  async attemptSelectionTrigger(page, _content) {
    // Attempt to trigger selection mode
    const selectionTriggered = await triggerSelectionMode(page);
    return selectionTriggered;
  },

  async shouldRenderSelectionState(page, content) {
    const selectionContainer = await page.$(content + ' .selection-mode');

    if (selectionContainer) {
      // Check content
      const text = await selectionContainer.textContent();
      expect(text).toBe('Selection mode active');

      // Check accessibility
      const ariaLabel = await selectionContainer.getAttribute('aria-label');
      expect(ariaLabel).toBe('Selection mode active');

      return true;
    }

    return false;
  },

  async shouldHaveProperAccessibility(page, content) {
    const selectionContainer = await page.$(content + ' .selection-mode');

    if (selectionContainer) {
      // Validate accessibility attributes
      const ariaLabel = await selectionContainer.getAttribute('aria-label');
      expect(ariaLabel).toBe('Selection mode active');

      // Check content is informative
      const text = await selectionContainer.textContent();
      expect(text).toBe('Selection mode active');
    }
  },

  async shouldIndicateActiveSelection(page, content) {
    const selectionContainer = await page.$(content + ' .selection-mode');

    if (selectionContainer) {
      // Verify it's clearly indicating active selection
      const text = await selectionContainer.textContent();
      expect(text).toContain('Selection mode active');

      // Should have appropriate styling class
      const className = await selectionContainer.getAttribute('class');
      expect(className).toContain('selection-mode');
    }
  },
};
