/**
 * @fileoverview Core utility functions for test framework.
 *
 * This module provides essential DOM utilities needed for the
 * e2e environment validation tests.
 *
 * @module TestUtilities
 * @since 1.0.0
 */

/**
 * Safely checks if a Playwright locator element is visible without throwing exceptions.
 *
 * This utility function wraps the isVisible() check in a try-catch to prevent
 * test failures when elements don't exist. It's used internally by other utilities.
 *
 * @param {import('@playwright/test').Locator} locator - Playwright locator to check
 * @returns {Promise<boolean>} True if element is visible, false otherwise
 */
async function isVisible(locator) {
  try {
    return await locator.isVisible();
  } catch {
    return false;
  }
}

/**
 * Clicks an element while handling potential MUI backdrop interference.
 *
 * Material-UI backdrops can sometimes intercept click events. This utility
 * attempts to click the target element, and if that fails, it clicks any
 * backdrop first to clear it, then retries the original click.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {import('@playwright/test').Locator} element - Element to click
 * @returns {Promise<boolean>} True if click succeeded, false otherwise
 *
 * @example
 * ```javascript
 * const saveButton = page.locator('button.save');
 * const success = await clickWithBackdropHandling(page, saveButton);
 * ```
 */
async function clickWithBackdropHandling(page, element) {
  try {
    await element.click({ force: true });
    return true;
  } catch {
    try {
      // Try to clear any MUI backdrop that might be interfering
      await page
        .locator('.MuiBackdrop-root')
        .click({ force: true })
        .catch(() => {});
      await element.click({ force: true });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Attempts to click the first visible element from an array of locators.
 *
 * This utility is useful when there are multiple possible selectors for the same
 * logical action (e.g., different button texts or DOM structures across versions).
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {import('@playwright/test').Locator[]} locators - Array of locators to try
 * @returns {Promise<boolean>} True if any element was successfully clicked
 *
 * @example
 * ```javascript
 * const confirmButtons = [
 *   page.locator('button:has-text("Confirm")'),
 *   page.locator('button:has-text("OK")'),
 *   page.locator('button:has-text("Apply")')
 * ];
 * const clicked = await clickFirstVisible(page, confirmButtons);
 * ```
 */
async function clickFirstVisible(page, locators) {
  for (const locator of locators) {
    if (await isVisible(locator)) {
      return await clickWithBackdropHandling(page, locator);
    }
  }
  return false;
}

module.exports = {
  clickWithBackdropHandling,
  clickFirstVisible,
};
