/**
 * @fileoverview Extension unconfigured state test module.
 *
 * Tests the extension in its unconfigured state, default behavior,
 * configuration panel options, and JSON structure when no data is configured.
 */

import { test, expect } from '@playwright/test';
import { IDENTIFIERS, TIMEOUTS } from '../lib/core/identifiers.js';
import { CONFIGURATION_IDENTIFIERS, CONFIGURATION_TIMEOUTS } from '../lib/core/configuration-identifiers.js';
import { assertCleanExtensionState, closePropertiesDialog } from '../lib/utilities/test-setup.js';
import { getExpectedConfigurationDefaults } from '../lib/utilities/configuration-defaults.js';
import { analyzePropsStructure } from '../lib/utilities/props-structure-analyzer.js';
import {
  getJsonEditorContent,
  validateJsonStructure,
  expandMonacoEditorContent,
} from '../lib/utilities/json-editor.js';

/**
 * Extension unconfigured state validation tests.
 *
 * @param {Object} testContext - Test context with page, hub, and utilities
 * @param {import('@playwright/test').Page} testContext.page - Playwright page object
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} testContext.hub - Nebula Hub page object
 * @param {Function} testContext.slowForShow - Visual inspection helper
 */
function extensionUnconfiguredTests(testContext) {
  test.describe('Extension Unconfigured State', () => {
    test.beforeEach(async () => {
      await assertCleanExtensionState(testContext);
    });

    test('validates incomplete visualization display when unconfigured', async () => {
      const { page } = testContext;

      // Nebula Hub renders [data-tid="error-title"] when qHyperCubeDef has no dimensions or measures.
      // This confirms the extension enters the expected incomplete state rather than crashing or rendering blank.
      const incompleteTitle = page.locator(IDENTIFIERS.INCOMPLETE_VISUALIZATION);
      await expect(
        incompleteTitle,
        'Incomplete visualization title not found — extension may have loaded without error state, ' +
          'or [data-tid="error-title"] selector has drifted. Verify extension renders unconfigured state correctly.'
      ).toBeVisible({ timeout: TIMEOUTS.NETWORK });

      await expect(incompleteTitle).toHaveText('Incomplete visualization');
      console.log('   • Incomplete visualization message: ✅ Displayed correctly');
    });

    test('validates data panel shows dimension and measure controls', async () => {
      const { hub } = testContext;

      // Confirms the data binding UI matches the constraints defined in data.js.
      // Add Dimension and Add Measure buttons must be visible and enabled so the user
      // can configure the extension — if either is missing, the data.js targets are not
      // being surfaced correctly by Nebula Hub.
      const expectedDefaults = getExpectedConfigurationDefaults();

      const addDimensionBtn = hub.page.locator(CONFIGURATION_IDENTIFIERS.ADD_DIMENSION_BUTTON);
      await expect(
        addDimensionBtn,
        'Add Dimension button not visible — data panel may not be rendered or selector has drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await expect(addDimensionBtn).toBeEnabled();
      console.log(
        `   • Add Dimension button: ✅ Visible and enabled (min: ${expectedDefaults.dimensions.min}, max: ${expectedDefaults.dimensions.max})`
      );

      const addMeasureBtn = hub.page.locator(CONFIGURATION_IDENTIFIERS.ADD_MEASURE_BUTTON);
      await expect(
        addMeasureBtn,
        'Add Measure button not visible — data panel may not be rendered or selector has drifted.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await expect(addMeasureBtn).toBeEnabled();
      console.log(
        `   • Add Measure button: ✅ Visible and enabled (min: ${expectedDefaults.measures.min}, max: ${expectedDefaults.measures.max})`
      );
    });

    test('validates caption properties match object-properties defaults', async () => {
      const { hub } = testContext;

      // Confirms the caption property defaults defined in object-properties.js are reflected
      // in the Nebula Hub property panel. Drift here means object-properties.js was changed
      // without updating the test, or the panel is loading stale values.
      const expectedDefaults = getExpectedConfigurationDefaults();

      const showTitlesCheckbox = hub.page.locator(CONFIGURATION_IDENTIFIERS.SHOW_TITLES_CHECKBOX);
      await expect(
        showTitlesCheckbox,
        'Show Titles checkbox not visible — caption properties section may not be rendered or selector has drifted.'
      ).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      await expect(showTitlesCheckbox).toBeChecked();
      console.log(`   • Show Titles: ✅ Checked (matches default: ${expectedDefaults.showTitles})`);

      const titleInput = hub.page.getByRole('textbox', { name: 'title', exact: true });
      await expect(titleInput).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      await expect(titleInput).toHaveValue(expectedDefaults.title);
      console.log(`   • Title: ✅ "${expectedDefaults.title}"`);

      const subtitleInput = hub.page.getByRole('textbox', { name: 'subtitle' });
      await expect(subtitleInput).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      await expect(subtitleInput).toHaveValue(expectedDefaults.subtitle);
      console.log(`   • Subtitle: ✅ "${expectedDefaults.subtitle}"`);

      const footnoteInput = hub.page.getByRole('textbox', { name: 'footnote' });
      await expect(footnoteInput).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      await expect(footnoteInput).toHaveValue(expectedDefaults.footnote);
      console.log(`   • Footnote: ✅ "${expectedDefaults.footnote}"`);
    });

    test('validates custom props section renders with correct defaults', async () => {
      const { hub } = testContext;

      // Confirms that the props object from object-properties.js is surfaced in the Nebula Hub
      // property panel with the correct MUI accordion structure and default values.
      // analyzePropsStructure() derives selectors dynamically from the props shape so this
      // test adapts automatically when props are added or removed.
      const expectedDefaults = getExpectedConfigurationDefaults();
      const propsStructure = analyzePropsStructure(expectedDefaults.props);

      if (propsStructure.length === 0) {
        test.skip(true, 'No custom props defined in object-properties.js — nothing to validate');
        return;
      }

      const accordionGroups = propsStructure.filter((prop) => prop.type === 'accordion');
      if (accordionGroups.length === 0) {
        test.skip(true, 'Props object has no nested groups — no accordion structure to validate');
        return;
      }

      console.log(`   • Props structure: ${accordionGroups.length} accordion group(s) — ${accordionGroups.map((p) => p.name).join(', ')}`);

      // Expand the top-level props accordion so nested groups become visible.
      // MUI_ACCORDION_BUTTON is an xpath selector so it must be chained via .locator(), not interpolated.
      const propsAccordionBtn = hub.page
        .locator(CONFIGURATION_IDENTIFIERS.MUI_PROPS_ACCORDION)
        .locator(CONFIGURATION_IDENTIFIERS.MUI_ACCORDION_BUTTON)
        .first();
      const propsIsExpanded = await propsAccordionBtn.getAttribute('aria-expanded').catch(() => 'false');
      if (propsIsExpanded === 'false') {
        await propsAccordionBtn.click();
      }

      for (const accordionGroup of accordionGroups) {
        const accordion = hub.page.locator(accordionGroup.selector).first();
        await expect(
          accordion,
          `"${accordionGroup.name}" accordion not visible — props panel may not be rendered or MUI selector has drifted.`
        ).toBeVisible({ timeout: TIMEOUTS.STANDARD });

        const accordionButton = hub.page
          .locator(accordionGroup.selector)
          .locator(CONFIGURATION_IDENTIFIERS.MUI_ACCORDION_BUTTON)
          .first();
        const isExpanded = await accordionButton.getAttribute('aria-expanded').catch(() => 'false');
        if (isExpanded === 'false') {
          await accordionButton.click();
        }

        // Find direct child properties of this accordion group
        const groupProperties = propsStructure.filter(
          (prop) =>
            !prop.hasChildren &&
            prop.path.length === accordionGroup.path.length + 1 &&
            prop.path.slice(0, -1).join('.') === accordionGroup.path.join('.')
        );

        for (const property of groupProperties) {
          const element = hub.page.locator(property.selector).first();
          await expect(
            element,
            `"${property.name}" control not visible after expanding "${accordionGroup.name}" accordion.`
          ).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });

          if (property.type === 'checkbox') {
            const checkbox = hub.page.locator(`${property.selector} ${CONFIGURATION_IDENTIFIERS.MUI_CHECKBOX_INPUT}`).first();
            if (property.expectedValue) {
              await expect(checkbox).toBeChecked();
            } else {
              await expect(checkbox).not.toBeChecked();
            }
            console.log(`   • ${property.name}: ✅ ${property.expectedValue ? 'checked' : 'unchecked'}`);
          } else if (property.type === 'textfield') {
            const textInput = hub.page.locator(`${property.selector} ${CONFIGURATION_IDENTIFIERS.MUI_TEXT_INPUT}`).first();
            await expect(textInput).toHaveValue(String(property.expectedValue));
            console.log(`   • ${property.name}: ✅ "${property.expectedValue}"`);
          }
        }

        console.log(`   • ${accordionGroup.name}: ✅ All ${groupProperties.length} properties validated`);
      }
    });

    test('validates JSON configuration matches object-properties defaults', async () => {
      const { hub } = testContext;
      let dialogIsOpen = false;

      try {
        const expectedDefaults = getExpectedConfigurationDefaults();

        // Nebula Hub keeps the Modify Properties button disabled until getProperties() resolves
        // asynchronously — wait for it to become enabled before attempting to open the dialog.
        const propertiesButton = hub.page.locator(IDENTIFIERS.MODIFY_PROPERTIES_BUTTON);
        await expect(propertiesButton).toBeEnabled({ timeout: TIMEOUTS.NETWORK });

        const dialogOpened = await hub.openPropertiesDialog();
        expect(
          dialogOpened,
          'Properties dialog failed to open — extension may not be loaded or a previous test left the UI in a bad state.'
        ).toBe(true);
        dialogIsOpen = true;

        // Wait for Monaco to be present before attempting to expand and read it
        await expect(hub.page.locator('.monaco-editor')).toBeVisible({ timeout: TIMEOUTS.STANDARD });

        // Resize the dialog and editor to force Monaco to render all lines — Monaco virtualizes
        // rows so only visible lines exist in the DOM without this step.
        await expandMonacoEditorContent(hub.page);

        const jsonResult = await getJsonEditorContent(hub.page);
        expect(
          jsonResult.success,
          `Failed to read JSON from Monaco editor — strategy used: ${jsonResult.method ?? 'none'}. ` +
            'Verify the properties dialog opened correctly and Monaco rendered.'
        ).toBe(true);
        expect(
          jsonResult.method,
          'Expected Monaco Editor but got a fallback strategy — dialog may not have opened correctly.'
        ).toBe('Monaco Editor');
        console.log(`   • JSON read via: ${jsonResult.method}`);

        // Validate structure against object-properties.js — all top-level keys must be present
        // and parseable as complete JSON (partial/collapsed JSON means the expand step failed).
        const requiredSections = ['qInfo', 'qHyperCubeDef', 'showTitles', 'props'];
        const validationResult = validateJsonStructure(jsonResult.content, {
          allowPartialJson: false,
          requiredSections,
        });

        expect(
          validationResult.isPartialJson,
          'Monaco editor returned collapsed JSON — expandMonacoEditorContent did not fully render all lines.'
        ).toBe(false);
        expect(validationResult.success, `Missing sections: ${validationResult.missingSections.join(', ')}`).toBe(true);

        const json = validationResult.jsonObject;

        // qInfo.qType must match the extension name (pkg.name via object-properties.js)
        expect(json.qInfo.qType).toBe(expectedDefaults.qType);
        console.log(`   • qInfo.qType: ✅ "${expectedDefaults.qType}"`);

        // qHyperCubeDef must have empty dimension and measure arrays (unconfigured state)
        expect(Array.isArray(json.qHyperCubeDef.qDimensions)).toBe(true);
        expect(Array.isArray(json.qHyperCubeDef.qMeasures)).toBe(true);
        expect(json.qHyperCubeDef.qDimensions).toHaveLength(0);
        expect(json.qHyperCubeDef.qMeasures).toHaveLength(0);
        console.log('   • qHyperCubeDef: ✅ empty qDimensions and qMeasures arrays');

        // Caption properties must match object-properties.js defaults
        expect(json.showTitles).toBe(expectedDefaults.showTitles);
        expect(json.title).toBe(expectedDefaults.title);
        expect(json.subtitle).toBe(expectedDefaults.subtitle);
        expect(json.footnote).toBe(expectedDefaults.footnote);
        console.log('   • Caption properties: ✅ match object-properties defaults');

        // props object must be present with correct debug defaults
        expect(json.props).toBeDefined();
        expect(json.props.debug.enabled).toBe(expectedDefaults.props.debug.enabled);
        expect(json.props.debug.forceState).toBe(expectedDefaults.props.debug.forceState);
        console.log('   • props.debug: ✅ defaults match object-properties');

      } finally {
        // Close the dialog on both pass and fail so teardown starts from a clean state.
        // resetConfiguration() in afterEach also opens the dialog — leaving it open here
        // would cause that to fail.
        await closePropertiesDialog(hub.page, dialogIsOpen);
      }
    });
  });
}

export { extensionUnconfiguredTests };
