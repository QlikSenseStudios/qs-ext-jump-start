/**
 * Test utilities for Qlik Sense extension E2E testing
 * Provides helper functions for interacting with Nebula.js test environment
 */

/* eslint-disable no-console */

/**
 * Configures the extension with dimensions and measures using Nebula hub interface
 * Implements two-step process: field selection → aggregation selection for measures
 * Tracks successfully added items for targeted cleanup
 * @param {Page} page - Playwright page object
 * @param {object} config - Configuration object
 * @param {string[]} config.dimensions - Array of dimension field names
 * @param {Array<string|object>} config.measures - Array of measures (strings or {field, aggregation} objects)
 * @returns {Promise<boolean>} True if configuration successful, false otherwise
 */
async function configureExtension(page, config = {}) {
  const { dimensions = [], measures = [] } = config;
  const addedItems = { dimensions: [], measures: [] };

  try {
    // Wait for extension to be fully rendered and interactive
    const content = '.njs-viz[data-render-count]';
    await page.waitForSelector(content, { visible: true });
    await page.waitForTimeout(1000);

    // Configure dimensions via Nebula hub dropdown interface
    await configureDimensions(page, dimensions, addedItems);
    
    // Configure measures via Nebula hub dropdown interface (two-step process)
    await configureMeasures(page, measures, addedItems);

    // Allow configuration to settle and re-render
    await page.waitForTimeout(2000);

    // Store tracked items for targeted cleanup
    page.addedExtensionItems = addedItems;
    console.log('Configuration completed. Added items:', addedItems);

    return true;
  } catch (error) {
    console.warn('Configuration attempt failed:', error.message);
    return false;
  }
}

/**
 * Configures dimensions using Nebula hub "Add dimension" dropdown
 * @param {Page} page - Playwright page object  
 * @param {string[]} dimensions - Array of dimension field names
 * @param {object} addedItems - Object to track successfully added items
 */
