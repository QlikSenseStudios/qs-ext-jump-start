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

    // Additional extension configuration
    definition: {
      type: 'items',
      component: 'accordion',
      items: {
        // Limit to exactly 1 dimension (required) and 0-1 measure (optional)
        dimensions: {
          uses: 'dimensions',
          min: 1,
          max: 1,
        },
        measures: {
          uses: 'measures',
          min: 0,
          max: 1,
        },
        sorting: {
          uses: 'sorting',
        },
        addons: {
          uses: 'addons',
        },
      },
    },
  };
}
