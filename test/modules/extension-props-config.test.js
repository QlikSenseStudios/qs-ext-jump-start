/**
 * @fileoverview Extension props configuration round-trip test module.
 *
 * Validates that custom props values set via the Nebula Hub config panel are
 * reflected in the Monaco JSON editor, and that values set via the Monaco JSON
 * editor are reflected in the config panel UI. Both directions confirm the
 * Nebula Hub property binding is working correctly end-to-end.
 *
 * Tests use the debug group from object-properties.js (props.debug.enabled,
 * props.debug.forceState) as the target since it is the only custom props group
 * in the base template. The pattern generalises to any props group added later.
 *
 * Each test starts from a clean unconfigured state (asserted by assertCleanExtensionState)
 * and resets to clean state in afterEach via hub.resetConfiguration().
 */

import { test, expect } from '@playwright/test';
import { TIMEOUTS } from '../lib/core/identifiers.js';
import { CONFIGURATION_IDENTIFIERS, CONFIGURATION_TIMEOUTS } from '../lib/core/configuration-identifiers.js';
import { assertCleanExtensionState, closePropertiesDialog } from '../lib/utilities/test-setup.js';
import { getExpectedConfigurationDefaults } from '../lib/utilities/configuration-defaults.js';
import { createMuiAccordionSelector, createMuiFormControlSelector } from '../lib/utilities/props-structure-analyzer.js';
import {
  getJsonEditorContent,
  validateJsonStructure,
  expandMonacoEditorContent,
} from '../lib/utilities/json-editor.js';

// Selectors for the debug accordion and its leaf controls — derived the same way
// extension-unconfigured.test.js derives them via analyzePropsStructure()
const DEBUG_ACCORDION_SELECTOR = createMuiAccordionSelector('debug');
const ENABLED_CONTROL_SELECTOR = createMuiFormControlSelector('enabled', 'checkbox');
const FORCE_STATE_CONTROL_SELECTOR = createMuiFormControlSelector('forceState', 'textfield');

/**
 * Expands the props accordion and the debug sub-accordion in the Nebula Hub
 * config panel so nested controls are visible and interactable.
 *
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} hub
 */
async function expandDebugAccordion(hub) {
  // Expand top-level props accordion
  const propsAccordionBtn = hub.page
    .locator(CONFIGURATION_IDENTIFIERS.MUI_PROPS_ACCORDION)
    .locator(CONFIGURATION_IDENTIFIERS.MUI_ACCORDION_BUTTON)
    .first();
  const propsExpanded = await propsAccordionBtn.getAttribute('aria-expanded').catch(() => 'false');
  if (propsExpanded !== 'true') {
    await propsAccordionBtn.click();
    console.log('   • props accordion: expanded');
  } else {
    console.log('   • props accordion: already expanded');
  }

  // Expand nested debug accordion
  const debugAccordion = hub.page.locator(DEBUG_ACCORDION_SELECTOR).first();
  await expect(
    debugAccordion,
    '"debug" accordion not visible after expanding props — selector may have drifted or props structure changed.'
  ).toBeVisible({ timeout: TIMEOUTS.STANDARD });

  const debugAccordionBtn = debugAccordion
    .locator(CONFIGURATION_IDENTIFIERS.MUI_ACCORDION_BUTTON)
    .first();
  const debugExpanded = await debugAccordionBtn.getAttribute('aria-expanded').catch(() => 'false');
  if (debugExpanded !== 'true') {
    await debugAccordionBtn.click();
    console.log('   • debug accordion: expanded');
  } else {
    console.log('   • debug accordion: already expanded');
  }
}

/**
 * Extension props configuration round-trip tests.
 *
 * @param {Object} testContext - Test context with page, hub, and utilities
 * @param {import('@playwright/test').Page} testContext.page - Playwright page object
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} testContext.hub - Nebula Hub page object
 */
