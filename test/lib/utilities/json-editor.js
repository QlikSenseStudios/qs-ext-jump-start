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

import { safeGet } from '../../../src/utils.js';

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
      name: 'Monaco Editor',
      selector: '.monaco-editor .view-lines',
      // Nebula Hub does not expose window.monaco — read by collecting all rendered .view-line
      // elements. Call expandMonacoEditorContent() first so Monaco renders the full document.
      method: async (element) => {
        return await element.evaluate((container) => {
          const lines = [...container.querySelectorAll('.view-line')];
          return lines.map((l) => l.textContent).join('\n');
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
            // Monaco uses non-breaking spaces (U+00A0) for indentation — strip all
            // non-printable/non-ASCII-printable chars so JSON.parse works correctly
            const sanitized = content.replace(/[^\x20-\x7E\n]/g, ' ').trim();
            return {
              success: true,
              method: strategy.name,
              content: sanitized,
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
      // CodeMirror sets value via its own API; verify via inputValue after
      verifyViaInputValue: true,
      method: async (element) => {
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
      selector: '.monaco-editor .view-lines',
      // Monaco does not expose window.monaco in Nebula Hub — write via clipboard paste.
      // page.keyboard.type() triggers Monaco's bracket-matching autocomplete (e.g. typing '{'
      // inserts '{}'  making '{}' become '{}}'), so we write to the clipboard and paste instead,
      // which bypasses Monaco's key handlers entirely.
      // After paste, wait until at least one .view-line reflects the new content before
      // returning — without this, the caller (setConfiguration) clicks Confirm before Monaco
      // has processed the clipboard, causing the prior content to be confirmed instead.
      verifyViaInputValue: false,
      method: async (element) => {
        await element.click();
        await page.keyboard.press('Control+a');
        await page.evaluate((content) => navigator.clipboard.writeText(content), jsonContent);
        await page.keyboard.press('Control+v');
      },
    },
    {
      name: 'Standard Textarea',
      selector: 'textarea[data-testid*="json"], textarea.json-editor, .json-input textarea',
      verifyViaInputValue: true,
      method: async (element) => {
        await element.fill('');
        await element.fill(jsonContent);
      },
    },
    {
      name: 'Generic Textarea',
      selector: 'textarea',
      verifyViaInputValue: true,
      method: async (element) => {
        await element.fill('');
        await element.fill(jsonContent);
      },
    },
    {
      name: 'Input Field',
      selector: 'input[type="text"]',
      verifyViaInputValue: true,
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

          if (!strategy.verifyViaInputValue) {
            // method() throws on failure, so reaching here means success
            return { success: true, method: strategy.name };
          }

          const currentValue = await element.inputValue().catch(() => element.textContent().catch(() => ''));
          if (currentValue.trim() === jsonContent.trim()) {
            return { success: true, method: strategy.name };
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
      // Expand the dialog content and editor height so Monaco renders all lines at once.
      // Monaco virtualizes rows — only visible lines are in the DOM — so we must make the
      // viewport tall enough to hold the full document before reading via .view-line elements.
      await page.evaluate(() => {
        const content = document.querySelector('.MuiDialogContent-root');
        if (content) {
          content.style.maxHeight = 'none';
          content.style.height = '8000px';
          content.style.overflow = 'visible';
        }
        const editor = document.querySelector('.monaco-editor');
        if (editor) { editor.style.height = '8000px'; }
      });
      await page.waitForTimeout(400);
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

export {
  setJsonEditorContent,
  getJsonEditorContent,
  validateJsonStructure,
  expandMonacoEditorContent,
  clearJsonEditorContent,
};
