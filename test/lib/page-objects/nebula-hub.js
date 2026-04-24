/**
 * @fileoverview Page Object Model for Nebula Hub Environment.
 *
 * This page object encapsulates all interactions with the Qlik Sense Nebula Hub
 * development environment. It provides a clean, maintainable interface for
 * common testing operations like validation, configuration, and cleanup.
 *
 * @class NebulaHubPage
 * @since 1.0.0
 */

import { IDENTIFIERS } from '../core/identifiers.js';
import { clickWithBackdropHandling, clickFirstVisible } from '../utilities/dom.js';
import { setJsonEditorContent } from '../utilities/json-editor.js';
import { WAIT_TIMES } from '../core/constants.js';

// Per-page state cache — WeakMap ensures automatic cleanup when pages are disposed
const _validationCache = new WeakMap();

/**
 * Clears the per-page state cache between tests to prevent state bleeding across runs.
 *
 * @param {import('@playwright/test').Page} page
 */
function clearValidationCache(page) {
  _validationCache.delete(page);
}

/**
 * Page Object Model for Qlik Sense Nebula Hub interactions.
 *
 * This class provides a high-level interface for interacting with the Nebula Hub
 * development environment. It encapsulates common patterns and provides methods
 * for validation, configuration, and cleanup operations.
 *
 * @example
 * ```javascript
 * const hub = new NebulaHubPage(page);
 * await hub.waitForReady();
 *
 * const configured = await hub.configureExtension({
 *   dimensions: ['Dim1'],
 *   measures: [{ field: 'Expression1', aggregation: 'Sum' }]
 * });
 * ```
 */
class NebulaHubPage {
  /**
   * Creates a new Nebula Hub page object.
   *
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Opens the extension properties dialog for configuration.
   *
   * @returns {Promise<boolean>} True if dialog opened successfully
   */
  async openPropertiesDialog() {
    try {
      const propertiesButton = this.page.locator(IDENTIFIERS.MODIFY_PROPERTIES_BUTTON);
      const success = await clickWithBackdropHandling(this.page, propertiesButton);

      if (success) {
        // MuiDialog-root has role="presentation"; the actual dialog is the MuiDialog-paper child
        const dialog = this.page.locator('div[role="dialog"].MuiDialog-paper');
        await dialog.waitFor({ state: 'visible', timeout: 5000 });
        await this.page.waitForTimeout(WAIT_TIMES.MEDIUM);
      }

      return success;
    } catch (error) {
      console.warn('Failed to open properties dialog:', error.message);
      return false;
    }
  }

