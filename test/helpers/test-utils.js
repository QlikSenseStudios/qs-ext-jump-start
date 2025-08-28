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
    const addDimensionBtn = await page
      .locator('button:has-text("Add dimension"), button:has-text("Add dimensions")')
      .first();

    if (!(await addDimensionBtn.isVisible().catch(() => false))) {
      console.warn('Add dimension button not found');
      continue;
    }

    await addDimensionBtn.click();
    await page.waitForTimeout(1000);

    // Wait for dimension selection popover/dialog to appear
    const popovers = page.locator('.MuiPopover-root, .MuiDialog-root');
    await popovers
      .last()
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});

    // Try filtering in a textbox if present (MUI Autocomplete)
    const filterInput = popovers.last().locator('input[type="text"], [role="combobox"] input').first();
    if (await filterInput.isVisible().catch(() => false)) {
      await filterInput.fill('');
      await filterInput.type(dimension, { delay: 25 }).catch(() => {});
      await page.waitForTimeout(250);
    }

    // Prefer options inside the visible popover/dialog
    const optionCandidates = [
      popovers.last().locator(`[role="option"]:has-text("${dimension}")`).first(),
      popovers.last().locator(`li:has-text("${dimension}")`).first(),
      popovers.last().locator(`text="${dimension}"`).first(),
    ];
    let clicked = false;
    for (const loc of optionCandidates) {
      if (await loc.isVisible().catch(() => false)) {
        await clickWithBackdropHandling(page, loc);
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      console.warn(`Dimension option not visible/clickable: ${dimension}`);
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(300);
      continue;
    }

    // Confirm that the dimension was actually added (appears in the configured list)
    let confirmed = false;
    try {
      await page.locator(`ul li:has-text("${dimension}")`).first().waitFor({ state: 'visible', timeout: 2500 });
      confirmed = true;
    } catch {
      // Some UIs require Enter to commit; try it once
      await page.keyboard.press('Enter').catch(() => {});
      await page.waitForTimeout(300);
      confirmed = await page
        .locator(`ul li:has-text("${dimension}")`)
        .first()
        .isVisible()
        .catch(() => false);
    }
    if (confirmed) {
      console.log(`Successfully configured dimension: ${dimension}`);
      addedItems.dimensions.push(dimension);
    } else {
      console.warn(`Dimension did not appear as configured: ${dimension}`);
    }

    // Close any open popover to avoid interference
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
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

    // Wait for field selection popover/dialog to appear
    const popovers = page.locator('.MuiPopover-root, .MuiDialog-root');
    await popovers
      .last()
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});

    // Step 1: Select field from dropdown (with filtering if available)
    const filterInput = popovers.last().locator('input[type="text"], [role="combobox"] input').first();
    if (await filterInput.isVisible().catch(() => false)) {
      await filterInput.fill('');
      await filterInput.type(fieldName, { delay: 25 }).catch(() => {});
      await page.waitForTimeout(250);
    }
    const fieldCandidates = [
      popovers.last().locator(`[role="option"]:has-text("${fieldName}")`).first(),
      popovers.last().locator(`li:has-text("${fieldName}")`).first(),
      popovers.last().locator(`text="${fieldName}"`).first(),
    ];
    let fieldSelected = false;
    for (const loc of fieldCandidates) {
      if (await loc.isVisible().catch(() => false)) {
        await clickWithBackdropHandling(page, loc);
        fieldSelected = true;
        break;
      }
    }

    if (fieldSelected) {
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
  const popovers = page.locator('.MuiPopover-root, .MuiDialog-root');
  const scope = popovers.last();
  const aggregationLocators = [
    scope.locator(`text="${aggregation.toLowerCase()}(${fieldName})"`).first(),
    scope.locator(`text="${aggregation}(${fieldName})"`).first(),
    scope.locator(`text="${aggregation}"`).first(),
    scope.locator(`text="${aggregation.toLowerCase()}"`).first(),
    scope.locator(`[data-value*="${aggregation.toLowerCase()}"]`).first(),
    scope.locator(`button:has-text("${aggregation}")`).first(),
    scope.locator(`[role="option"]:has-text("${aggregation}")`).first(),
  ];

  for (const aggregationOption of aggregationLocators) {
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
    await page
      .locator('.MuiBackdrop-root')
      .click({ force: true })
      .catch(() => {});
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
      `[data-testid*="dimension"]:has-text("${dimensionName}") button`,
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
      `[data-testid*="measure"]:has-text("${measureItem.field}") button`,
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
 * Resets extension object properties via the properties (gear) dialog to an empty JSON object {}
 * This helps avoid configuration artifacts between tests when using Nebula/Sense property panel
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>} True if a reset was performed
 */
async function resetPropertiesToEmptyJson(page) {
  try {
    const content = '.njs-viz[data-render-count]';
    await page.waitForSelector(content, { visible: true });
    const viz = page.locator(content).first();

    // Find and click the gear/properties button by title or accessible name
    const btnSelectors = [
      '[title="Modify object properties"]',
      'button[title="Modify object properties"]',
      'button[aria-label*="Modify object properties"]',
      'button:has-text("Modify object properties")',
      // Broader fallbacks and scoped within the viz to avoid unrelated matches
      `${content} [title*="properties"]`,
      `${content} button[title*="properties"]`,
      `${content} button[aria-label*="properties"]`,
      `${content} button:has-text("Properties")`,
      `${content} [role="button"][aria-label*="properties"]`,
    ];

    let opened = false;
    for (const sel of btnSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible().catch(() => false)) {
        console.log('Opening properties via selector:', sel);
        await btn.click({ force: true });
        opened = true;
        break;
      }
    }
    if (!opened) {
      // Try revealing toolbar via hover on the viz, then retry
      await viz.hover().catch(() => {});
      for (const sel of btnSelectors) {
        const btn = page.locator(sel).first();
        if (await btn.isVisible().catch(() => false)) {
          console.log('Opening properties after hover via selector:', sel);
          await btn.click({ force: true });
          opened = true;
          break;
        }
      }
    }
    if (!opened) {
      return false;
    }

    // Wait for the dialog to appear
    const dialog = page.locator('.MuiDialog-root [role="dialog"], [role="dialog"]').last();
    await dialog.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (!(await dialog.isVisible().catch(() => false))) {
      return false;
    }
    // Allow dialog contents to mount
    await page.waitForTimeout(300);

    // Try to locate a JSON input (textarea or editor)
    const jsonInputs = [
      dialog.locator('textarea').first(),
      dialog.locator('textarea[role="textbox"]').first(),
      dialog.locator('input[type="text"]').first(),
      dialog.locator('[contenteditable="true"]').first(),
      dialog.locator('.cm-content').first(), // CodeMirror content
      dialog.locator('.monaco-editor').first(), // Monaco editor container
      dialog.locator('.monaco-editor textarea.inputarea').first(), // Monaco hidden textarea
    ];

    let inputFound = null;
    for (const inp of jsonInputs) {
      if (await inp.isVisible().catch(() => false)) {
        inputFound = inp;
        break;
      }
    }

    if (inputFound) {
      // Attempt to clear and type {}
      try {
        await inputFound.click({ force: true });
        // Support both CodeMirror/Monaco by sending select-all and backspace
        await page.keyboard.press('Control+A').catch(() => {});
        await page.keyboard.press('Meta+A').catch(() => {});
        await page.keyboard.press('Backspace').catch(() => {});
        await page.keyboard.type('{}', { delay: 10 });
        // Brief pause so the change is visible in headed mode
        await page.waitForTimeout(600);
      } catch {
        // Fallback: use fill for input/textarea
        await inputFound.fill('{}').catch(() => {});
        // Brief pause so the change is visible in headed mode
        await page.waitForTimeout(600);
      }

      // Validate content updated to {}
      try {
        const isCodeMirror = await dialog
          .locator('.cm-content')
          .first()
          .isVisible()
          .catch(() => false);
        const isMonaco = await dialog
          .locator('.monaco-editor')
          .first()
          .isVisible()
          .catch(() => false);
        if (!isCodeMirror && !isMonaco) {
          // For textarea/input, ensure value is {}
          const val = await inputFound.inputValue().catch(() => '');
          if (val.trim() !== '{}') {
            await inputFound.fill('{}').catch(() => {});
            await page.waitForTimeout(300);
          }
        }
      } catch {
        // ignore validation errors, continue
      }
    }

    // Confirm/apply changes
    const confirm = dialog
      .locator('button:has-text("Confirm"), button:has-text("Apply"), button:has-text("OK"), button:has-text("Save")')
      .first();
    // Capture render-count before applying to detect re-render
    const beforeRender = await viz.getAttribute('data-render-count').catch(() => null);
    if (await confirm.isVisible().catch(() => false)) {
      await confirm.click({ force: true });
      // Brief pause so the confirm action is visible in headed mode
      await page.waitForTimeout(600);
    } else {
      // Fallback: close with Escape if no explicit confirm
      await page.keyboard.press('Escape').catch(() => {});
    }

    // Wait for dialog to close
    await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(async () => {
      // Try Ctrl/Cmd+Enter apply then retry hide
      await page.keyboard.press('Control+Enter').catch(() => {});
      await page.keyboard.press('Meta+Enter').catch(() => {});
      await page.waitForTimeout(400);
      await dialog.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
      // As last resort, click any visible "Close"/"OK" again
      const closeBtn = dialog.locator('button:has-text("Close"), button:has-text("OK")').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(300);
      }
    });
    // Wait for a re-render tick if possible
    if (beforeRender) {
      await page
        .waitForFunction(
          (sel, prev) => {
            const el = document.querySelector(sel);
            if (!el) {
              return true; // viz gone, treat as done
            }
            const cur = el.getAttribute('data-render-count');
            return cur && cur !== prev;
          },
          content,
          beforeRender,
          { timeout: 3000 }
        )
        .catch(() => {});
    } else {
      await page.waitForTimeout(500);
    }
    return true;
  } catch (e) {
    console.warn('resetPropertiesToEmptyJson encountered an issue:', e.message);
    return false;
  }
}

