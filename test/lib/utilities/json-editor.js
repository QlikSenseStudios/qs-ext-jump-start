/**
 * @fileoverview JSON editor utilities for extension configuration.
 *
 * This module handles interaction with JSON editors in the Qlik Sense environment.
 * It provides robust methods for setting JSON configuration that work across
 * different editor implementations (CodeMirror, Monaco, etc.).
 *
 * @module JsonEditorUtilities
 * @since 1.0.0
 */

/**
 * @typedef {Object} JsonEditorResult
 * @property {boolean} success - Whether the operation succeeded
 * @property {string} [error] - Error message if operation failed
 * @property {string} [method] - The method that succeeded (for debugging)
 */

/**
 * Sets JSON content in various types of JSON editors found in Qlik Sense.
 *
 * This function tries multiple strategies to set JSON content, as different
 * versions of Qlik Sense may use different editor implementations:
 * 1. CodeMirror editor (older versions)
 * 2. Monaco editor (newer versions)
 * 3. Standard textarea (fallback)
 * 4. Direct input field
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} jsonContent - JSON content to set (should be valid JSON string)
 * @returns {Promise<JsonEditorResult>} Result indicating success/failure and method used
 *
 * @example
 * ```javascript
 * const config = { dimensions: ['Dim1'], measures: ['Expression1'] };
 * const result = await setJsonEditorContent(page, JSON.stringify(config, null, 0));
 * if (result.success) {
 *   console.log(`JSON set using ${result.method}`);
 * }
 * ```
 */
async function setJsonEditorContent(page, jsonContent) {
  const strategies = [
    {
      name: 'CodeMirror Editor',
      selector: '.CodeMirror textarea',
      method: async (element) => {
        // CodeMirror requires special handling
        await element.evaluate((el, content) => {
          if (el.CodeMirror) {
            el.CodeMirror.setValue(content);
            el.CodeMirror.refresh();
          }
        }, jsonContent);
      },
    },
    {
      name: 'Monaco Editor',
      selector: '.monaco-editor textarea',
      method: async (element) => {
        // Monaco editor handling
        await element.fill(jsonContent);
        await page.keyboard.press('Control+A');
        await page.keyboard.type(jsonContent);
      },
    },
    {
      name: 'Standard Textarea',
      selector: 'textarea[data-testid*="json"], textarea.json-editor, .json-input textarea',
      method: async (element) => {
        await element.fill('');
        await element.fill(jsonContent);
      },
    },
    {
      name: 'Generic Textarea',
      selector: 'textarea',
      method: async (element) => {
        await element.fill('');
        await element.fill(jsonContent);
      },
    },
    {
      name: 'Input Field',
      selector: 'input[type="text"]',
      method: async (element) => {
        await element.fill('');
        await element.fill(jsonContent);
      },
    },
  ];

  for (const strategy of strategies) {
    try {
      const elements = await page.$$(strategy.selector);

      for (const element of elements) {
        if (await element.isVisible()) {
          await strategy.method(element);

          // Verify the content was set correctly
          const currentValue = await element.inputValue().catch(() => element.textContent().catch(() => ''));

          if (currentValue.trim() === jsonContent.trim()) {
            return {
              success: true,
              method: strategy.name,
            };
          }
        }
      }
    } catch (error) {
      console.debug(`Strategy ${strategy.name} failed:`, error.message);
      continue;
    }
  }

  return {
    success: false,
    error: 'No suitable JSON editor found or all strategies failed',
  };
}

module.exports = {
  setJsonEditorContent,
};
