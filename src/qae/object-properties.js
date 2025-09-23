import pkg from '../../package.json';

/**
 * Qlik Sense extension properties configuration
 * - Sets base defaults for the property panel (what users can configure)
 *
 * Where to edit:
 * - Add/remove properties in this file
 * - For data targets and advanced data hooks, see `src/qae/data.js`
 * - For property panel structure, see `src/ext.js`
 */
const data_definition = {
  /**
   * Extends HyperCubeDef, see Engine API: HyperCubeDef
   * @extends {HyperCubeDef}
   */
  qHyperCubeDef: {
    /**
     * @type {DimensionProperties[]}
     */
    qDimensions: [],
    /**
     * @type {MeasureProperties[]}
     */
    qMeasures: [],
    // limit: qWidth * qHeight < 10000
    qInitialDataFetch: [{ qLeft: 0, qTop: 0, qWidth: 2, qHeight: 20 }],
    qSuppressZero: false,
    qSuppressMissing: false,
    qShowAlternative: false,
  },
};

const caption_properties = {
  /**
   * Show title for the visualization
   * @type {boolean=}
   * @default
   */
  showTitles: true,

  /**
   * Visualization title
   * @type {(string|StringExpression)=}
   * @default
   */
  title: `${pkg.name}`,

  /**
   * Visualization subtitle
   * @type {(string|StringExpression)=}
   * @default
   */
  subtitle: `v${pkg.version}`,

  /**
   * Visualization footnote
   * @type {(string|StringExpression)=}
   * @default
   */
  footnote: 'This is a template project for creating Qlik Sense extensions',
};

const custom_props = {
  debug: {
    enabled: false,
    forceState: '',
  },
};

export default {
  /**
   * Current version of this generic object definition
   * @type {string}
   * @default
   */
  version: pkg.version,

  ...data_definition,
  ...caption_properties,
  props: custom_props,
};
