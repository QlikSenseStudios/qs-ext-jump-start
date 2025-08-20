/**
 * Data source configuration for the Qlik Sense extension
 * Defines how data is fetched and processed from the Qlik engine
 */
export default {
  targets: [
    {
      path: '/qHyperCubeDef',
      // Additional data processing can be configured here
      // Example: dimensions, measures, sorting, etc.
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