  /**
   * Sets JSON configuration in the properties dialog.
   *
   * @param {Object} config - Configuration object to set
   * @returns {Promise<boolean>} True if configuration was set successfully
   */
  async setConfiguration(config) {
    try {
      // Use compact JSON formatting to avoid editor auto-close issues
      const jsonString = JSON.stringify(config, null, 0);
      const result = await setJsonEditorContent(this.page, jsonString);

      if (result.success) {
        // Wait for Monaco to reflect the pasted content before clicking Confirm.
        // In headless mode the paste lands asynchronously — polling until the view-lines
        // match the expected content ensures Confirm applies the intended JSON, not the
        // prior state. Fall back to a fixed wait if the poll times out.
        await this.page.waitForFunction(
          (expected) => {
            const lines = [...document.querySelectorAll('.monaco-editor .view-line')];
            if (lines.length === 0) {return false;}
            const actual = lines
              .map((l) => l.textContent)
              .join('\n')
              .replace(/[^\x20-\x7E\n]/g, ' ')
              .trim();
            return actual === expected;
          },
          jsonString,
          { timeout: 3000 }
        ).catch(() => this.page.waitForTimeout(WAIT_TIMES.EXTRA_LONG));

        // Apply the configuration
        const confirmButtons = [
          this.page.locator('button:has-text("Confirm")'),
          this.page.locator('button:has-text("Apply")'),
          this.page.locator('button:has-text("OK")'),
        ];

        const applied = await clickFirstVisible(this.page, confirmButtons);

        if (applied) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn('Failed to set configuration:', error.message);
      return false;
    }
  }

  /**
   * Configures the extension with dimensions and measures.
   *
   * @param {Object} options - Configuration options
   * @param {string[]} [options.dimensions] - Array of dimension names
   * @param {Object[]} [options.measures] - Array of measure configurations
   * @returns {Promise<boolean>} True if configuration successful
   */
  async configureExtension(options = {}) {
    const config = {};

    if (options.dimensions && options.dimensions.length > 0) {
      config.dimensions = options.dimensions.map((dim) => ({ field: dim }));
    }

    if (options.measures && options.measures.length > 0) {
      config.measures = options.measures;
    }

    const dialogOpened = await this.openPropertiesDialog();
    if (!dialogOpened) {
      return false;
    }

    return await this.setConfiguration(config);
  }

  /**
   * Resets the extension configuration to an empty state.
   *
   * Confirming {} in Nebula Hub empties <div id="app"> entirely — this is the
   * expected reset behavior. We verify the app div is empty after Confirm to
   * catch cases where the paste did not land and the prior JSON was confirmed instead.
   *
   * @returns {Promise<boolean>} True if reset successful and app div is empty
   */
  async resetConfiguration() {
    const dialogOpened = await this.openPropertiesDialog();
    if (!dialogOpened) {
      return false;
    }

    const confirmed = await this.setConfiguration({});
    if (!confirmed) {
      return false;
    }

    // Verify the app div emptied — if it still has children, {} was not applied
    try {
      await this.page.waitForFunction(
        () => {
          const app = document.querySelector('div#app');
          return app && app.children.length === 0;
        },
        { timeout: 3000 }
      );
      console.log('   • Configuration reset: div#app confirmed empty');
      await this.page.waitForTimeout(WAIT_TIMES.EXTRA_LONG);
      console.log('   • Configuration reset: engine settle wait complete');
    } catch {
      console.warn('   • Configuration reset: ⚠️ app div not emptied after confirm — paste may not have landed');
      return false;
    }

    return true;
  }

  /**
   * Clears all current selections in the extension.
   *
   * @returns {Promise<boolean>} True if selections were cleared
   */
  async clearSelections() {
    try {
      console.log('🔄 Clearing all selections...');

      const clearButtons = [
        this.page.locator('[title="Clear all selections"]'),
        this.page.locator('button:has-text("Clear all")'),
        this.page.locator('[aria-label="Clear all selections"]'),
      ];

      const success = await clickFirstVisible(this.page, clearButtons);

      if (success) {
        console.log('   • Selection clearing: ✅ Success');
        await this.page.waitForTimeout(WAIT_TIMES.SHORT);
        return true;
      } else {
        console.log('   • Selection clearing: ❌ No clear button found');
        return false;
      }
    } catch (error) {
      console.log(`   • Selection clearing: ❌ (${error.message})`);
      return false;
    }
  }

  /**
   * Gets the current state of the extension.
   *
   * @returns {Promise<string>} Current state identifier
   */
  async getExtensionState() {
    try {
      // Check for incomplete visualization (needs configuration)
      const incompleteError = await this.page.$(IDENTIFIERS.INCOMPLETE_VISUALIZATION);
      if (incompleteError) {
        return 'incomplete';
      }

      // Check for complete visualization (configured and rendering)
      const completeViz = await this.page.$(IDENTIFIERS.COMPLETE_VISUALIZATION);
      if (completeViz && (await completeViz.isVisible())) {
        return 'complete';
      }

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Performs comprehensive cleanup operations.
   *
   * @returns {Promise<boolean>} True if all cleanup operations succeeded
   */
  async cleanup() {
    console.log('🧹 Starting Nebula Hub cleanup...');

    const results = {
      selections: false,
      configuration: false,
      cache: false,
    };

    // Clear selections
    results.selections = await this.clearSelections();

    // Reset configuration
    try {
      results.configuration = await this.resetConfiguration();
      console.log(`   • Configuration reset: ${results.configuration ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`   • Configuration reset: ❌ (${error.message})`);
    }

    // Clear validation cache
    try {
      clearValidationCache(this.page);
      results.cache = true;
      console.log('   • Validation cache: ✅ cleared');
    } catch (error) {
      console.log(`   • Validation cache: ❌ (${error.message})`);
    }

    const overallSuccess = results.selections && results.configuration && results.cache;
    console.log(`🏁 Nebula Hub cleanup complete: ${overallSuccess ? '✅' : '❌'}`);

    return overallSuccess;
  }
}

export { NebulaHubPage, clearValidationCache };