function extensionPropsConfigTests(testContext) {
  test.describe('Extension Props Configuration Round-Trip', () => {
    test.beforeEach(async () => {
      await assertCleanExtensionState(testContext);
    });

    test('config panel → JSON: enabling debug.enabled reflects in Monaco editor', async () => {
      const { hub } = testContext;

      // The config panel (left sidebar) is always visible — expand to the debug controls
      // without opening the Monaco dialog. The dialog is only needed to read back JSON.
      await expandDebugAccordion(hub);

      // Locate the enabled checkbox by its label text — same strategy as extension-unconfigured.test.js
      const enabledControl = hub.page.locator(ENABLED_CONTROL_SELECTOR).first();
      await expect(
        enabledControl,
        '"enabled" control not visible after expanding debug accordion — selector may have drifted.'
      ).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });

      const enabledCheckbox = hub.page
        .locator(`${ENABLED_CONTROL_SELECTOR} ${CONFIGURATION_IDENTIFIERS.MUI_CHECKBOX_INPUT}`)
        .first();

      // Confirm default is unchecked before interacting
      await expect(enabledCheckbox).not.toBeChecked();
      console.log('   • debug.enabled: confirmed default is unchecked');

      // Toggle on via the control label (more reliable than clicking the hidden input directly)
      await enabledControl.click();
      await expect(enabledCheckbox).toBeChecked({ timeout: CONFIGURATION_TIMEOUTS.INPUT_INTERACTION });
      console.log('   • debug.enabled: toggled to checked');

      // Read back via Monaco JSON editor to confirm the value persisted in the engine
      let dialogIsOpen = false;
      try {
        const dialogOpened = await hub.openPropertiesDialog();
        expect(
          dialogOpened,
          'Properties dialog failed to open after toggling debug.enabled — hub may be in an unexpected state.'
        ).toBe(true);
        dialogIsOpen = true;
        console.log('   • Properties dialog: opened');

        await expect(hub.page.locator('.monaco-editor')).toBeVisible({ timeout: TIMEOUTS.STANDARD });
        await expandMonacoEditorContent(hub.page);

        const jsonResult = await getJsonEditorContent(hub.page);
        expect(jsonResult.success, `Failed to read JSON — strategy: ${jsonResult.method ?? 'none'}`).toBe(true);
        console.log(`   • JSON read via: ${jsonResult.method}`);

        const validationResult = validateJsonStructure(jsonResult.content, {
          allowPartialJson: false,
          requiredSections: ['props'],
        });
        expect(
          validationResult.isPartialJson,
          'Monaco editor returned collapsed JSON — expandMonacoEditorContent did not fully render all lines.'
        ).toBe(false);
        expect(validationResult.success, `Missing sections: ${validationResult.missingSections.join(', ')}`).toBe(true);

        const json = validationResult.jsonObject;
        console.log(`   • props.debug.enabled in JSON: ${json.props?.debug?.enabled}`);
        expect(
          json.props.debug.enabled,
          'props.debug.enabled is false in JSON after toggling checkbox on — config panel change did not persist to engine.'
        ).toBe(true);
        console.log('   • props.debug.enabled: ✅ true in Monaco JSON (config panel → JSON confirmed)');
      } finally {
        await closePropertiesDialog(hub.page, dialogIsOpen);
      }
    });

    test('config panel → JSON: setting debug.forceState reflects in Monaco editor', async () => {
      const { hub } = testContext;
      const testValue = 'complete';

      // The config panel (left sidebar) is always visible — expand to the debug controls directly
      await expandDebugAccordion(hub);

      // Locate the forceState text input by its label text
      const forceStateControl = hub.page.locator(FORCE_STATE_CONTROL_SELECTOR).first();
      await expect(
        forceStateControl,
        '"forceState" control not visible after expanding debug accordion — selector may have drifted.'
      ).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });

      const forceStateInput = hub.page
        .locator(`${FORCE_STATE_CONTROL_SELECTOR} ${CONFIGURATION_IDENTIFIERS.MUI_TEXT_INPUT}`)
        .first();

      // Confirm default is empty before interacting
      const currentValue = await forceStateInput.inputValue();
      console.log(`   • debug.forceState: current value is "${currentValue}"`);
      await expect(forceStateInput).toHaveValue('');

      // Set a non-default value
      await forceStateInput.fill(testValue);
      // Trigger change event by tabbing out — MUI text fields may not commit on fill alone
      await forceStateInput.press('Tab');
      await expect(forceStateInput).toHaveValue(testValue, { timeout: CONFIGURATION_TIMEOUTS.INPUT_INTERACTION });
      console.log(`   • debug.forceState: set to "${testValue}"`);

      // Read back via Monaco JSON editor
      let dialogIsOpen = false;
      try {
        const dialogOpened = await hub.openPropertiesDialog();
        expect(
          dialogOpened,
          'Properties dialog failed to open after setting debug.forceState — hub may be in an unexpected state.'
        ).toBe(true);
        dialogIsOpen = true;
        console.log('   • Properties dialog: opened');

        await expect(hub.page.locator('.monaco-editor')).toBeVisible({ timeout: TIMEOUTS.STANDARD });
        await expandMonacoEditorContent(hub.page);

        const jsonResult = await getJsonEditorContent(hub.page);
        expect(jsonResult.success, `Failed to read JSON — strategy: ${jsonResult.method ?? 'none'}`).toBe(true);
        console.log(`   • JSON read via: ${jsonResult.method}`);

        const validationResult = validateJsonStructure(jsonResult.content, {
          allowPartialJson: false,
          requiredSections: ['props'],
        });
        expect(validationResult.isPartialJson, 'Monaco editor returned collapsed JSON.').toBe(false);
        expect(validationResult.success, `Missing sections: ${validationResult.missingSections.join(', ')}`).toBe(true);

        const json = validationResult.jsonObject;
        console.log(`   • props.debug.forceState in JSON: "${json.props?.debug?.forceState}"`);
        expect(
          json.props.debug.forceState,
          `props.debug.forceState is "${json.props.debug.forceState}" in JSON — expected "${testValue}". Config panel change did not persist to engine.`
        ).toBe(testValue);
        console.log(`   • props.debug.forceState: ✅ "${testValue}" in Monaco JSON (config panel → JSON confirmed)`);
      } finally {
        await closePropertiesDialog(hub.page, dialogIsOpen);
      }
    });

    test('JSON editor → config panel: patching debug.enabled reflects in config panel UI', async () => {
      const { hub } = testContext;
      const expectedDefaults = getExpectedConfigurationDefaults();

      // Patch props.debug.enabled to true via the JSON editor
      console.log('   • Patching props.debug.enabled to true via JSON editor...');
      const patched = await hub.patchObjectProperties({
        props: { debug: { ...expectedDefaults.props.debug, enabled: true } },
      });
      expect(
        patched,
        'patchObjectProperties failed — could not read or set object properties via Monaco editor.'
      ).toBe(true);
      console.log('   • patchObjectProperties: ✅ confirmed');

      // Wait for the engine to settle and the config panel to re-render with new values
      await hub.page.waitForTimeout(800);
      console.log('   • Engine settle wait: complete');

      // Expand down to the debug controls and confirm the checkbox reflects the patched value
      await expandDebugAccordion(hub);

      const enabledControl = hub.page.locator(ENABLED_CONTROL_SELECTOR).first();
      await expect(
        enabledControl,
        '"enabled" control not visible in debug accordion after patching — selector may have drifted.'
      ).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      console.log('   • enabled control: visible');

      const enabledCheckbox = hub.page
        .locator(`${ENABLED_CONTROL_SELECTOR} ${CONFIGURATION_IDENTIFIERS.MUI_CHECKBOX_INPUT}`)
        .first();
      const isChecked = await enabledCheckbox.isChecked().catch(() => 'error');
      console.log(`   • debug.enabled checkbox state: ${isChecked}`);

      await expect(
        enabledCheckbox,
        'props.debug.enabled checkbox is unchecked after patching true via JSON editor — JSON editor change did not reflect in config panel.'
      ).toBeChecked({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      console.log('   • debug.enabled checkbox: ✅ checked (JSON editor → config panel confirmed)');
    });

    test('JSON editor → config panel: patching debug.forceState reflects in config panel UI', async () => {
      const { hub } = testContext;
      const expectedDefaults = getExpectedConfigurationDefaults();
      const testValue = 'incomplete';

      // Patch props.debug.forceState via the JSON editor
      console.log(`   • Patching props.debug.forceState to "${testValue}" via JSON editor...`);
      const patched = await hub.patchObjectProperties({
        props: { debug: { ...expectedDefaults.props.debug, forceState: testValue } },
      });
      expect(
        patched,
        'patchObjectProperties failed — could not read or set object properties via Monaco editor.'
      ).toBe(true);
      console.log('   • patchObjectProperties: ✅ confirmed');

      await hub.page.waitForTimeout(800);
      console.log('   • Engine settle wait: complete');

      await expandDebugAccordion(hub);

      const forceStateControl = hub.page.locator(FORCE_STATE_CONTROL_SELECTOR).first();
      await expect(
        forceStateControl,
        '"forceState" control not visible in debug accordion after patching — selector may have drifted.'
      ).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      console.log('   • forceState control: visible');

      const forceStateInput = hub.page
        .locator(`${FORCE_STATE_CONTROL_SELECTOR} ${CONFIGURATION_IDENTIFIERS.MUI_TEXT_INPUT}`)
        .first();
      const currentValue = await forceStateInput.inputValue().catch(() => 'error reading value');
      console.log(`   • debug.forceState input current value: "${currentValue}"`);

      await expect(
        forceStateInput,
        `props.debug.forceState input does not show "${testValue}" after patching via JSON editor — JSON editor change did not reflect in config panel.`
      ).toHaveValue(testValue, { timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      console.log(`   • debug.forceState input: ✅ "${testValue}" (JSON editor → config panel confirmed)`);
    });
  });
}

export { extensionPropsConfigTests };
