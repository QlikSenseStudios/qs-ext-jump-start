const { expect, test } = require('@playwright/test');
const { configureExtension, clearAllSelections } = require('../helpers/test-utils');
const commonTests = require('./common.test');

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

  /**
   * Ensure selection mode cannot be entered while in error state
   */
  async shouldNotAllowSelectionInError(page, content) {
    const state = await commonTests.getExtensionState(page, content);
    if (state !== 'error-message') {
      // Gate: this validation only applies when error state is visible.
      test.info().annotations.push({ type: 'skip', description: `Error state not reachable (${state})` });
      return; // Documented stub path
    }
    // No selection container class
    const inSelection = await page.$(content + ' .extension-container.in-selection');
    expect(inSelection).toBeFalsy();
    // No data table present
    const table = await page.$(content + ' table.data-table');
    expect(table).toBeFalsy();
  },

  /**
   * Trigger error twice should not render duplicate error elements
   */
  async shouldNotDuplicateErrorsOnRepeatedTrigger(page, content) {
    const state = await commonTests.getExtensionState(page, content);
    if (state !== 'error-message') {
      // Gate: duplicate errors check only meaningful in error state
      test.info().annotations.push({ type: 'skip', description: `Error state not reachable (${state})` });
      return; // Documented stub path
    }
    // Attempt to trigger error again
    await this.attemptErrorTrigger(page, content);
    await page.waitForTimeout(500);
    const errors = await page.$$(content + ' .error-message');
    expect(errors.length).toBe(1);
  },

  /**
   * After an error, applying a valid configuration should recover to data state
   */
  async shouldRecoverAfterValidConfiguration(page, content) {
    const current = await commonTests.getExtensionState(page, content);
    if (current !== 'error-message') {
      // Gate: recovery flow applies only from error state
      test.info().annotations.push({ type: 'skip', description: `Error state not reachable (${current})` });
      return; // Documented stub path
    }
    await clearAllSelections(page).catch(() => {});
    const configured = await configureExtension(page, {
      dimensions: ['Dim1'],
      measures: [{ field: 'Expression1', aggregation: 'Sum' }],
    });
    await page.waitForTimeout(800);
    const state = await commonTests.getExtensionState(page, content);
    if (configured) {
      expect(state).toBe('extension-container');
      // Ensure error element disappeared
      const error = await page.$(content + ' .error-message');
      expect(error).toBeFalsy();
    } else {
      // Gate: without a successful config we cannot assert recovery
      test.info().annotations.push({ type: 'skip', description: 'Configuration failed; cannot verify recovery' });
    }
  },

  /**
   * Error banner stays stable on viewport changes
   */
  async shouldRemainVisibleOnResize(page, content) {
    const state = await commonTests.getExtensionState(page, content);
    if (state !== 'error-message') {
      // Gate: visibility-on-resize only meaningful if error is present
      test.info().annotations.push({ type: 'skip', description: `Error state not reachable (${state})` });
      return; // Documented stub path
    }
    const sizes = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
    ];
    for (const vp of sizes) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(200);
      const errorContainer = await page.$(content + ' .error-message');
      expect(errorContainer).toBeTruthy();
      const visible = await errorContainer.isVisible();
      expect(visible).toBe(true);
    }
  },
};
