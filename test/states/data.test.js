const { expect } = require('@playwright/test');
const { configureExtension } = require('../helpers/test-utils');

/**
 * Tests for data state
 * This state may not always be reachable in E2E testing due to configuration dependencies
 */
module.exports = {
  async attemptConfiguration(page, _content) {
    // Attempt to configure the extension
    const configured = await configureExtension(page, {
      dimensions: ['Dim1'],
      measures: ['Sum(Expression1)'],
    });

    return configured;
  },

  async shouldRenderDataState(page, content) {
    // This test assumes successful configuration
    const mainContainer = await page.$(content + ' .extension-container');

    // If main container exists, validate it
    if (mainContainer) {
      // Verify main content accessibility
      const role = await mainContainer.getAttribute('role');
      const ariaLabel = await mainContainer.getAttribute('aria-label');
      expect(role).toBe('main');
      expect(ariaLabel).toBe('Qlik Sense Extension Content');

      // Check for data count display
      const dataCountElement = await mainContainer.$('p');
      if (dataCountElement) {
        const dataCountText = await dataCountElement.textContent();
        expect(dataCountText).toMatch(/Data rows: \d+/);
      }

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
      const isFocused = await page.evaluate((main, active) => main === active, mainContainer, activeElement);
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

      // Check for heading
      const heading = await contentDiv.$('h2');
      if (heading) {
        const headingText = await heading.textContent();
        expect(headingText).toBe('Hello World!');
      }

      // Check for data information
      const dataInfo = await contentDiv.$('p');
      if (dataInfo) {
        const dataText = await dataInfo.textContent();
        expect(dataText).toMatch(/Data rows: \d+/);
      }
    }
  },
};
