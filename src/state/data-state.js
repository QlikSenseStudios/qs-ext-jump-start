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
 * Validates the configuration and detects various data absence scenarios.
 * @param {DataCounts} counts - Dimension and measure counts
 * @param {Object} layout - Current layout for additional validation
 * @returns {Object} Validation result with specific error types
 */
export function validateConfiguration({ dimCount, measCount }, layout) {
  // Check for basic configuration requirements
  const hasValidConfig = dimCount === 1 && measCount <= 1;
  
  if (!hasValidConfig) {
    return {
      isValid: false,
      errorType: 'invalid-config',
      reason: 'Configuration requires exactly 1 dimension and at most 1 measure',
    };
  }

  // Check for calculation errors in dimensions
  const dimInfo = safeGet(layout, 'qHyperCube.qDimensionInfo.0', {});
  if (dimInfo.qError) {
    return {
      isValid: false,
      errorType: 'dimension-error',
      reason: dimInfo.qError.qErrorCode || 'Dimension calculation error',
    };
  }

  // Check for calculation errors in measures
  const measInfo = safeGet(layout, 'qHyperCube.qMeasureInfo.0', {});
  if (measInfo && measInfo.qError) {
    return {
      isValid: false,
      errorType: 'measure-error', 
      reason: measInfo.qError.qErrorCode || 'Measure calculation error',
    };
  }

  // Check for suppressed hypercube (missing data structure)
  const hypercube = safeGet(layout, 'qHyperCube', null);
  if (!hypercube || hypercube.qSuppressed) {
    return {
      isValid: false,
      errorType: 'data-suppressed',
      reason: 'Data is suppressed or unavailable',
    };
  }

  return {
    isValid: true,
    errorType: null,
    reason: null,
  };
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
 * Checks various scenarios where data might be unavailable.
 * @param {Array} dataMatrix - The data matrix from hypercube
 * @param {Object} layout - Current layout for additional checks
 * @returns {Object} Data availability result
 */
export function checkDataAvailability(dataMatrix, layout) {
  // No data in matrix
  if (!dataMatrix || dataMatrix.length === 0) {
    return {
      hasData: false,
      dataIssueType: 'no-data',
      reason: 'No data available in the current selection',
    };
  }

  // Check for all null/empty values (data exists but is meaningless)
  const hasNonEmptyData = dataMatrix.some(row => 
    row.some(cell => 
      cell && 
      cell.qText !== null && 
      cell.qText !== '' && 
      cell.qText !== '-'
    )
  );

  if (!hasNonEmptyData) {
    return {
      hasData: false, 
      dataIssueType: 'empty-data',
      reason: 'Data contains only null or empty values',
    };
  }

  // Check if hypercube is in an error state
  const hypercube = safeGet(layout, 'qHyperCube', {});
  if (hypercube.qError) {
    return {
      hasData: false,
      dataIssueType: 'hypercube-error',
      reason: hypercube.qError.qErrorCode || 'Hypercube calculation error',
    };
  }

  return {
    hasData: true,
    dataIssueType: null,
    reason: null,
  };
}

/**
 * Processes layout data and returns comprehensive data state.
 * @param {Object} layout - Current layout provided by Stardust
 * @returns {ProcessedData} Processed data state
 */
export function processLayoutData(layout) {
  const counts = getCounts(layout);
  const validation = validateConfiguration(counts, layout);
  const dataMatrix = getDataMatrix(layout);
  const dataCheck = checkDataAvailability(dataMatrix, layout);
  const { dimHeader, measHeader } = getHeaders(layout);

  return {
    isValid: validation.isValid,
    hasData: dataCheck.hasData,
    dataMatrix,
    counts,
    dimHeader,
    measHeader,
    // Enhanced error information
    errorType: validation.errorType || dataCheck.dataIssueType,
    errorReason: validation.reason || dataCheck.reason,
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
