/**
 * @fileoverview Extension configured state test module.
 *
 * Tests the extension after configuration via the Nebula Hub data panel.
 * Each test configures from a clean unconfigured state and validates the
 * resulting extension behavior. Teardown resets configuration so tests
 * are independent of each other.
 *
 * The test app data model is defined in test/qlik-sense-app/load-script.qvs.
 * Fields used: Dim1 (values: A/B/C), Expression1 (numeric, used as sum measure).
 *
 * Measure field picker is two-step: select field (Expression1) → select aggregation
 * (sum(Expression1)). The nav element is replaced between steps — re-wait for the
 * aggregation button before clicking. Resulting JSON: qDef.qDef === 'sum([Expression1])'.
 */

import { test, expect } from '@playwright/test';
import { IDENTIFIERS, TIMEOUTS } from '../lib/core/identifiers.js';
import { CONFIGURATION_IDENTIFIERS } from '../lib/core/configuration-identifiers.js';
import {
  getJsonEditorContent,
  validateJsonStructure,
  expandMonacoEditorContent,
} from '../lib/utilities/json-editor.js';
import { assertCleanExtensionState, closePropertiesDialog } from '../lib/utilities/test-setup.js';

/**
 * Extension configured state validation tests.
 *
 * @param {Object} testContext - Test context with page, hub, and utilities
 * @param {import('@playwright/test').Page} testContext.page - Playwright page object
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} testContext.hub - Nebula Hub page object
 */
