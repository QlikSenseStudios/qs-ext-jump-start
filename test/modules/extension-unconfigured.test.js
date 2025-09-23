/**
 * @fileoverview Extension unconfigured state test module.
 *
 * Tests the extension in its unconfigured state, default behavior,
 * configuration panel options, and JSON structure when no data is configured.
 */

const { test, expect } = require('@playwright/test');
const { IDENTIFIERS, TIMEOUTS } = require('../lib/core/identifiers');
const { CONFIGURATION_IDENTIFIERS, CONFIGURATION_TIMEOUTS } = require('../lib/core/configuration-identifiers');
const { getExpectedConfigurationDefaults } = require('../lib/utilities/configuration-defaults');
const { analyzePropsStructure } = require('../lib/utilities/props-structure-analyzer');

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
    test('validates incomplete visualization display when unconfigured', async () => {
      const { page } = testContext;

      // Validate extension shows incomplete visualization when no configuration is provided
      const incompleteTitle = page.locator(IDENTIFIERS.INCOMPLETE_VISUALIZATION);
      await expect(incompleteTitle).toBeVisible({ timeout: TIMEOUTS.NETWORK });

      const titleText = await incompleteTitle.textContent();
      expect(titleText).toBe('Incomplete visualization');
      console.log('   • Incomplete visualization message: ✅ Displayed correctly');

      test.info().annotations.push({
        type: 'info',
        description: 'Extension shows incomplete visualization when unconfigured',
      });
    });

    test('validates configuration panel options for unconfigured extension', async () => {
      const { hub } = testContext;

      console.log('🧪 Testing Configuration Form Elements:');

      // Dynamic validation against object-properties.js defaults
      const expectedDefaults = getExpectedConfigurationDefaults();

      // Test data configuration buttons
      const addDimensionBtn = hub.page.locator(CONFIGURATION_IDENTIFIERS.ADD_DIMENSION_BUTTON);
      await expect(addDimensionBtn).toBeVisible({ timeout: TIMEOUTS.STANDARD });

      const isDimensionBtnEnabled = await addDimensionBtn.isEnabled();
      expect(isDimensionBtnEnabled).toBe(true);
      console.log(
        `   • Add Dimension button: ✅ Available and enabled (min: ${expectedDefaults.dimensions.min} required, max: ${expectedDefaults.dimensions.max} allowed)`
      );

      const addMeasureBtn = hub.page.locator(CONFIGURATION_IDENTIFIERS.ADD_MEASURE_BUTTON);
      await expect(addMeasureBtn).toBeVisible({ timeout: TIMEOUTS.STANDARD });

      const isMeasureBtnEnabled = await addMeasureBtn.isEnabled();
      expect(isMeasureBtnEnabled).toBe(true);
      console.log(
        `   • Add Measure button: ✅ Available and enabled (min: ${expectedDefaults.measures.min} required, max: ${expectedDefaults.measures.max} allowed)`
      );

      // Test caption properties with dynamic validation
      const showTitlesCheckbox = hub.page.locator(CONFIGURATION_IDENTIFIERS.SHOW_TITLES_CHECKBOX);
      await expect(showTitlesCheckbox).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      const isChecked = await showTitlesCheckbox.isChecked();
      expect(isChecked).toBe(expectedDefaults.showTitles);
      console.log(
        `   • Show Titles checkbox: ✅ Available and matches default configuration (${isChecked ? 'checked' : 'unchecked'})`
      );

      const titleInput = hub.page.getByRole('textbox', { name: 'title', exact: true });
      await expect(titleInput).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      const titleValue = await titleInput.inputValue();
      expect(titleValue).toBe(expectedDefaults.title);
      console.log(`   • Title input field: ✅ Available and matches default configuration ("${titleValue}")`);

      const subtitleInput = hub.page.getByRole('textbox', { name: 'subtitle' });
      await expect(subtitleInput).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      const subtitleValue = await subtitleInput.inputValue();
      expect(subtitleValue).toBe(expectedDefaults.subtitle);
      console.log(`   • Subtitle input field: ✅ Available and matches default configuration ("${subtitleValue}")`);

      const footnoteInput = hub.page.getByRole('textbox', { name: 'footnote' });
      await expect(footnoteInput).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      const footnoteValue = await footnoteInput.inputValue();
      expect(footnoteValue).toBe(expectedDefaults.footnote);
      console.log(`   • Footnote input field: ✅ Available and matches default configuration ("${footnoteValue}")`);

      test.info().annotations.push({
        type: 'info',
        description: 'Configuration panel caption properties validated against object-properties.js defaults',
      });
    });

    test('validates custom properties configuration options', async () => {
      const { hub } = testContext;

      console.log('🎯 Testing Custom Properties Configuration:');
      const expectedDefaults = getExpectedConfigurationDefaults();

      /**
       * MUI DOM Navigation Strategy for Custom Properties Testing
       *
       * Challenge: Nebula hub uses Material-UI components with auto-generated CSS classes
       * Solution: Use property cache checkbox as stable anchor point, then traverse DOM tree
       *
       * Process:
       * 1. Locate property cache checkbox (stable identifier)
       * 2. Traverse up DOM ancestors to find configuration container
       * 3. Use MUI-specific selectors for accordion and form controls
       * 4. Dynamically validate against object-properties.js structure
       */

      // Use property cache checkbox as anchor - validate environment first
      const propertyCacheCheckbox = hub.page.locator(IDENTIFIERS.PROPERTY_CACHE_CHECKBOX);

      // Validate that the configuration environment is accessible
      await expect(propertyCacheCheckbox).toBeVisible({ timeout: CONFIGURATION_TIMEOUTS.FORM_ELEMENT });
      console.log('   • Environment validation: ✅ Property cache checkbox confirmed accessible');

      // Find parent container with multiple form elements
      let configContainer = null;
      for (let i = 1; i <= 4; i++) {
        const testContainer = propertyCacheCheckbox.locator(`xpath=./ancestor::div[${i}]`);
        const formElementCount = await testContainer.locator('input, select, textarea').count();
        console.log(`   • Container level ${i}: Found ${formElementCount} form elements`);
        if (formElementCount > 1 && !configContainer) {
          configContainer = testContainer;
          break;
        }
      }

      // Assert that configuration container is found - critical for all custom properties
      expect(configContainer).toBeTruthy();
      console.log(`   • Configuration container: ✅ Found with multiple form elements`);

      // Analyze the props structure dynamically from object-properties.js
      const propsStructure = analyzePropsStructure(expectedDefaults.props);
      console.log(`   • Props structure analysis: Found ${propsStructure.length} properties to validate`);

      // Skip validation if props structure is empty
      if (propsStructure.length === 0) {
        console.log('   • Props validation: ⚠️ No properties found - extension may have empty props object');
        test.info().annotations.push({
          type: 'info',
          description: 'Extension has no custom properties to validate',
        });
        return;
      }

      // Find the first top-level accordion property dynamically
      const topLevelAccordions = propsStructure.filter((prop) => prop.type === 'accordion' && prop.path.length === 1);

      if (topLevelAccordions.length === 0) {
        console.log('   • Props validation: ⚠️ No top-level accordion properties found');
        test.info().annotations.push({
          type: 'info',
          description: 'No accordion properties found in props structure',
        });
        return;
      }

      console.log(
        `   • Found ${topLevelAccordions.length} top-level accordion(s): ${topLevelAccordions.map((p) => p.name).join(', ')}`
      );

      // Look for props accordion with framework identifier
      const propsAccordion = configContainer.locator(CONFIGURATION_IDENTIFIERS.MUI_PROPS_ACCORDION).first();
      const propsAccordionVisible = await propsAccordion.isVisible().catch(() => false);

      // Assert that props accordion is found - critical for custom properties access
      expect(propsAccordionVisible).toBe(true);
      console.log('   • Props accordion: ✅ Found MUI Accordion with exact structure');

      // Expand props accordion using framework identifier
      const accordionButton = propsAccordion.locator(CONFIGURATION_IDENTIFIERS.MUI_ACCORDION_BUTTON).first();
      const isExpanded = await accordionButton.getAttribute('aria-expanded').catch(() => 'false');
      if (isExpanded === 'false') {
        await accordionButton.click();
        await hub.page.waitForTimeout(CONFIGURATION_TIMEOUTS.ELEMENT_TRANSITION);
      }

      // Dynamically validate each accordion group and its properties
      const accordionGroups = propsStructure.filter((prop) => prop.type === 'accordion');
      console.log(`   • Found ${accordionGroups.length} accordion groups to validate`);

      for (const accordionGroup of accordionGroups) {
        console.log(`   • Validating accordion group: ${accordionGroup.name}`);

        // Look for the accordion using dynamic selector
        const accordion = configContainer.locator(accordionGroup.selector).first();
        const accordionVisible = await accordion.isVisible().catch(() => false);

        // Assert that accordion is found
        expect(accordionVisible).toBe(true);
        console.log(`   • ${accordionGroup.name} accordion: ✅ Found`);

        // Expand accordion
        const groupAccordionButton = accordion.locator(CONFIGURATION_IDENTIFIERS.MUI_ACCORDION_BUTTON).first();
        const groupIsExpanded = await groupAccordionButton.getAttribute('aria-expanded').catch(() => 'false');
        if (groupIsExpanded === 'false') {
          await groupAccordionButton.click();
          await hub.page.waitForTimeout(CONFIGURATION_TIMEOUTS.ELEMENT_TRANSITION);
        }

        // Find all properties within this accordion group
        const groupProperties = propsStructure.filter(
          (prop) =>
            !prop.hasChildren &&
            prop.path.length === accordionGroup.path.length + 1 &&
            prop.path.slice(0, -1).join('.') === accordionGroup.path.join('.')
        );

        console.log(`   • Validating ${groupProperties.length} properties in ${accordionGroup.name} group`);

        // Validate each property in the group
        for (const property of groupProperties) {
          const element = configContainer.locator(property.selector).first();
          const elementVisible = await element.isVisible().catch(() => false);

          // Assert that property element is found
          expect(elementVisible).toBe(true);
          console.log(`   • ${property.name} (${property.type}): ✅ Found`);

          // Get the actual form control and validate its value
          let actualValue;
          if (property.type === 'checkbox') {
            const checkbox = element.locator(CONFIGURATION_IDENTIFIERS.MUI_CHECKBOX_INPUT).first();
            actualValue = await checkbox.isChecked();
          } else if (property.type === 'textfield') {
            const textInput = element.locator(CONFIGURATION_IDENTIFIERS.MUI_TEXT_INPUT).first();
            actualValue = await textInput.inputValue();
          }

          // Validate against expected value from object-properties.js
          expect(actualValue).toBe(property.expectedValue);
          const displayValue = property.type === 'textfield' ? `"${actualValue}"` : actualValue;
          console.log(`   • ${property.name}: ✅ Validated (${displayValue})`);
        }
      }

      console.log('   • Custom Properties: ✅ All props structure validated dynamically with exact MUI structure');

      test.info().annotations.push({
        type: 'info',
        description: 'Custom properties validation using exact MUI DOM structure patterns',
      });
    });
  });
}

module.exports = { extensionUnconfiguredTests };
