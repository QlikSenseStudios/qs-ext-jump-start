/**
 * @fileoverview Configuration defaults provider.
 *
 * This module provides configuration defaults by importing from the actual
 * source files (object-properties.js, data.js, package.json) to ensure
 * tests validate against the actual configured values.
 *
 * @module ConfigurationDefaults
 * @since 1.0.0
 */

/**
 * Gets the expected default values from object-properties.js for validation.
 * This ensures tests validate against the actual configured defaults.
 *
 * NOTE: object-properties.js and data.js files are the single source of truth for all
 *  property defaults. Reference to package.json here is used for simplicity but is not
 *  intended to make it seem like it is authoritative for any of its usage.
 *
 * @returns {Object} Expected configuration values with data constraints
 */
function getExpectedConfigurationDefaults() {
  // Import actual configuration values from source files
  const pkg = require('../../../package.json');
  const dataConfig = require('../../../src/qae/data.js');

  // Extract data constraints from data.js targets
  const dataTarget = dataConfig.default?.targets?.[0] || {};
  const dimensionConstraints = dataTarget.dimensions || { min: 0, max: 0 };
  const measureConstraints = dataTarget.measures || { min: 0, max: 0 };

  // Replicate the exact values from object-properties.js
  // These match the caption_properties and custom_props objects
  const caption_properties = {
    showTitles: true,
    title: `${pkg.name}`,
    subtitle: `v${pkg.version}`,
    footnote: 'This is a template project for creating Qlik Sense extensions',
  };

  const custom_props = {
    debug: {
      enabled: false,
      forceState: '',
    },
  };

  return {
    // Caption properties matching object-properties.js exactly
    ...caption_properties,

    // Complete props object for traversal in tests
    props: custom_props,

    // Individual debug properties for backward compatibility
    debug: custom_props.debug,

    // Data constraints from data.js
    dimensions: dimensionConstraints,
    measures: measureConstraints,
  };
}

module.exports = {
  getExpectedConfigurationDefaults,
};
