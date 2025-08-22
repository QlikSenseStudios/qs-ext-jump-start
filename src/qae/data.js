/**
 * Data source configuration for the Qlik Sense extension
 *
 * What this does:
 * - Defines how data is fetched and processed from the Qlik engine
 * - Works together with `qHyperCubeDef` in `object-properties.js`
 *
 * Where to edit:
 * - Add targets under `targets` to map to engine paths
 * - Implement optional hooks like `onData(layout, hypercube)` to pre-process
 */
export default {
  targets: [
    {
      path: '/qHyperCubeDef',
      // Additional data processing can be configured here
      // Example: dimensions, measures, sorting, etc., often defined in object-properties.js
    },
  ],

  // Example: Custom data processing functions
  /*
  onData: (layout, hypercube) => {
    // Process data before rendering
    return hypercube;
  },
  */
};
