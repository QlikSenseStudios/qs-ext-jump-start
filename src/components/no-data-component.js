/**
 * No-data component for displaying empty states and configuration hints
 */

import { createElement } from '../utils';
import { isInvalidConfig } from '../state';

/**
 * Creates the no-data UI with an optional hint for invalid configurations.
 * @param {number} dimCount - Number of dimensions
 * @param {number} measCount - Number of measures
 * @returns {HTMLDivElement} The constructed .no-data element
 */
export function createNoDataComponent(dimCount, measCount) {
  const noDataDiv = createElement('div', {
    className: 'no-data',
    'aria-label': 'No data available',
    'data-dim-count': String(dimCount ?? ''),
    'data-meas-count': String(measCount ?? ''),
  });

  noDataDiv.appendChild(createElement('div', {}, 'No data to display'));

  if (isInvalidConfig({ dimCount, measCount })) {
    const configHint = createConfigurationHint();
    noDataDiv.appendChild(configHint);
  }

  return noDataDiv;
}

/**
 * Creates the configuration hint for invalid configurations.
 * @returns {HTMLDivElement} The configuration hint element
 */
function createConfigurationHint() {
  const hintList = createElement('ul', {}, [
    createElement('li', {}, 'Required: Add 1 dimension in the Data panel.'),
    createElement('li', {}, 'Optional: Add 0 or 1 measure.'),
  ]);

  const hint = createElement('div', { className: 'no-data-hint', role: 'note', 'aria-live': 'polite' }, [
    createElement('p', {}, 'Configure this visualization with exactly 1 dimension and at most 1 measure (optional).'),
    hintList,
  ]);

  return hint;
}
