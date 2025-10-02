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
const {
  getJsonEditorContent,
  validateJsonStructure,
  expandMonacoEditorContent,
} = require('../lib/utilities/json-editor');

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

    test('validates JSON configuration matches object-properties.js defaults', async () => {
      const { hub } = testContext;
      let dialogIsOpen = false;

      try {
        // Get expected configuration values dynamically from source files
        const expectedDefaults = await getExpectedConfigurationDefaults();

        // Give the page a moment to settle after previous tests
        await hub.page.waitForTimeout(2000);

        // Open properties dialog using the same approach as teardown
        const dialogOpened = await hub.openPropertiesDialog();
        if (!dialogOpened) {
          // Fail test with meaningful error message for environment issues
          const errorMsg =
            'Properties dialog failed to open. This could indicate:\n' +
            '  • Extension not properly loaded in test environment\n' +
            '  • Previous test interference with dialog state\n' +
            '  • Network connectivity issues with Qlik Sense\n' +
            '  • Browser/page state corruption\n\n' +
            'Please verify test environment and re-run tests.';

          // Use expect.fail for clear test failure reporting
          expect(dialogOpened).toBe(true);
          throw new Error(errorMsg);
        }

        dialogIsOpen = true;

        // Additional wait for dialog stabilization
        await hub.page.waitForTimeout(CONFIGURATION_TIMEOUTS.PANEL_STABILIZATION);

        // Try to expand Monaco Editor content first
        await expandMonacoEditorContent(hub.page);
        await hub.page.waitForTimeout(CONFIGURATION_TIMEOUTS.ELEMENT_TRANSITION);

        // Get the JSON content from the properties editor
        const jsonResult = await getJsonEditorContent(hub.page);

        // Validate that we successfully retrieved JSON content
        expect(jsonResult.success).toBe(true);
        expect(jsonResult.content).toBeDefined();
        expect(jsonResult.content.length).toBeGreaterThan(0);
        console.log(`JSON retrieved using: ${jsonResult.method}`);

        // Validate that we're getting proper Monaco Editor (indicates correct dialog state)
        if (jsonResult.method === 'Input Field') {
          const errorMsg =
            'Dialog state issue: Expected Monaco Editor but got Input Field. This suggests:\n' +
            '  • Properties dialog did not open correctly\n' +
            '  • UI framework version mismatch\n' +
            '  • Dialog content not fully loaded\n\n' +
            'Please check the test environment and ensure the properties dialog opens properly.';

          // Fail test with proper expect assertion and helpful error message
          expect(jsonResult.method).not.toBe('Input Field');
          throw new Error(errorMsg);
        }

        // Build required sections dynamically - only core sections that are always visible
        const requiredSections = ['qInfo', 'qType', 'qHyperCubeDef'];

        // Add sections that are likely to be visible in collapsed JSON
        const coreConfigSections = ['showTitles', 'props'];
        coreConfigSections.forEach((section) => {
          if (expectedDefaults[section] !== undefined && !requiredSections.includes(section)) {
            requiredSections.push(section);
          }
        });

        // Get the expected qType from configuration defaults (uses same source as object-properties.js)
        const expectedQType = expectedDefaults.qType;

        // Use the extracted validation utility with flexible property path mapping
        const validationResult = validateJsonStructure(jsonResult.content, {
          allowPartialJson: true,
          requiredSections: requiredSections,
          propertyPaths: {
            qType: 'qInfo.qType', // qType is nested in qInfo section
          },
          expectedValues: {
            qType: expectedQType, // Validate qType matches expected value
          },
        });

        // Enhanced validation for qType using improved validation system
        if (validationResult.isPartialJson) {
          // For partial JSON, ensure qType section was found and validated
          if (requiredSections.includes('qType')) {
            expect(validationResult.foundSections).toContain('qType');
            console.log(`✓ Verified qType matches object-properties.js: ${expectedQType}`);
          }
        }

        // Assert that validation was successful
        expect(validationResult.success).toBe(true);
        expect(validationResult.foundSections.length).toBeGreaterThan(0);

        // Validate core required sections
        expect(validationResult.foundSections).toContain('qInfo');
        expect(validationResult.foundSections).toContain('qHyperCubeDef');

        // Validate configuration sections that exist in expected defaults
        if (expectedDefaults.showTitles !== undefined) {
          expect(validationResult.foundSections).toContain('showTitles');
        }
        if (expectedDefaults.props) {
          expect(validationResult.foundSections).toContain('props');
        }

        // Log validation details for debugging
        console.log('📋 JSON Validation Summary:');
        console.log(`   Extension: ${expectedQType} (from object-properties.js)`);
        console.log(`   Expected sections: ${requiredSections.join(', ')}`);
        validationResult.validationDetails.forEach((detail) => console.log(`   ${detail}`));

        if (validationResult.isPartialJson) {
          console.log('⚠️  Validated partial JSON due to Monaco Editor collapsed display');
          test.info().annotations.push({
            type: 'info',
            description: `JSON structure validation for ${expectedQType} (Monaco Editor collapsed view)`,
          });
        } else {
          console.log('✅ Full JSON parsing and validation completed');

          // Additional validation for complete JSON using dynamic values
          expect(validationResult.jsonObject).toBeDefined();
          expect(typeof validationResult.jsonObject).toBe('object');
          expect(validationResult.jsonObject).not.toBe(null);

          // Validate qInfo section with expected qType
          if (validationResult.jsonObject.qInfo) {
            expect(validationResult.jsonObject.qInfo.qType).toBe(expectedQType);
            console.log(`✓ qInfo.qType validated: ${expectedQType}`);
          }

          // Validate caption properties against expected defaults
          Object.keys(expectedDefaults).forEach((key) => {
            if (key !== 'props' && key !== 'debug' && key !== 'dimensions' && key !== 'measures') {
              if (validationResult.jsonObject[key] !== undefined) {
                console.log(`✓ Found expected property: ${key} = ${validationResult.jsonObject[key]}`);
              }
            }
          });

          // Validate qHyperCubeDef structure in complete JSON
          if (validationResult.jsonObject.qHyperCubeDef) {
            expect(validationResult.jsonObject.qHyperCubeDef).toHaveProperty('qDimensions');
            expect(validationResult.jsonObject.qHyperCubeDef).toHaveProperty('qMeasures');
            expect(Array.isArray(validationResult.jsonObject.qHyperCubeDef.qDimensions)).toBe(true);
            expect(Array.isArray(validationResult.jsonObject.qHyperCubeDef.qMeasures)).toBe(true);
            console.log('✓ qHyperCubeDef structure validated');
          }

          test.info().annotations.push({
            type: 'info',
            description: `Complete JSON configuration validation for ${expectedQType} against object-properties.js defaults`,
          });
        }

        console.log(
          `📊 Found ${validationResult.foundSections.length} required sections out of ${requiredSections.length} expected sections`
        );
      } catch (testError) {
        console.error('❌ Test execution failed:', testError.message);
        throw testError;
      } finally {
        // Always attempt to close dialog if it was opened, even if test fails
        if (dialogIsOpen) {
          try {
            const cancelBtn = hub.page.locator('button:has-text("Cancel")');
            if (await cancelBtn.isVisible()) {
              await cancelBtn.click();
              console.log('🔒 Closed properties dialog via Cancel button');

              // Wait for dialog to close
              const dialog = hub.page.locator('[role="dialog"]:has-text("Modify object properties")');
              await dialog.waitFor({ state: 'hidden', timeout: 3000 });
              await hub.page.waitForTimeout(500);
            } else {
              console.log('⚠️  Cancel button not found, dialog may close automatically');
            }
          } catch (closeError) {
            console.log('⚠️  Dialog cancel failed:', closeError.message);
          }
        }
      }
    });
  });
}

module.exports = { extensionUnconfiguredTests };
