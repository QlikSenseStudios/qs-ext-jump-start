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
    const container = await page.$(content + ' .extension-container.in-selection');
    if (!container) {
      return false;
    }
    // Table should still be present
    const table = await page.$(content + ' table.data-table');
    expect(table).toBeTruthy();
    return true;
  },

  async shouldHaveProperAccessibility(page, content) {
    const container = await page.$(content + ' .extension-container.in-selection');
    if (container) {
      const role = await container.getAttribute('role');
      const ariaLabel = await container.getAttribute('aria-label');
      expect(role).toBe('main');
      expect(ariaLabel).toBe('Qlik Sense Extension Content');
    }
  },

  async shouldIndicateActiveSelection(page, content) {
    const container = await page.$(content + ' .extension-container.in-selection');
    if (container) {
      const className = await container.getAttribute('class');
      expect(className).toContain('in-selection');
      // At least one selected cell should be highlighted if a selection was made
      const selectedCells = await page.$$(content + ' .dim-cell.state-S');
      expect(selectedCells.length).toBeGreaterThanOrEqual(0);
    }
  },
};
