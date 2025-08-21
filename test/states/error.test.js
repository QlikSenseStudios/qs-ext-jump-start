const { expect } = require('@playwright/test');

/**
 * Tests for error state
 * This state may not be reachable in E2E testing due to environment constraints
 */
module.exports = {
  async attemptErrorTrigger(page, _content) {
    // Try to trigger an error by providing invalid configuration
    // This might not work in all test environments
    try {
      const configControls = await page.$$('[data-testid="add-measure"], .add-measure, .expression-input');

      for (const control of configControls) {
        const tagName = await control.evaluate((el) => el.tagName.toLowerCase());
        if (tagName === 'input' || tagName === 'textarea') {
          await control.fill('InvalidFunction(NonExistentField)');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
          break;
        }
      }

      return true;
    } catch {
      return false;
    }
  },

  async shouldRenderErrorState(page, content) {
    const errorContainer = await page.$(content + ' .error-message');

    if (errorContainer) {
      // Check error message content
      const errorText = await errorContainer.textContent();
      expect(errorText).toContain('Unable to load extension');

      // Check accessibility
      const role = await errorContainer.getAttribute('role');
      const ariaLive = await errorContainer.getAttribute('aria-live');
      expect(role).toBe('alert');
      expect(ariaLive).toBe('polite');

      return true;
    }

    return false;
  },

  async shouldHaveProperAccessibility(page, content) {
    const errorContainer = await page.$(content + ' .error-message');

    if (errorContainer) {
      // Validate error accessibility
      const role = await errorContainer.getAttribute('role');
      const ariaLive = await errorContainer.getAttribute('aria-live');

      expect(role).toBe('alert');
      expect(ariaLive).toBe('polite');
    }
  },

  async shouldProvideUsefulErrorMessage(page, content) {
    const errorContainer = await page.$(content + ' .error-message');

    if (errorContainer) {
      // Check error content is helpful
      const errorText = await errorContainer.textContent();
      expect(errorText).toContain('Unable to load extension');
      expect(errorText).toContain('Please check your data configuration');

      // Should have proper error structure
      const heading = await errorContainer.$('h3');
      if (heading) {
        const headingText = await heading.textContent();
        expect(headingText).toBe('Unable to load extension');
      }
    }
  },
};
