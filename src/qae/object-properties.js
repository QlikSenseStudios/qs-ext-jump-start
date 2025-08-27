import pkg from '../../package.json';

/**
 * Qlik Sense extension properties configuration
 * - Controls the property panel (what users can configure)
 * - Defines the hypercube (dimensions/measures) via qHyperCubeDef
 *
 * Where to edit:
 * - Add/remove properties in this file
 * - For data targets and advanced data hooks, see `src/qae/data.js`
 */
const properties = {
  title: `${pkg.name} v${pkg.version}`,
  qHyperCubeDef: {
  // One dimension and optional one measure => width 2 is sufficient
  // Lower qHeight to exercise large-row scenarios in tests more easily
  qInitialDataFetch: [{ qWidth: 2, qHeight: 20 }],
    qDimensions: [],
    qMeasures: [],
    qSuppressZero: false,
    qSuppressMissing: false,
  },

  // Example property sections - uncomment and customize as needed
  /*
  settings: {
    type: 'items',
    label: 'Settings',
    items: {
      showTitle: {
        type: 'boolean',
        label: 'Show Title',
        ref: 'props.showTitle',
        defaultValue: true,
      },
      customColor: {
        type: 'string',
        label: 'Custom Color',
        ref: 'props.customColor',
        defaultValue: '#4477aa',
        expression: 'optional',
      },
    },
  },
  */

  // Add additional property configurations here if needed
  // Example: custom section with toggles, colors, and expressions
};

export default properties;
