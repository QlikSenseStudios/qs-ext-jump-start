/**
 * Data state management for layout processing and validation
 * Handles hypercube data extraction and configuration validation
 */

import { safeGet } from '../utils';

// Constants for data processing
const HYPERCUBE_PATH = '/qHyperCubeDef';
const DIM_COL_IDX = 0;

/**
 * @typedef {Object} DataCounts
 * @property {number} dimCount - Number of dimensions
 * @property {number} measCount - Number of measures
 */

/**
 * @typedef {Object} ProcessedData
 * @property {boolean} isValid - Whether the configuration is valid
 * @property {boolean} hasData - Whether data is available
 * @property {Array} dataMatrix - The data matrix from hypercube
 * @property {DataCounts} counts - Dimension and measure counts
 * @property {string} dimHeader - Dimension header text
 * @property {string} measHeader - Measure header text
 */

/**
 * Returns dimension and measure counts from the layout.
 * @param {Object} layout - Current layout provided by Stardust
 * @returns {DataCounts} Counts used for config validation
 */
export function getCounts(layout) {
  const dimCount = (safeGet(layout, 'qHyperCube.qDimensionInfo', []) || []).length;
  const measCount = (safeGet(layout, 'qHyperCube.qMeasureInfo', []) || []).length;
  return { dimCount, measCount };
}

/**
 * Validates the configuration: requires exactly 1 dimension and at most 1 measure.
 * @param {DataCounts} counts - Dimension and measure counts
 * @returns {boolean} True if the configuration is invalid
 */
export function isInvalidConfig({ dimCount, measCount }) {
  return dimCount !== 1 || measCount > 1;
}

/**
 * Extracts selection information from the layout.
 * @param {Object} layout - Current layout provided by Stardust
 * @returns {boolean} True if currently in selection mode
 */
export function getSelectionInfo(layout) {
  return Boolean(safeGet(layout, 'qSelectionInfo.qInSelections', false));
}

/**
 * Extracts the data matrix from the layout.
 * @param {Object} layout - Current layout provided by Stardust
 * @returns {Array} The data matrix or empty array
 */
export function getDataMatrix(layout) {
  return safeGet(layout, 'qHyperCube.qDataPages.0.qMatrix', []);
}

/**
 * Extracts header information from the layout.
 * @param {Object} layout - Current layout provided by Stardust
 * @returns {{ dimHeader: string, measHeader: string }} Header texts
 */
export function getHeaders(layout) {
  const dimHeader = safeGet(layout, 'qHyperCube.qDimensionInfo.0.qFallbackTitle', 'Dimension');
  const measHeader = safeGet(layout, 'qHyperCube.qMeasureInfo.0.qFallbackTitle', 'Measure');
  return { dimHeader, measHeader };
}

/**
 * Processes layout data and returns comprehensive data state.
 * @param {Object} layout - Current layout provided by Stardust
 * @returns {ProcessedData} Processed data state
 */
export function processLayoutData(layout) {
  const counts = getCounts(layout);
  const isValid = !isInvalidConfig(counts);
  const dataMatrix = getDataMatrix(layout);
  const hasData = dataMatrix.length > 0;
  const { dimHeader, measHeader } = getHeaders(layout);

  return {
    isValid,
    hasData,
    dataMatrix,
    counts,
    dimHeader,
    measHeader,
  };
}

/**
 * Gets the hypercube path constant.
 * @returns {string} The hypercube path for selections
 */
export function getHypercubePath() {
  return HYPERCUBE_PATH;
}

/**
 * Gets the dimension column index constant.
 * @returns {number} The dimension column index
 */
export function getDimensionColumnIndex() {
  return DIM_COL_IDX;
}
