// Import debug utilities to avoid duplication
import { isDebugEnabled } from './utils';

/**
 * Development utilities section - conditionally available.
 * Shows in development environments (localhost, dev URLs, or when debug flag is set).
 * This section is dynamically included based on runtime environment detection.
 */
function getDevelopmentUtilitiesSection() {
  // Use existing isDebugEnabled utility for consistent debug detection
  // Note: We can't pass layout here since this is called during extension definition,
  // but isDebugEnabled will fall back to URL and environment detection
  if (!isDebugEnabled()) {
    return {}; // Not in debug/development mode
  }

  return {
    debug: {
      component: 'expandable-items',
      label: 'Development Utilities',
      items: {
        debugging: {
          label: 'Debugging',
          type: 'items',
          items: {
            enable: {
              type: 'boolean',
              label: 'Enable Debugging',
              // path to value on layout object
              ref: 'props.debug.enabled',
              defaultValue: false,
            },
            forceState: {
              label: 'Force State (Testing)',
              component: 'dropdown',
              // path to value on layout object
              ref: 'props.debug.forceState',
              type: 'string',
              defaultValue: '',
              options: [
                { value: '', label: 'Normal Operation' },
                { value: 'invalid-config', label: 'Invalid Configuration' },
                { value: 'dimension-error', label: 'Dimension Error' },
                { value: 'measure-error', label: 'Measure Error' },
                { value: 'data-suppressed', label: 'Data Suppressed' },
                { value: 'no-data', label: 'No Data Available' },
                { value: 'empty-data', label: 'Empty Data Values' },
                { value: 'hypercube-error', label: 'Hypercube Error' },
              ],
              show: (data) => data.props?.debug?.enabled,
            },
          },
        },
      },
    },
  };
}

/**
 * Extension configuration for Qlik Sense capabilities
 * @param {object} galaxy - Galaxy object containing environment settings
 * @returns {object} Extension configuration
 */
export default function ext(/* galaxy */) {
  return {
    support: {
      snapshot: false, // Enable if the extension supports snapshots in Sense
      export: true, // Allow data export
      sharing: false, // Enable for collaborative features
      exportData: true,
      viewData: true,
    },

    // Property panel definition for Qlik Sense - built from object-properties.js (no debug section)
    definition: {
      type: 'items',
      component: 'accordion',
      items: {
        data: {
          uses: 'data',
        },
        sorting: {
          uses: 'sorting',
        },
        addons: {
          uses: 'addons',
        },
        settings: {
          uses: 'settings',
          items: {},
        },
        ...getDevelopmentUtilitiesSection(),
      },
    },
  };
}
