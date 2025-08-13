import pkg from '../../package.json';

const properties = {
  title: `${pkg.name} v${pkg.version}`,
  qHyperCubeDef: {
    qInitialDataFetch: [{ qWidth: 2, qHeight: 10 }],
  }
  // Add additional property configurations here if needed
};

export default properties;
