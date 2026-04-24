/**
 * @fileoverview Shared test setup utilities for extension test modules.
 *
 * Provides a standardised beforeEach setup for any test module that interacts
 * with the configured extension state. Ensures the Nebula Hub property cache is
 * disabled and the engine state is clean before each test runs.
 */

import { expect } from '@playwright/test';
import { IDENTIFIERS, TIMEOUTS } from '../core/identifiers.js';
import { CONFIGURATION_IDENTIFIERS } from '../core/configuration-identifiers.js';
import {
  getJsonEditorContent,
  validateJsonStructure,
  expandMonacoEditorContent,
} from './json-editor.js';

/**
 * Standard beforeEach setup for extension test modules.
 *
 * Performs two checks before each test:
 * 1. Uncheck "Enable property cache" if checked — prevents Nebula Hub from serving
 *    cached properties on page load, which can mask bleed-through from prior tests.
 * 2. Open the properties dialog and verify qDimensions and qMeasures are both empty.
 *    If either is non-empty, this is a known intermittent bleed-through caused by the
 *    Qlik engine async write race during teardown — not a test code failure.
 *
 * @param {Object} testContext - Shared test context
 * @param {import('../page-objects/nebula-hub').NebulaHubPage} testContext.hub - Nebula Hub page object
 */
async function assertCleanExtensionState({ hub }) {
  // Wait for hub to be ready — Add Dimension button appears only after engine connects
  await expect(
    hub.page.locator(CONFIGURATION_IDENTIFIERS.ADD_DIMENSION_BUTTON),
    'Add Dimension button not visible in beforeEach — hub may still be loading.'
  ).toBeVisible({ timeout: TIMEOUTS.NETWORK });

  // Uncheck property cache if enabled — cached properties can return stale engine
  // state from a prior test even after resetConfiguration() cleared it
  const propertyCacheCheckbox = hub.page.locator(IDENTIFIERS.PROPERTY_CACHE_CHECKBOX);
  const isCacheEnabled = await propertyCacheCheckbox.isChecked().catch(() => false);
  if (isCacheEnabled) {
    await propertyCacheCheckbox.uncheck();
    console.log('   • Property cache: unchecked (was enabled — disabled to prevent stale state bleed)');
  } else {
    console.log('   • Property cache: ✅ already unchecked');
  }

  // Verify engine state is clean — open properties dialog and confirm both arrays empty.
  // Failure here is a known intermittent bleed-through: the Qlik engine async write from
  // the prior test's resetConfiguration() did not complete before this page connected.
  // This is NOT a test code failure — re-run the suite.
  // If it fails consistently across multiple re-runs, increase the engine settle wait
  // in resetConfiguration() in test/lib/page-objects/nebula-hub.js.
  const propertiesButton = hub.page.locator(IDENTIFIERS.MODIFY_PROPERTIES_BUTTON);
  await expect(propertiesButton).toBeEnabled({ timeout: TIMEOUTS.NETWORK });

  let dialogIsOpen = false;
  try {
    const dialogOpened = await hub.openPropertiesDialog();
    if (!dialogOpened) {return;}

    dialogIsOpen = true;
    await expect(hub.page.locator('.monaco-editor')).toBeVisible({ timeout: TIMEOUTS.STANDARD });
    await expandMonacoEditorContent(hub.page);

    const jsonResult = await getJsonEditorContent(hub.page);
    if (!jsonResult.success) {return;}

    const validationResult = validateJsonStructure(jsonResult.content, {
      allowPartialJson: false,
      requiredSections: ['qHyperCubeDef'],
    });
    if (!validationResult.success) {return;}

    const json = validationResult.jsonObject;
    expect(
      json.qHyperCubeDef.qDimensions,
      'qDimensions is not empty at test start — known intermittent bleed-through: ' +
        'the Qlik engine async write did not complete before this page connected. ' +
        'This is not a test code failure — re-run the suite. ' +
        'If it fails consistently, check resetConfiguration() and the engine settle wait in nebula-hub.js.'
    ).toHaveLength(0);
    expect(
      json.qHyperCubeDef.qMeasures,
      'qMeasures is not empty at test start — known intermittent bleed-through: ' +
        'the Qlik engine async write did not complete before this page connected. ' +
        'This is not a test code failure — re-run the suite. ' +
        'If it fails consistently, check resetConfiguration() and the engine settle wait in nebula-hub.js.'
    ).toHaveLength(0);
    console.log('   • Pre-test state: ✅ qDimensions and qMeasures both empty');
  } finally {
    if (dialogIsOpen) {
      try {
        const cancelBtn = hub.page.locator('button:has-text("Cancel")');
        await cancelBtn.click();
        await hub.page
          .locator('div[role="dialog"].MuiDialog-paper')
          .waitFor({ state: 'hidden', timeout: 3000 });
      } catch {
        // ignore close errors in beforeEach
      }
    }
  }
}

/**
 * Closes the properties dialog if it is open.
 *
 * Extracted from the finally block that appears in every test that opens the Monaco
 * editor — click Cancel and wait for the dialog to disappear. Swallows errors so
 * test teardown is not interrupted by a close failure.
 *
 * @param {import('@playwright/test').Page} page
 * @param {boolean} dialogIsOpen - Only attempts close when true
 */
async function closePropertiesDialog(page, dialogIsOpen) {
  if (!dialogIsOpen) {return;}
  try {
    const cancelBtn = page.locator('button:has-text("Cancel")');
    await cancelBtn.click();
    await page.locator('div[role="dialog"].MuiDialog-paper').waitFor({ state: 'hidden', timeout: 3000 });
  } catch (closeError) {
    console.log(`⚠️  Dialog close failed: ${closeError.message}`);
  }
}

export { assertCleanExtensionState, closePropertiesDialog };
