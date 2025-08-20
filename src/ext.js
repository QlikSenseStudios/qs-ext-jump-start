/**
 * Extension configuration for Qlik Sense capabilities
 * @param {object} galaxy - Galaxy object containing environment settings
 * @returns {object} Extension configuration
 */
export default function ext(/* galaxy */) {
  return {
    support: {
      snapshot: false, // Set to true if extension supports snapshots
      export: true,    // Allow data export
      sharing: false,  // Set to true for collaborative features
      exportData: true,
      viewData: true,
    },
    
    // Additional extension configuration
    definition: {
      type: 'items',
      component: 'accordion',
      items: {
        // Property panel sections will be defined in object-properties.js
      },
    },
  };
}
