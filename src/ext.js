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
        // Property panel sections are defined in object-properties.js
      },
    },
  };
}