async function configureDimensions(page, dimensions, addedItems) {
  for (const dimension of dimensions) {
    console.log(`Configuring dimension: ${dimension}`);
    
    // Locate and click "Add dimension" button
    const addDimensionBtn = await page.locator('button:has-text("Add dimension"), button:has-text("Add dimensions")').first();
    
    if (!(await addDimensionBtn.isVisible().catch(() => false))) {
      console.warn('Add dimension button not found');
      continue;
    }

    await addDimensionBtn.click();
    await page.waitForTimeout(1000);

    // Wait for dimension selection dropdown to appear
    await page.waitForSelector('.MuiPopover-root, .MuiDialog-root, .fields-list', { timeout: 5000 }).catch(() => {});

    // Select the specific dimension from dropdown
    const dimensionOption = await page.locator(`text="${dimension}"`).first();
    
    if (await dimensionOption.isVisible().catch(() => false)) {
      // Handle potential MUI backdrop interference
      await clickWithBackdropHandling(page, dimensionOption);
      
      console.log(`Successfully configured dimension: ${dimension}`);
      addedItems.dimensions.push(dimension);
      
      // Close dropdown
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      console.warn(`Dimension option not found: ${dimension}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  }
}

/**
 * Configures measures using Nebula hub "Add measures" dropdown with two-step process
 * Step 1: Select field from dropdown, Step 2: Select aggregation type
 * @param {Page} page - Playwright page object
 * @param {Array<string|object>} measures - Array of measure configs
 * @param {object} addedItems - Object to track successfully added items
 */
async function configureMeasures(page, measures, addedItems) {
  for (const measure of measures) {
    const fieldName = measure.field || measure;
    const aggregation = measure.aggregation || 'Sum';
    console.log(`Configuring measure: ${fieldName} with ${aggregation} aggregation`);
    
    // Locate and click "Add measures" button
    const addMeasureBtn = await page.locator('button:has-text("Add measure"), button:has-text("Add measures")').first();
    
    if (!(await addMeasureBtn.isVisible().catch(() => false))) {
      console.warn('Add measure button not found');
      continue;
    }

    await addMeasureBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // Wait for field selection dropdown to appear
    await page.waitForSelector('.MuiPopover-root, .MuiDialog-root, .fields-list', { timeout: 5000 }).catch(() => {});

    // Step 1: Select field from dropdown
    const measureOption = await page.locator(`text="${fieldName}"`).first();
    
    if (await measureOption.isVisible().catch(() => false)) {
      await clickWithBackdropHandling(page, measureOption);
      await page.waitForTimeout(1000);

      // Step 2: Select aggregation from second dropdown
      const aggregationSelected = await selectAggregation(page, fieldName, aggregation);
      
      if (aggregationSelected) {
        console.log(`Successfully configured measure: ${fieldName} with ${aggregation} aggregation`);
        addedItems.measures.push({ field: fieldName, aggregation });
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      console.warn(`Measure field option not found: ${fieldName}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  }
}

/**
 * Selects aggregation type from Nebula hub aggregation dropdown
 * @param {Page} page - Playwright page object
 * @param {string} fieldName - Field name for the measure
 * @param {string} aggregation - Aggregation type (Sum, Count, etc.)
 * @returns {Promise<boolean>} True if aggregation was selected successfully
 */
async function selectAggregation(page, fieldName, aggregation) {
  console.log(`Selecting aggregation: ${aggregation}`);
  
  // Try different aggregation selector formats
  const aggregationSelectors = [
    `text="${aggregation.toLowerCase()}(${fieldName})"`,
    `text="${aggregation}(${fieldName})"`,
    `text="${aggregation}"`,
    `text="${aggregation.toLowerCase()}"`,
    `[data-value*="${aggregation.toLowerCase()}"]`,
    `button:has-text("${aggregation}")`
  ];
  
  for (const selector of aggregationSelectors) {
    const aggregationOption = await page.locator(selector).first();
    
    if (await aggregationOption.isVisible().catch(() => false)) {
      await clickWithBackdropHandling(page, aggregationOption);
      await page.waitForTimeout(500);
      return true;
    }
  }
  
  console.warn(`Aggregation option not found: ${aggregation} for ${fieldName}`);
  return false;
}

/**
 * Handles clicking elements that may be behind MUI backdrop
 * @param {Page} page - Playwright page object
 * @param {Locator} element - Element to click
 */
async function clickWithBackdropHandling(page, element) {
  try {
    await element.click({ force: true });
  } catch {
    // Handle MUI backdrop interference
    await page.locator('.MuiBackdrop-root').click({ force: true }).catch(() => {});
    await element.click({ force: true });
  }
}

/**
 * Performs targeted cleanup of extension configuration by removing specific configured items
 * Uses tracked items from configuration to remove only what was actually added
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>} True if cleanup completed successfully
 */
async function cleanupExtensionConfiguration(page) {
  try {
    console.log('Starting targeted configuration cleanup...');
    
    const content = '.njs-viz[data-render-count]';
    await page.waitForSelector(content, { visible: true });
    await page.waitForTimeout(500);

    // Retrieve tracked items from configuration phase
    const addedItems = page.addedExtensionItems || { dimensions: [], measures: [] };
    console.log('Items scheduled for removal:', addedItems);

    // Remove configured dimensions by targeting specific names
    await removeConfiguredDimensions(page, addedItems.dimensions);
    
    // Remove configured measures by targeting specific field/aggregation combinations
    await removeConfiguredMeasures(page, addedItems.measures);

    // Fallback removal for any remaining configured items
    await performFallbackCleanup(page);

    // Clear tracking to prevent stale references
    page.addedExtensionItems = { dimensions: [], measures: [] };

    await page.waitForTimeout(1000);
    console.log('Configuration cleanup completed successfully');
    
    return true;
  } catch (error) {
    console.warn('Configuration cleanup failed:', error.message);
    return false;
  }
}

/**
 * Removes configured dimensions by finding and clicking their remove buttons in ul lists
 * @param {Page} page - Playwright page object
 * @param {string[]} dimensionNames - Array of dimension names to remove
 */
async function removeConfiguredDimensions(page, dimensionNames) {
  for (const dimensionName of dimensionNames) {
    console.log(`Targeting dimension for removal: ${dimensionName}`);
    
    // Search for dimension item and its remove button in ul structure
    const dimensionSelectors = [
      `ul li:has-text("${dimensionName}") button svg`,
      `ul li:has-text("${dimensionName}") button`,
      `li:has-text("${dimensionName}") + button`,
      `[data-testid*="dimension"]:has-text("${dimensionName}") button`
    ];
    
    const removed = await attemptRemoval(page, dimensionSelectors, `dimension: ${dimensionName}`);
    if (!removed) {
      console.warn(`Could not locate remove button for dimension: ${dimensionName}`);
    }
  }
}

/**
 * Removes configured measures by finding and clicking their remove buttons in ul lists
 * @param {Page} page - Playwright page object  
 * @param {Array<object>} measureItems - Array of measure objects with field and aggregation
 */
async function removeConfiguredMeasures(page, measureItems) {
  for (const measureItem of measureItems) {
    const measureDisplayName = `${measureItem.aggregation}(${measureItem.field})`;
    console.log(`Targeting measure for removal: ${measureDisplayName}`);
    
    // Search for measure item and its remove button in ul structure
    const measureSelectors = [
      `ul li:has-text("${measureDisplayName}") button svg`,
      `ul li:has-text("${measureDisplayName}") button`,
      `ul li:has-text("${measureItem.field}") button svg`,
      `ul li:has-text("${measureItem.field}") button`,
      `li:has-text("${measureDisplayName}") + button`,
      `[data-testid*="measure"]:has-text("${measureItem.field}") button`
    ];
    
    const removed = await attemptRemoval(page, measureSelectors, `measure: ${measureDisplayName}`);
    if (!removed) {
      console.warn(`Could not locate remove button for measure: ${measureDisplayName}`);
    }
  }
}

/**
 * Attempts to remove an item using multiple selector strategies
 * @param {Page} page - Playwright page object
 * @param {string[]} selectors - Array of selectors to try
 * @param {string} itemDescription - Description for logging
 * @returns {Promise<boolean>} True if removal was successful
 */
async function attemptRemoval(page, selectors, itemDescription) {
  for (const selector of selectors) {
    const removeBtn = await page.locator(selector).first();
    
    if (await removeBtn.isVisible().catch(() => false)) {
      await removeBtn.click({ force: true });
      await page.waitForTimeout(300);
      console.log(`Successfully removed configured ${itemDescription}`);
      return true;
    }
  }
  return false;
}

/**
 * Performs fallback cleanup for any remaining configured items with remove buttons
 * @param {Page} page - Playwright page object
 */
async function performFallbackCleanup(page) {
  const fallbackSelector = 'ul li button svg, ul li button:has-text("×"), ul li button:has-text("✕")';
  const anyRemoveBtn = await page.locator(fallbackSelector).first();
  
  if (await anyRemoveBtn.isVisible().catch(() => false)) {
    await anyRemoveBtn.click({ force: true });
    await page.waitForTimeout(300);
    console.log('Performed fallback removal of additional configured item');
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
      try {
        await selectableElements[0].click({ force: true });
      } catch {
        // Handle potential MUI backdrop interference
        await page.locator('.MuiBackdrop-root').click({ force: true }).catch(() => {});
        await selectableElements[0].click({ force: true });
      }
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
  cleanupExtensionConfiguration,
  triggerSelectionMode,
  validateAccessibility,
  getExtensionState,
};
