import pkg from '../../package.json';

/**
 * Qlik Sense extension properties configuration
 * Defines the property panel structure and hypercube setup
 */
const properties = {
  title: `${pkg.name} v${pkg.version}`,
  qHyperCubeDef: {
    qInitialDataFetch: [{ qWidth: 2, qHeight: 50 }],
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
};

export default properties;
