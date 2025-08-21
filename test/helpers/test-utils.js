/**
 * Test utilities for Qlik Sense extension E2E testing
 * Provides helper functions for interacting with Nebula.js test environment
 */

/* eslint-disable no-console */

/**
 * Attempts to configure the extension with dimensions and measures
 * @param {Page} page - Playwright page object
 * @param {object} config - Configuration object
 * @param {string[]} config.dimensions - Array of dimension field names
 * @param {string[]} config.measures - Array of measure expressions
 * @returns {Promise<boolean>} Success status
 */
async function configureExtension(page, config = {}) {
  const { dimensions = [], measures = [] } = config;

  try {
    // Wait for the extension to be rendered
    const content = '.njs-viz[data-render-count]';
    await page.waitForSelector(content, { visible: true });

    // Look for property panel or configuration UI
    const configPanel = await page
      .$('[data-testid="property-panel"], .nebula-property-panel, .qv-property-panel, .lui-property-panel')
      .catch(() => null);

    if (!configPanel) {
      // Try to open configuration panel
      const configButton = await page
        .$('[data-testid="configure"], [aria-label="Configure"], [title="Configure"], .configure-btn, .settings-btn')
        .catch(() => null);
      if (configButton) {
        await configButton.click();
        await page.waitForTimeout(1000);
      } else {
        // Try right-click context menu
        await page.click(content, { button: 'right' });
        await page.waitForTimeout(500);

        const configMenuItem = await page.$('text="Configure"').catch(() => null);
        if (configMenuItem) {
          await configMenuItem.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // Add dimensions
    for (const dimension of dimensions) {
      const dimensionButton = await page
        .$('[data-testid="add-dimension"], .add-dimension, [aria-label*="dimension" i]')
        .catch(() => null);
      if (dimensionButton) {
        await dimensionButton.click();
        await page.waitForTimeout(500);

        // Try to select the field
        const fieldInput = await page
          .$('.field-selector, [data-testid="field-dropdown"], select, input')
          .catch(() => null);
        if (fieldInput) {
          await fieldInput.click();
          await page.waitForTimeout(500);

          // Type or select the dimension
          await fieldInput.fill(dimension);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
        }
      }
    }

    // Add measures
    for (const measure of measures) {
      const measureButton = await page
        .$('[data-testid="add-measure"], .add-measure, [aria-label*="measure" i]')
        .catch(() => null);
      if (measureButton) {
        await measureButton.click();
        await page.waitForTimeout(500);

        // Try to set the expression
        const expressionInput = await page
          .$('.expression-input, [data-testid="expression"], textarea, input[type="text"]')
          .catch(() => null);
        if (expressionInput) {
          await expressionInput.fill(measure);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
        }
      }
    }

    // Wait for re-rendering
    await page.waitForTimeout(2000);

    return true;
  } catch (error) {
    console.warn('Configuration attempt failed:', error.message);
    return false;
  }
}

/**
 * Triggers selection mode in the extension
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>} Success status
 */
async function triggerSelectionMode(page) {
  try {
    const content = '.njs-viz[data-render-count]';

    // Look for selectable elements
    const selectableElements = await page.$$(
      '.extension-container .content, .data-point, .selectable-item, .chart-element'
    );

    if (selectableElements.length > 0) {
      // Try Ctrl+click to enter selection mode
      await page.keyboard.down('Control');
      await selectableElements[0].click();
      await page.keyboard.up('Control');

      await page.waitForTimeout(1000);

      // Check if selection mode was triggered
      const selectionModeElement = await page.$(content + ' .selection-mode');
      return !!selectionModeElement;
    }

    return false;
  } catch (error) {
    console.warn('Selection mode trigger failed:', error.message);
    return false;
  }
}

/**
 * Validates accessibility attributes for a container
 * @param {ElementHandle} container - Container element
 * @param {string} expectedType - Expected container type (extension-container, no-data, etc.)
 * @returns {Promise<object>} Validation results
 */
async function validateAccessibility(container, expectedType) {
  const results = {
    valid: false,
    errors: [],
    attributes: {},
  };

  try {
    const className = await container.getAttribute('class');
    results.attributes.className = className;

    if (expectedType === 'extension-container') {
      const role = await container.getAttribute('role');
      const ariaLabel = await container.getAttribute('aria-label');
      const tabindex = await container.getAttribute('tabindex');

      results.attributes = { role, ariaLabel, tabindex };

      if (role !== 'main') {
        results.errors.push(`Expected role="main", got "${role}"`);
      }
      if (ariaLabel !== 'Qlik Sense Extension Content') {
        results.errors.push(`Expected aria-label="Qlik Sense Extension Content", got "${ariaLabel}"`);
      }
      if (tabindex !== '0') {
        results.errors.push(`Expected tabindex="0", got "${tabindex}"`);
      }
    }

    if (expectedType === 'no-data') {
      const ariaLabel = await container.getAttribute('aria-label');
      results.attributes.ariaLabel = ariaLabel;

      if (ariaLabel !== 'No data available') {
        results.errors.push(`Expected aria-label="No data available", got "${ariaLabel}"`);
      }
    }

    if (expectedType === 'selection-mode') {
      const ariaLabel = await container.getAttribute('aria-label');
      results.attributes.ariaLabel = ariaLabel;

      if (ariaLabel !== 'Selection mode active') {
        results.errors.push(`Expected aria-label="Selection mode active", got "${ariaLabel}"`);
      }
    }

    if (expectedType === 'error-message') {
      const role = await container.getAttribute('role');
      const ariaLive = await container.getAttribute('aria-live');

      results.attributes = { role, ariaLive };

      if (role !== 'alert') {
        results.errors.push(`Expected role="alert", got "${role}"`);
      }
      if (ariaLive !== 'polite') {
        results.errors.push(`Expected aria-live="polite", got "${ariaLive}"`);
      }
    }

    results.valid = results.errors.length === 0;
    return results;
  } catch (error) {
    results.errors.push(`Validation error: ${error.message}`);
    return results;
  }
}

/**
 * Gets the current state of the extension
 * @param {Page} page - Playwright page object
 * @returns {Promise<string>} Current state ('extension-container', 'no-data', 'selection-mode', 'error-message', 'unknown')
 */
async function getExtensionState(page) {
  try {
    const content = '.njs-viz[data-render-count]';
    await page.waitForSelector(content, { visible: true });

    const states = ['extension-container', 'no-data', 'selection-mode', 'error-message'];

    for (const state of states) {
      const element = await page.$(content + ` .${state}`);
      if (element) {
        return state;
      }
    }

    return 'unknown';
  } catch (error) {
    console.warn('State detection failed:', error.message);
    return 'unknown';
  }
}

module.exports = {
  configureExtension,
  triggerSelectionMode,
  validateAccessibility,
  getExtensionState,
};
