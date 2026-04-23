/**
 * @fileoverview Extension configured state test module.
 *
 * Tests the extension after configuration via the Nebula Hub data panel.
 * Each test configures from a clean unconfigured state and validates the
 * resulting extension behavior. Teardown resets configuration so tests
 * are independent of each other.
 *
 * The test app data model is defined in test/qlik-sense-app/load-script.qvs.
 * Fields used: Dim1 (values: A/B/C), Expression1.
 */

import { test, expect } from '@playwright/test';
import { IDENTIFIERS, TIMEOUTS } from '../lib/core/identifiers.js';
import { CONFIGURATION_IDENTIFIERS } from '../lib/core/configuration-identifiers.js';
import {
  getJsonEditorContent,
  validateJsonStructure,
  expandMonacoEditorContent,
} from '../lib/utilities/json-editor.js';

/**
 * Extension configured state validation tests.
 *
 * @param {Object} testContext - Test context with page, hub, and utilities
 * @param {import('@playwright/test').Page} testContext.page - Playwright page object
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} testContext.hub - Nebula Hub page object
 */
function extensionConfiguredTests(testContext) {
  test.describe('Extension Configured State', () => {
    test('validates dimension selection configures extension and transitions to complete state', async () => {
      const { hub } = testContext;

      // Confirm starting from unconfigured state — NETWORK timeout because the hub
      // loads asynchronously and the data panel renders after the Qlik engine connects.
      const addDimensionBtn = hub.page.locator(CONFIGURATION_IDENTIFIERS.ADD_DIMENSION_BUTTON);
      await expect(
        addDimensionBtn,
        'Add Dimension button not visible — hub may still be loading or selector has drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.NETWORK });
      await expect(addDimensionBtn).toBeEnabled();

      // Open the field picker — clicking reveals a search input and a nav field list
      await addDimensionBtn.click();

      // Search for Dim1 to filter the field list
      // Field picker DOM: search input + navigation element containing field buttons as siblings
      const searchInput = hub.page.locator(CONFIGURATION_IDENTIFIERS.FIELD_PICKER_SEARCH).first();
      await expect(
        searchInput,
        'Field picker search input not visible — dropdown may not have opened or selector has drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await searchInput.fill('Dim1');

      // Field picker DOM: search input div + sibling nav containing field buttons.
      // Wait for the nav to confirm the list has rendered before querying the field.
      const fieldNav = hub.page.locator('nav').first();
      await expect(
        fieldNav,
        'Field picker nav not visible after searching — selector may have drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });

      // Use getByRole to find the field button by accessible name — more robust than
      // CSS selectors against the nav's internal structure.
      const dim1Option = hub.page.getByRole('button', { name: 'Dim1', exact: true });
      await expect(
        dim1Option,
        '"Dim1" not found in field picker results — verify the test app data model has a Dim1 field (see test/qlik-sense-app/load-script.qvs).'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await dim1Option.click();

      // Add Dimension button should now be disabled — data.js constrains max dimensions to 1
      await expect(
        addDimensionBtn,
        'Add Dimension button still enabled after selecting a dimension — max constraint from data.js may not be enforced.'
      ).toBeDisabled({ timeout: TIMEOUTS.STANDARD });
      console.log('   • Add Dimension button: ✅ Disabled after selection (max: 1 enforced)');

      // Incomplete visualization state should clear once a valid dimension is configured
      await expect(
        hub.page.locator(IDENTIFIERS.INCOMPLETE_VISUALIZATION),
        'Incomplete visualization still visible after dimension selected — extension may not have re-rendered, ' +
          'or Dim1 is not a valid field in the test app (see test/qlik-sense-app/load-script.qvs).'
      ).toBeHidden({ timeout: TIMEOUTS.NETWORK });
      console.log('   • Incomplete visualization: ✅ Cleared after dimension selected');

      // Extension container should carry a render count — confirms supernova rendered with data
      await expect(
        hub.page.locator(IDENTIFIERS.COMPLETE_VISUALIZATION),
        'Complete visualization container not found — extension did not transition to rendered state. ' +
          'Verify the Qlik app has data for Dim1 and the extension renders correctly when configured.'
      ).toBeAttached({ timeout: TIMEOUTS.NETWORK });
      console.log('   • Complete visualization: ✅ Extension rendered with Dim1 dimension');

      // Open the properties dialog to verify the JSON reflects the dimension selection.
      // Nebula Hub keeps the Modify Properties button disabled until getProperties() resolves — wait for it.
      const propertiesButton = hub.page.locator(IDENTIFIERS.MODIFY_PROPERTIES_BUTTON);
      await expect(propertiesButton).toBeEnabled({ timeout: TIMEOUTS.NETWORK });

      let dialogIsOpen = false;
      try {
        const dialogOpened = await hub.openPropertiesDialog();
        expect(
          dialogOpened,
          'Properties dialog failed to open after dimension selection — extension may be in an unexpected state.'
        ).toBe(true);
        dialogIsOpen = true;

        await expect(hub.page.locator('.monaco-editor')).toBeVisible({ timeout: TIMEOUTS.STANDARD });
        await expandMonacoEditorContent(hub.page);

        const jsonResult = await getJsonEditorContent(hub.page);
        expect(
          jsonResult.success,
          `Failed to read JSON from Monaco editor — strategy used: ${jsonResult.method ?? 'none'}.`
        ).toBe(true);
        expect(jsonResult.method).toBe('Monaco Editor');

        const validationResult = validateJsonStructure(jsonResult.content, {
          allowPartialJson: false,
          requiredSections: ['qHyperCubeDef'],
        });
        expect(
          validationResult.isPartialJson,
          'Monaco editor returned collapsed JSON — expandMonacoEditorContent did not fully render all lines.'
        ).toBe(false);
        expect(validationResult.success, `Missing sections: ${validationResult.missingSections.join(', ')}`).toBe(true);

        const json = validationResult.jsonObject;

        // qHyperCubeDef.qDimensions must have exactly one entry with Dim1 as the field
        expect(Array.isArray(json.qHyperCubeDef.qDimensions)).toBe(true);
        expect(json.qHyperCubeDef.qDimensions).toHaveLength(1);
        expect(Array.isArray(json.qHyperCubeDef.qDimensions[0].qDef.qFieldDefs)).toBe(true);
        expect(json.qHyperCubeDef.qDimensions[0].qDef.qFieldDefs[0]).toBe('Dim1');
        console.log('   • qHyperCubeDef.qDimensions: ✅ one entry with qFieldDefs[0] === "Dim1"');
      } finally {
        if (dialogIsOpen) {
          try {
            const cancelBtn = hub.page.locator('button:has-text("Cancel")');
            await cancelBtn.click();
            await hub.page.locator('div[role="dialog"].MuiDialog-paper').waitFor({ state: 'hidden', timeout: 3000 });
          } catch (closeError) {
            console.log(`⚠️  Dialog close failed: ${closeError.message}`);
          }
        }
      }
    });
  });
}

export { extensionConfiguredTests };
