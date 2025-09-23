/**
 * @fileoverview Dynamic props structure analysis utilities.
 *
 * This module provides utilities for analyzing extension property structures
 * and generating appropriate test selectors and validations.
 *
 * @module PropsStructureAnalyzer
 * @since 1.0.0
 */

/**
 * Creates dynamic MUI accordion selector for any property group
 * @param {string} groupName - Name of the property group (e.g., 'props', 'debug')
 * @returns {string} MUI accordion selector
 */
function createMuiAccordionSelector(groupName) {
  return `.MuiAccordionSummary-content.MuiAccordionSummary-contentGutters:has(.MuiTypography-root.MuiTypography-body1:has-text("${groupName}"))`;
}

/**
 * Creates dynamic MUI form control selector for any property
 * @param {string} propertyName - Name of the property (e.g., 'enabled', 'forceState')
 * @param {string} controlType - Type of control ('checkbox', 'textfield', 'select')
 * @returns {string} MUI form control selector
 */
function createMuiFormControlSelector(propertyName, controlType) {
  switch (controlType) {
    case 'checkbox':
      return `.MuiFormControlLabel-root.MuiFormControlLabel-labelPlacementEnd:has(.MuiFormControlLabel-label:has-text("${propertyName}"))`;
    case 'textfield':
      return `.MuiTextField-root:has(.MuiInputLabel-root:has-text("${propertyName}"))`;
    case 'select':
      return `.MuiFormControl-root:has(.MuiInputLabel-root:has-text("${propertyName}"))`;
    default:
      return `[aria-label*="${propertyName}"], [name*="${propertyName}"]`;
  }
}

/**
 * Analyzes the props object structure and returns property metadata
 * @param {Object} propsObject - Props object from configuration defaults
 * @returns {Array} Array of property descriptors with type information
 */
function analyzePropsStructure(propsObject) {
  const properties = [];

  function traverseObject(obj, path = []) {
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = [...path, key];

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Nested object - create accordion group
        properties.push({
          name: key,
          path: currentPath,
          type: 'accordion',
          selector: createMuiAccordionSelector(key),
          hasChildren: true,
        });

        // Recursively analyze children
        traverseObject(value, currentPath);
      } else {
        // Leaf property - determine control type based on value type
        let controlType = 'textfield'; // default
        let selector;

        if (typeof value === 'boolean') {
          controlType = 'checkbox';
          selector = createMuiFormControlSelector(key, 'checkbox');
        } else if (typeof value === 'string') {
          controlType = 'textfield';
          selector = createMuiFormControlSelector(key, 'textfield');
        } else if (typeof value === 'number') {
          controlType = 'textfield';
          selector = createMuiFormControlSelector(key, 'textfield');
        }

        properties.push({
          name: key,
          path: currentPath,
          type: controlType,
          selector: selector,
          expectedValue: value,
          hasChildren: false,
        });
      }
    });
  }

  traverseObject(propsObject);
  return properties;
}

module.exports = {
  createMuiAccordionSelector,
  createMuiFormControlSelector,
  analyzePropsStructure,
};
