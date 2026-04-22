/**
 * @fileoverview Configuration defaults provider.
 *
 * Derives expected test values directly from the extension source files so that
 * tests always validate against the actual configured defaults. Changing
 * object-properties.js or data.js will immediately surface in test failures if
 * the Nebula Hub panel does not reflect the new values.
 *
 * @module ConfigurationDefaults
 * @since 1.0.0
 */

import objectProperties from '../../../src/qae/object-properties.js';
import dataConfig from '../../../src/qae/data.js';

/**
 * Gets the expected default values from the extension source files for validation.
 *
 * @returns {Object} Expected configuration values with data constraints and qType
 */
function getExpectedConfigurationDefaults() {
  const dataTarget = dataConfig?.targets?.[0] || {};

  return {
    // Caption properties — sourced directly from object-properties.js
    showTitles: objectProperties.showTitles,
    title: objectProperties.title,
    subtitle: objectProperties.subtitle,
    footnote: objectProperties.footnote,

    // Complete props object for traversal in tests
    props: objectProperties.props,

    // Data constraints from data.js
    dimensions: dataTarget.dimensions || { min: 0, max: 0 },
    measures: dataTarget.measures || { min: 0, max: 0 },

    // qType matches pkg.name — Nebula sets qInfo.qType to the extension name at runtime
    qType: objectProperties.title,
  };
}

export {
  getExpectedConfigurationDefaults,
};
