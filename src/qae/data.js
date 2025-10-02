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
      dimensions: {
        min: 1,
        max: 1,
      },
      measures: {
        min: 0,
        max: 1,
      },
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