function extensionConfiguredTests(testContext) {
  test.describe('Extension Configured State', () => {
    test.beforeEach(async () => {
      await assertCleanExtensionState(testContext);
    });

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
        await closePropertiesDialog(hub.page, dialogIsOpen);
      }
    });

    test('validates measure-only configuration keeps extension in incomplete state', async () => {
      const { hub } = testContext;

      // Confirm Add Measure button is available at start
      const addMeasureBtn = hub.page.locator(CONFIGURATION_IDENTIFIERS.ADD_MEASURE_BUTTON);
      await expect(
        addMeasureBtn,
        'Add Measure button not visible — hub may still be loading or selector has drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.NETWORK });
      await expect(addMeasureBtn).toBeEnabled();

      // Open the field picker
      await addMeasureBtn.click();
      console.log('   • Add Measure button: clicked');

      // Search for Expression1
      const searchInput = hub.page.locator(CONFIGURATION_IDENTIFIERS.FIELD_PICKER_SEARCH).first();
      await expect(
        searchInput,
        'Field picker search input not visible — dropdown may not have opened or selector has drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await searchInput.fill('Expression1');
      console.log('   • Measure field picker: search filled');

      // Wait for nav to render the field list
      const fieldNav = hub.page.locator('nav').first();
      await expect(
        fieldNav,
        'Field picker nav not visible after searching — selector may have drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });

      // Step 1: select the field — nav will be replaced with aggregation options
      const expression1Field = hub.page.getByRole('button', { name: 'Expression1', exact: true });
      await expect(
        expression1Field,
        '"Expression1" not found in field picker results — verify the test app data model has an Expression1 field (see test/qlik-sense-app/load-script.qvs).'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await expression1Field.click();
      console.log('   • Measure field picker: Expression1 field selected, waiting for aggregation options');

      // Step 2: nav is replaced with aggregation options — use NETWORK timeout as the replacement is async
      const sumOption = hub.page.getByRole('button', { name: 'sum(Expression1)', exact: true });
      await expect(
        sumOption,
        '"sum(Expression1)" aggregation option not visible — nav may not have updated after field selection or aggregation selector has drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.NETWORK });
      await sumOption.click();
      console.log('   • Measure field picker: sum(Expression1) aggregation selected');

      // Add Measure button should now be disabled — max: 1 enforced
      await expect(
        addMeasureBtn,
        'Add Measure button still enabled after selecting a measure — max constraint from data.js may not be enforced.'
      ).toBeDisabled({ timeout: TIMEOUTS.STANDARD });
      console.log('   • Add Measure button: ✅ Disabled after selection (max: 1 enforced)');

      // Incomplete visualization must remain — dimension min: 1 is still unsatisfied
      await expect(
        hub.page.locator(IDENTIFIERS.INCOMPLETE_VISUALIZATION),
        'Incomplete visualization cleared after measure-only selection — extension should remain incomplete without a dimension (min: 1 required).'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      console.log('   • Incomplete visualization: ✅ Remains visible (dimension still required)');

      // Open properties dialog to validate the measure JSON shape
      const propertiesButton = hub.page.locator(IDENTIFIERS.MODIFY_PROPERTIES_BUTTON);
      await expect(propertiesButton).toBeEnabled({ timeout: TIMEOUTS.NETWORK });

      let dialogIsOpen = false;
      try {
        const dialogOpened = await hub.openPropertiesDialog();
        expect(
          dialogOpened,
          'Properties dialog failed to open after measure selection — extension may be in an unexpected state.'
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

        // qDimensions must be empty — no dimension was added
        expect(Array.isArray(json.qHyperCubeDef.qDimensions)).toBe(true);
        expect(json.qHyperCubeDef.qDimensions).toHaveLength(0);
        console.log('   • qHyperCubeDef.qDimensions: ✅ empty (no dimension added)');

        // qMeasures must have one entry with sum([Expression1]) as the expression
        expect(Array.isArray(json.qHyperCubeDef.qMeasures)).toBe(true);
        expect(json.qHyperCubeDef.qMeasures).toHaveLength(1);
        expect(json.qHyperCubeDef.qMeasures[0].qDef.qDef).toBe('sum([Expression1])');
        console.log('   • qHyperCubeDef.qMeasures: ✅ one entry with qDef.qDef === "sum([Expression1])"');
      } finally {
        await closePropertiesDialog(hub.page, dialogIsOpen);
      }
    });

    test('validates dimension and measure configuration transitions extension to complete state', async () => {
      const { hub } = testContext;

      // --- Add dimension (Dim1) ---
      const addDimensionBtn = hub.page.locator(CONFIGURATION_IDENTIFIERS.ADD_DIMENSION_BUTTON);
      await expect(
        addDimensionBtn,
        'Add Dimension button not visible — hub may still be loading or selector has drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.NETWORK });
      await addDimensionBtn.click();

      const dimSearchInput = hub.page.locator(CONFIGURATION_IDENTIFIERS.FIELD_PICKER_SEARCH).first();
      await expect(dimSearchInput).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await dimSearchInput.fill('Dim1');

      const dimFieldNav = hub.page.locator('nav').first();
      await expect(dimFieldNav).toBeVisible({ timeout: TIMEOUTS.STANDARD });

      const dim1Option = hub.page.getByRole('button', { name: 'Dim1', exact: true });
      await expect(
        dim1Option,
        '"Dim1" not found in field picker — verify the test app data model has a Dim1 field (see test/qlik-sense-app/load-script.qvs).'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await dim1Option.click();

      // Extension should transition to complete state once dimension min: 1 is satisfied
      await expect(
        hub.page.locator(IDENTIFIERS.INCOMPLETE_VISUALIZATION),
        'Incomplete visualization still visible after dimension selected — extension may not have re-rendered.'
      ).toBeHidden({ timeout: TIMEOUTS.NETWORK });
      await expect(
        hub.page.locator(IDENTIFIERS.COMPLETE_VISUALIZATION),
        'Complete visualization not found after dimension selected — extension did not reach rendered state.'
      ).toBeAttached({ timeout: TIMEOUTS.NETWORK });
      console.log('   • Dimension added: ✅ Extension transitioned to complete state');

      // --- Add measure (Expression1 → sum) ---
      const addMeasureBtn = hub.page.locator(CONFIGURATION_IDENTIFIERS.ADD_MEASURE_BUTTON);
      await expect(
        addMeasureBtn,
        'Add Measure button not visible after dimension selection — selector may have drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      // Use NETWORK timeout — the data panel re-evaluates constraints after the extension
      // re-renders into complete state; the button may still be catching up from prior state
      await expect(
        addMeasureBtn,
        'Add Measure button not enabled after dimension selection — data panel may still be settling after render.'
      ).toBeEnabled({ timeout: TIMEOUTS.NETWORK });
      await addMeasureBtn.click();
      console.log('   • Add Measure button: clicked');

      const measureSearchInput = hub.page.locator(CONFIGURATION_IDENTIFIERS.FIELD_PICKER_SEARCH).first();
      await expect(measureSearchInput).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await measureSearchInput.fill('Expression1');
      console.log('   • Measure field picker: search filled');

      const measureFieldNav = hub.page.locator('nav').first();
      await expect(measureFieldNav).toBeVisible({ timeout: TIMEOUTS.STANDARD });

      const expression1Field = hub.page.getByRole('button', { name: 'Expression1', exact: true });
      await expect(
        expression1Field,
        '"Expression1" not found in field picker — verify the test app data model has an Expression1 field (see test/qlik-sense-app/load-script.qvs).'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await expression1Field.click();
      console.log('   • Measure field picker: Expression1 field selected, waiting for aggregation options');

      // Nav is replaced with aggregation options after field selection — use NETWORK timeout
      // as the nav replacement is async and may be slower after a full render cycle
      const sumOption = hub.page.getByRole('button', { name: 'sum(Expression1)', exact: true });
      await expect(
        sumOption,
        '"sum(Expression1)" aggregation option not visible — nav may not have updated after field selection or aggregation selector has drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.NETWORK });
      await sumOption.click();
      console.log('   • Measure field picker: sum(Expression1) aggregation selected');

      // Add Measure button should now be disabled — max: 1 enforced
      await expect(
        addMeasureBtn,
        'Add Measure button still enabled after selecting a measure — max constraint from data.js may not be enforced.'
      ).toBeDisabled({ timeout: TIMEOUTS.NETWORK });
      console.log('   • Add Measure button: ✅ Disabled after selection (max: 1 enforced)');

      // Extension should remain in complete state — measure is optional, adding one should not break rendering
      await expect(
        hub.page.locator(IDENTIFIERS.COMPLETE_VISUALIZATION),
        'Complete visualization lost after measure added — extension may have entered an error state.'
      ).toBeAttached({ timeout: TIMEOUTS.NETWORK });
      console.log('   • Complete visualization: ✅ Remains after measure added');

      // Open properties dialog to validate both dimension and measure JSON entries
      const propertiesButton = hub.page.locator(IDENTIFIERS.MODIFY_PROPERTIES_BUTTON);
      await expect(propertiesButton).toBeEnabled({ timeout: TIMEOUTS.NETWORK });

      let dialogIsOpen = false;
      try {
        const dialogOpened = await hub.openPropertiesDialog();
        expect(
          dialogOpened,
          'Properties dialog failed to open after dimension + measure selection — extension may be in an unexpected state.'
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

        // qDimensions must have one entry with Dim1
        expect(Array.isArray(json.qHyperCubeDef.qDimensions)).toBe(true);
        expect(json.qHyperCubeDef.qDimensions).toHaveLength(1);
        expect(Array.isArray(json.qHyperCubeDef.qDimensions[0].qDef.qFieldDefs)).toBe(true);
        expect(json.qHyperCubeDef.qDimensions[0].qDef.qFieldDefs[0]).toBe('Dim1');
        console.log('   • qHyperCubeDef.qDimensions: ✅ one entry with qFieldDefs[0] === "Dim1"');

        // qMeasures must have one entry with sum([Expression1])
        expect(Array.isArray(json.qHyperCubeDef.qMeasures)).toBe(true);
        expect(json.qHyperCubeDef.qMeasures).toHaveLength(1);
        expect(json.qHyperCubeDef.qMeasures[0].qDef.qDef).toBe('sum([Expression1])');
        console.log('   • qHyperCubeDef.qMeasures: ✅ one entry with qDef.qDef === "sum([Expression1])"');
      } finally {
        await closePropertiesDialog(hub.page, dialogIsOpen);
      }
    });
  });
}

export { extensionConfiguredTests };
