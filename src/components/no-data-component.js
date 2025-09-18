/**
 * No-data component for displaying empty states and configuration hints
 */

import { createElement } from '../utils';

/**
 * Creates the no-data UI with context-specific messages and hints.
 * @param {number} dimCount - Number of dimensions
 * @param {number} measCount - Number of measures  
 * @param {string} [errorType] - Type of error/issue detected
 * @param {string} [errorReason] - Detailed reason for the error
 * @returns {HTMLDivElement} The constructed .no-data element
 */
export function createNoDataComponent(dimCount, measCount, errorType = null, errorReason = null) {
  const noDataDiv = createElement('div', {
    className: `no-data ${errorType ? `error-${errorType}` : ''}`,
    'aria-label': 'No data available',
    'data-dim-count': String(dimCount ?? ''),
    'data-meas-count': String(measCount ?? ''),
    'data-error-type': errorType || 'unknown',
  });

  // Create main message based on error type
  const message = getErrorMessage(errorType, errorReason);
  noDataDiv.appendChild(createElement('div', { className: 'no-data-message' }, message));

  // Add specific hints based on error type
  const hint = createContextualHint(errorType, dimCount, measCount);
  if (hint) {
    noDataDiv.appendChild(hint);
  }

  return noDataDiv;
}

/**
 * Gets the appropriate error message based on error type.
 * @param {string} errorType - Type of error
 * @param {string} _errorReason - Detailed reason (unused for now)
 * @returns {string} User-friendly error message
 */
function getErrorMessage(errorType, _errorReason) {
  switch (errorType) {
    case 'invalid-config':
      return 'Configuration required';
    case 'dimension-error':
      return 'Dimension calculation error';
    case 'measure-error':
      return 'Measure calculation error';
    case 'data-suppressed':
      return 'Data access restricted';
    case 'no-data':
      return 'No data in current selection';
    case 'empty-data':
      return 'Data contains only empty values';
    case 'hypercube-error':
      return 'Data calculation error';
    default:
      return 'No data to display';
  }
}

/**
 * Creates contextual hints based on the error type.
 * @param {string} errorType - Type of error
 * @param {number} dimCount - Number of dimensions
 * @param {number} measCount - Number of measures
 * @returns {HTMLDivElement|null} Hint element or null
 */
function createContextualHint(errorType, dimCount, measCount) {
  switch (errorType) {
    case 'invalid-config':
      return createConfigurationHint(dimCount, measCount);
    case 'dimension-error':
    case 'measure-error':
      return createCalculationErrorHint();
    case 'data-suppressed':
      return createDataAccessHint();
    case 'no-data':
      return createSelectionHint();
    case 'empty-data':
      return createEmptyDataHint();
    case 'hypercube-error':
      return createHypercubeErrorHint();
    default:
      // Only show configuration hint for basic cases
      if (dimCount !== 1 || measCount > 1) {
        return createConfigurationHint(dimCount, measCount);
      }
      return null;
  }
}

/**
 * Creates the configuration hint for invalid configurations.
 * @param {number} dimCount - Current dimension count
 * @param {number} measCount - Current measure count
 * @returns {HTMLDivElement} The configuration hint element
 */
function createConfigurationHint(dimCount, measCount) {
  const issues = [];
  
  if (dimCount !== 1) {
    issues.push(`Current: ${dimCount} dimension${dimCount !== 1 ? 's' : ''}, required: exactly 1`);
  }
  
  if (measCount > 1) {
    issues.push(`Current: ${measCount} measures, maximum: 1`);
  }

  const hintList = createElement('ul', {}, [
    createElement('li', {}, 'Add exactly 1 dimension in the Data panel'),
    createElement('li', {}, 'Add 0 or 1 measure (optional)'),
    ...issues.map(issue => createElement('li', { className: 'issue' }, issue)),
  ]);

  return createElement('div', { className: 'no-data-hint', role: 'note', 'aria-live': 'polite' }, [
    createElement('p', {}, 'Configuration required'),
    hintList,
  ]);
}

/**
 * Creates hint for calculation errors.
 * @returns {HTMLDivElement} The calculation error hint element
 */
function createCalculationErrorHint() {
  return createElement('div', { className: 'no-data-hint error-hint', role: 'note' }, [
    createElement('p', {}, 'Check your dimension or measure expression for syntax errors.'),
    createElement('ul', {}, [
      createElement('li', {}, 'Verify field names exist in the data model'),
      createElement('li', {}, 'Check for syntax errors in expressions'),
      createElement('li', {}, 'Ensure aggregation functions are used correctly'),
    ]),
  ]);
}

/**
 * Creates hint for data access issues.
 * @returns {HTMLDivElement} The data access hint element
 */
function createDataAccessHint() {
  return createElement('div', { className: 'no-data-hint access-hint', role: 'note' }, [
    createElement('p', {}, 'Data access may be restricted by security rules or data source availability.'),
    createElement('ul', {}, [
      createElement('li', {}, 'Contact your administrator if you expect to see data'),
      createElement('li', {}, 'Check if the data source is accessible'),
      createElement('li', {}, 'Verify your access permissions'),
    ]),
  ]);
}

/**
 * Creates hint for selection-related no data.
 * @returns {HTMLDivElement} The selection hint element
 */
function createSelectionHint() {
  return createElement('div', { className: 'no-data-hint selection-hint', role: 'note' }, [
    createElement('p', {}, 'No data matches the current selections.'),
    createElement('ul', {}, [
      createElement('li', {}, 'Clear some selections to see more data'),
      createElement('li', {}, 'Check if your selections are too restrictive'),
      createElement('li', {}, 'Try different filter combinations'),
    ]),
  ]);
}

/**
 * Creates hint for empty data values.
 * @returns {HTMLDivElement} The empty data hint element
 */
function createEmptyDataHint() {
  return createElement('div', { className: 'no-data-hint empty-hint', role: 'note' }, [
    createElement('p', {}, 'Data is available but contains only null or empty values.'),
    createElement('ul', {}, [
      createElement('li', {}, 'Check data quality in your source'),
      createElement('li', {}, 'Verify measure calculations return values'),
      createElement('li', {}, 'Consider filtering out null values'),
    ]),
  ]);
}

/**
 * Creates hint for hypercube calculation errors.
 * @returns {HTMLDivElement} The hypercube error hint element
 */
function createHypercubeErrorHint() {
  return createElement('div', { className: 'no-data-hint hypercube-hint', role: 'note' }, [
    createElement('p', {}, 'Error occurred during data calculation.'),
    createElement('ul', {}, [
      createElement('li', {}, 'Simplify complex expressions'),
      createElement('li', {}, 'Check for circular references'),
      createElement('li', {}, 'Verify data model integrity'),
    ]),
  ]);
}
