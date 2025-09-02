/**
 * Table component for rendering data tables with accessibility and selection support
 */

import { createElement } from '../utils';

/**
 * Creates a data table component with headers and accessibility features.
 * @param {Object} options - Table configuration options
 * @param {string} options.dimHeader - Dimension column header text
 * @param {string} options.measHeader - Measure column header text
 * @param {Array} options.localData - Array of data entries to render
 * @param {boolean} options.inSelection - Whether currently in selection mode
 * @param {string} [options.className='data-table'] - CSS class for the table
 * @returns {{ table: HTMLTableElement, tbody: HTMLTableSectionElement }} Table elements
 */
export function createTableComponent({ dimHeader, measHeader, localData, inSelection, className = 'data-table' }) {
  const table = createElement('table', { className, role: 'table' });

  // Create table header
  const thead = createTableHeader(dimHeader, measHeader);
  table.appendChild(thead);

  // Create table body with data
  const { tbody, fragment } = createTableBody(localData, inSelection);
  tbody.appendChild(fragment);
  table.appendChild(tbody);

  return { table, tbody };
}

/**
 * Creates the table header with proper accessibility attributes.
 * @param {string} dimHeader - Dimension column header text
 * @param {string} measHeader - Measure column header text
 * @returns {HTMLTableSectionElement} The table header element
 */
export function createTableHeader(dimHeader, measHeader) {
  const thead = createElement('thead');
  const headerRow = createElement('tr');

  headerRow.appendChild(createElement('th', { scope: 'col' }, dimHeader));
  headerRow.appendChild(createElement('th', { scope: 'col' }, measHeader));
  thead.appendChild(headerRow);

  return thead;
}

/**
 * Creates the table body with data rows.
 * @param {Array} localData - Array of data entries to render
 * @param {boolean} inSelection - Whether currently in selection mode
 * @returns {{ tbody: HTMLTableSectionElement, fragment: DocumentFragment }} Table body and fragment
 */
export function createTableBody(localData, inSelection) {
  const tbody = createElement('tbody');
  const fragment = document.createDocumentFragment();

  localData.forEach((dataEntry) => {
    const row = createTableRow(dataEntry, inSelection);
    fragment.appendChild(row);
  });

  return { tbody, fragment };
}

/**
 * Creates a single table row for a data entry.
 * @param {Object} dataEntry - The data entry object
 * @param {number} dataEntry.row - Row index
 * @param {Object} dataEntry.dim - Dimension data
 * @param {string} dataEntry.dim.text - Dimension display text
 * @param {number} dataEntry.dim.elem - Element number for selections
 * @param {boolean} dataEntry.dim.selected - Selection state
 * @param {Object} dataEntry.meas - Measure data
 * @param {string} dataEntry.meas.text - Measure display text
 * @param {boolean} inSelection - Whether currently in selection mode
 * @returns {HTMLTableRowElement} The constructed table row
 */
export function createTableRow(dataEntry, inSelection) {
  const { row, dim, meas } = dataEntry;
  const isSelected = dim.selected;

  const tr = createElement('tr', { 'data-row-index': String(row) });

  // Create dimension cell with selection capabilities
  const tdDim = createDimensionCell(dim, inSelection && isSelected);

  // Create measure cell
  const tdMeas = createMeasureCell(meas);

  tr.appendChild(tdDim);
  tr.appendChild(tdMeas);

  return tr;
}

/**
 * Creates a dimension cell with selection functionality.
 * @param {Object} dim - Dimension data
 * @param {string} dim.text - Display text
 * @param {number} dim.elem - Element number
 * @param {boolean} isLocalSelected - Whether the cell is locally selected
 * @returns {HTMLTableCellElement} The dimension cell element
 */
export function createDimensionCell(dim, isLocalSelected) {
  const className = `dim-cell selectable-item${isLocalSelected ? ' local-selected' : ''}`;

  return createElement(
    'td',
    {
      className,
      role: 'button',
      tabindex: '0',
      'data-q-elem': String(dim.elem),
      'aria-label': `Select ${dim.text}`,
    },
    dim.text
  );
}

/**
 * Creates a measure cell for displaying measure values.
 * @param {Object} meas - Measure data
 * @param {string} meas.text - Display text
 * @returns {HTMLTableCellElement} The measure cell element
 */
export function createMeasureCell(meas) {
  return createElement('td', { className: 'meas-cell' }, meas.text);
}
