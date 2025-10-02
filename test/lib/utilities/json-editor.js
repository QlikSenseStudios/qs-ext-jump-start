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

// Import safeGet utility for safe property access from existing project utils
const { safeGet } = require('../../../src/utils');

/**
 * @typedef {Object} JsonEditorResult
 * @property {boolean} success - Whether the operation succeeded
 * @property {string} [error] - Error message if operation failed
 * @property {string} [method] - The method that succeeded (for debugging)
 */

/**
 * Gets JSON content from various types of JSON editors found in Qlik Sense.
 *
 * This function tries multiple strategies to retrieve JSON content, as different
 * versions of Qlik Sense may use different editor implementations:
 * 1. CodeMirror editor (older versions)
 * 2. Monaco editor (newer versions)
 * 3. Standard textarea (fallback)
 * 4. Direct input field
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<JsonEditorResult & {content?: string}>} Result with JSON content if successful
 *
 * @example
 * ```javascript
 * const result = await getJsonEditorContent(page);
 * if (result.success) {
 *   const config = JSON.parse(result.content);
 *   console.log('Current config:', config);
 * }
 * ```
 */
async function getJsonEditorContent(page) {
  const strategies = [
    {
      name: 'CodeMirror Editor',
      selector: '.CodeMirror textarea',
      method: async (element) => {
        return await element.evaluate((el) => {
          if (el.CodeMirror) {
            return el.CodeMirror.getValue();
          }
          return el.value || el.textContent || '';
        });
      },
    },
    {
      name: 'Monaco Editor - Direct',
      selector: '.monaco-editor',
      method: async (element) => {
        // Try to get Monaco editor content using global monaco reference
        return await element.evaluate((_editorElement) => {
          // Try accessing Monaco through global objects
          if (typeof window.monaco !== 'undefined' && window.monaco.editor) {
            const editors = window.monaco.editor.getEditors();
            if (editors && editors.length > 0) {
              return editors[0].getValue();
            }
          }

          return null;
        });
      },
    },
    {
      name: 'Monaco Editor - Textarea',
      selector: '.monaco-editor textarea',
      method: async (element) => {
        // For Monaco editor, we need to get the full content, not just the input value
        return await element.evaluate((el) => {
          // Try to get the Monaco editor instance
          const monacoEditor = el.closest('.monaco-editor');
          if (monacoEditor && monacoEditor.monacoEditor) {
            return monacoEditor.monacoEditor.getValue();
          }

          // Fallback to textarea value
          return el.value || el.textContent || '';
        });
      },
    },
    {
      name: 'Monaco Editor - All Text',
      selector: '.monaco-editor .view-lines',
      method: async (element) => {
        // Get all text from Monaco editor lines
        return await element.evaluate((linesElement) => {
          return linesElement.textContent || linesElement.innerText || '';
        });
      },
    },
    {
      name: 'Standard Textarea',
      selector: 'textarea[data-testid*="json"], textarea.json-editor, .json-input textarea',
      method: async (element) => {
        return await element.inputValue();
      },
    },
    {
      name: 'Generic Textarea',
      selector: 'textarea',
      method: async (element) => {
        return await element.inputValue();
      },
    },
    {
      name: 'Input Field',
      selector: 'input[type="text"]',
      method: async (element) => {
        return await element.inputValue();
      },
    },
  ];

  for (const strategy of strategies) {
    try {
      const elements = await page.$$(strategy.selector);

      for (const element of elements) {
        if (await element.isVisible()) {
          const content = await strategy.method(element);

          if (content && content.trim().length > 0) {
            return {
              success: true,
              method: strategy.name,
              content: content.trim(),
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
    error: 'No suitable JSON editor found or all strategies failed to retrieve content',
  };
}

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

/**
 * Validates JSON structure based on provided sections and options.
 * This function provides reusable validation logic for JSON configuration dialogs.
 *
 * @param {string} jsonContent - The JSON content to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.allowPartialJson - Allow validation of partial/collapsed JSON content
 * @param {Array<string>} options.requiredSections - Array of required JSON property names
 * @param {Object} [options.propertyPaths] - Mapping of section names to their JSON paths (e.g., {'qType': 'qInfo.qType'})
 * @param {Object} [options.expectedValues] - Expected values for specific properties (e.g., {'qType': 'my-extension'})
 * @returns {Object} Validation result with success status and details
 */
function validateJsonStructure(jsonContent, options = {}) {
  const { allowPartialJson = true, requiredSections = [], propertyPaths = {}, expectedValues = {} } = options;

  const result = {
    success: false,
    isPartialJson: false,
    foundSections: [],
    missingSections: [],
    validationDetails: [],
    jsonObject: null,
  };

  // Check if this is collapsed/partial JSON (Monaco Editor display)
  const isCollapsed = jsonContent.includes('…') || jsonContent.includes('{…');

  if (isCollapsed && allowPartialJson) {
    result.isPartialJson = true;
    result.validationDetails.push('Detected collapsed JSON content from Monaco Editor');

    // Validate visible structure in collapsed content
    for (const section of requiredSections) {
      if (jsonContent.includes(`"${section}"`)) {
        result.foundSections.push(section);
        result.validationDetails.push(`✓ Found section: ${section}`);

        // Check expected values for this section in partial JSON
        if (expectedValues[section]) {
          const expectedValue = expectedValues[section];
          if (jsonContent.includes(`"${section}": "${expectedValue}"`)) {
            result.validationDetails.push(`✓ Found correct ${section}: ${expectedValue}`);
          } else {
            result.validationDetails.push(`⚠ Section ${section} found but value validation limited in partial JSON`);
          }
        }
      } else {
        result.missingSections.push(section);
        result.validationDetails.push(`✗ Missing section: ${section}`);
      }
    }

    result.success = result.missingSections.length === 0;
    return result;
  }

  // Try to parse as complete JSON
  try {
    result.jsonObject = JSON.parse(jsonContent);
    result.validationDetails.push('✓ JSON parsed successfully');

    // Validate required sections in parsed JSON using flexible property path system
    for (const section of requiredSections) {
      let found = false;
      let actualValue = null;

      // Use property path mapping if provided, otherwise check direct property
      const propertyPath = propertyPaths[section] || section;

      if (propertyPath.includes('.')) {
        // Deep property access using safeGet
        actualValue = safeGet(result.jsonObject, propertyPath);
        found = actualValue !== null && actualValue !== undefined;
      } else {
        // Direct property access
        found = Object.prototype.hasOwnProperty.call(result.jsonObject, section);
        if (found) {
          actualValue = result.jsonObject[section];
        }
      }

      if (found) {
        result.foundSections.push(section);
        result.validationDetails.push(`✓ Found ${section}: ${actualValue}`);

        // Validate expected value if provided
        if (expectedValues[section] && actualValue !== expectedValues[section]) {
          result.validationDetails.push(
            `⚠ ${section} value mismatch: expected '${expectedValues[section]}', got '${actualValue}'`
          );
        }
      } else {
        result.missingSections.push(section);
        const pathDisplay = propertyPath.includes('.') ? ` at path '${propertyPath}'` : '';
        result.validationDetails.push(`✗ Missing ${section}${pathDisplay}`);
      }
    }

    result.success = result.missingSections.length === 0;
    return result;
  } catch (parseError) {
    result.validationDetails.push(`✗ JSON parsing failed: ${parseError.message}`);
    result.success = false;
    return result;
  }
}

/**
 * Attempts to expand collapsed content in Monaco Editor before reading JSON.
 * This function tries various methods to expand collapsed sections.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>} True if expansion was attempted, false otherwise
 */
async function expandMonacoEditorContent(page) {
  try {
    const monacoEditor = page.locator('.monaco-editor');
    if (await monacoEditor.isVisible()) {
      // Click on Monaco editor to focus it
      await monacoEditor.click();
      await page.waitForTimeout(300);

      // Try Ctrl+A to select all content
      await page.keyboard.press('Control+a');
      await page.waitForTimeout(200);

      // Try keyboard shortcut to expand all (Ctrl+Shift+])
      await page.keyboard.press('Control+Shift+]');
      await page.waitForTimeout(300);

      // Try alternative expansion shortcut
      await page.keyboard.press('Control+Shift+ArrowRight');
      await page.waitForTimeout(200);

      return true;
    }
  } catch (error) {
    console.debug('Monaco Editor expansion failed:', error.message);
  }

  return false;
}

/**
 * Clears JSON editor content by setting it to empty object.
 * This function provides a clean way to reset JSON editors for testing.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<JsonEditorResult>} Result indicating success/failure
 */
async function clearJsonEditorContent(page) {
  const emptyConfig = '{}';
  return await setJsonEditorContent(page, emptyConfig);
}

module.exports = {
  setJsonEditorContent,
  getJsonEditorContent,
  validateJsonStructure,
  expandMonacoEditorContent,
  clearJsonEditorContent,
};