/**
 * Clears all selections using the toolbar/button control in the app
 * Looks for a button with title="Clear all selections" or similar accessible names
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>} True if a clear action was performed
 */
async function clearAllSelections(page) {
  try {
    // Common selectors for clear selections controls
    const candidates = [
      '[title="Clear all selections"]',
      'button[title*="Clear all selection"]',
      'button:has-text("Clear all selections")',
      'button[aria-label*="Clear all selection"]',
    ];

    for (const sel of candidates) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click({ force: true });
        await page.waitForTimeout(400);
        console.log('Cleared selections via control:', sel);
        return true;
      }
    }

    // If no button found, try keyboard escape twice to exit selection mode
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(150);
    await page.keyboard.press('Escape').catch(() => {});
    const inSelection = await page.$('.extension-container.in-selection');
    if (!inSelection) {
      console.log('Cleared selections via keyboard escape');
      return true;
    }
  } catch (e) {
    console.warn('clearAllSelections encountered an issue:', e.message);
  }
  return false;
}

/**
 * Triggers selection mode in the extension
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>} Success status
 */
async function triggerSelectionMode(page) {
  try {
    const content = '.njs-viz[data-render-count]';
    await page.waitForSelector(content, { visible: true });

    // Prefer clickable dimension cells from our extension
    const cell = await page.$('.extension-container td.dim-cell.selectable-item');
    if (!cell) {
      // Fallback to any selectable element in case of different markup
      const anySelectable = await page.$('.selectable-item, .data-point, .chart-element');
      if (!anySelectable) {
        return false;
      }
      await anySelectable.click({ force: true }).catch(async () => {
        await page
          .locator('.MuiBackdrop-root')
          .click({ force: true })
          .catch(() => {});
        await anySelectable.click({ force: true });
      });
    } else {
      await cell.click({ force: true }).catch(async () => {
        await page
          .locator('.MuiBackdrop-root')
          .click({ force: true })
          .catch(() => {});
        await cell.click({ force: true });
      });
    }

    await page.waitForTimeout(800);

    // Selection mode in this extension is indicated by in-selection class on container
    const container = await page.$('.extension-container.in-selection');
    const anyLocalSelected = await page.$('.extension-container .dim-cell.local-selected');
    return Boolean(container || anyLocalSelected);
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
  clearAllSelections,
  resetPropertiesToEmptyJson,
};
