/**
 * @fileoverview Configuration panel identifiers for Qlik Sense extension testing.
 *
 * This module provides specific selectors for configuration panel form elements
 * that correspond to properties defined in object-properties.js.
 *
 * @module ConfigurationIdentifiers
 * @since 1.0.0
 */

/**
 * Configuration panel form element selectors.
 * These identifiers map to the properties defined in object-properties.js
 * and enable manipulation of configuration settings during tests.
 *
 * @readonly
 * @enum {string}
 */
const CONFIGURATION_IDENTIFIERS = Object.freeze({
  /**
   * Show Titles checkbox - controls showTitles property (boolean)
   * Maps to: object-properties.js -> showTitles: true
   */
  SHOW_TITLES_CHECKBOX: 'label:has-text("ShowTitles") input[type="checkbox"]',

  /**
   * Add Dimension button - adds dimensions to qDimensions array
   * Maps to: data.js -> dimensions: { min: 1, max: 1 }
   */
  ADD_DIMENSION_BUTTON: 'button:has-text("Add dimension")',

  /**
   * Add Measure button - adds measures to qMeasures array
   * Maps to: data.js -> measures: { min: 0, max: 1 }
   */
  ADD_MEASURE_BUTTON: 'button:has-text("Add measure")',

  /**
   * MUI Props Accordion - contains custom properties configuration
   * Maps to: object-properties.js -> props: custom_props
   */
  MUI_PROPS_ACCORDION:
    '.MuiAccordionSummary-content.MuiAccordionSummary-contentGutters:has(.MuiTypography-root.MuiTypography-body1:has-text("props"))',

  /**
   * MUI Accordion Button - role="button" ancestor for expanding accordions
   */
  MUI_ACCORDION_BUTTON: 'xpath=./ancestor::*[@role="button"]',

  /**
   * MUI Checkbox Input - specific input element within FormControlLabel
   */
  MUI_CHECKBOX_INPUT: 'input.PrivateSwitchBase-input[type="checkbox"][data-indeterminate="false"]',

  /**
   * MUI Text Input - specific input element within TextField
   */
  MUI_TEXT_INPUT: '.MuiInputBase-input.MuiInput-input',

  /**
   * Configuration panel container - main panel containing all form elements
   * Use this to scope searches within the configuration area
   */
  CONFIGURATION_PANEL: '.pp-content, [class*="pp-"], .property-panel',
});

/**
 * Configuration panel timeout values for form interactions.
 * These are specific to configuration panel operations.
 *
 * @readonly
 * @enum {number}
 */
const CONFIGURATION_TIMEOUTS = Object.freeze({
  /** Form element visibility timeout */
  FORM_ELEMENT: 3000,

  /** Input field interaction timeout */
  INPUT_INTERACTION: 2000,

  /** Button click response timeout */
  BUTTON_CLICK: 1000,

  /** Panel stabilization timeout after opening */
  PANEL_STABILIZATION: 2000,

  /** Element transition timeout for animations */
  ELEMENT_TRANSITION: 500,
});

/**
 * Helper function to create configuration-specific locators.
 * Provides consistent scoping within the configuration panel.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} selector - Element selector within configuration panel
 * @returns {import('@playwright/test').Locator} Scoped locator
 */
function createConfigurationLocator(page, selector) {
  return page.locator(CONFIGURATION_IDENTIFIERS.CONFIGURATION_PANEL).locator(selector);
}

module.exports = {
  CONFIGURATION_IDENTIFIERS,
  CONFIGURATION_TIMEOUTS,
  createConfigurationLocator,
};
