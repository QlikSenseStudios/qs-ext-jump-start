/**
 * Table templates for complex table patterns and layouts
 * Provides specialized templates for different table configurations
 */

import { createElement } from '../utils';
import { createTableComponent, createTableRow } from '../components';
import { createBaseTemplate } from './base-template';

/**
 * @typedef {Object} TableTemplateConfig
 * @property {string} [className] - CSS class for the table wrapper
 * @property {string} [caption] - Table caption for accessibility
 * @property {boolean} [sortable=false] - Whether the table supports sorting
 * @property {boolean} [filterable=false] - Whether the table supports filtering
 * @property {Object} [wrapperConfig] - Configuration for the table wrapper
 */

/**
 * Creates an enhanced table template with additional features.
 * @param {Object} config - Enhanced table configuration
 * @param {Object} config.tableConfig - Base table configuration
 * @param {TableTemplateConfig} [config.templateConfig={}] - Template-specific configuration
 * @param {boolean} [config.inSelection=false] - Whether currently in selection mode
 * @returns {{ wrapper: HTMLDivElement, table: HTMLTableElement, tbody: HTMLTableSectionElement }} Enhanced table elements
 */
export function createEnhancedTableTemplate(config) {
  const { tableConfig, templateConfig = {}, inSelection = false } = config;
  const {
    className = 'enhanced-table-wrapper',
    caption,
    sortable = false,
    filterable = false,
    wrapperConfig = {},
  } = templateConfig;

  // Create base table component
  const { table, tbody } = createTableComponent({
    ...tableConfig,
    inSelection,
  });

  // Add caption if provided
  if (caption) {
    const captionElement = createElement('caption', { className: 'table-caption' }, caption);
    table.insertBefore(captionElement, table.firstChild);
  }

  // Add sorting indicators if sortable
  if (sortable) {
    addSortingFeatures(table);
  }

  // Create wrapper with additional features
  const wrapper = createBaseTemplate({
    className,
    role: 'region',
    ariaLabel: 'Data table',
    ...wrapperConfig,
  });

  // Add filtering controls if enabled
  if (filterable) {
    const filterControls = createFilterControls(tableConfig);
    wrapper.appendChild(filterControls);
  }

  wrapper.appendChild(table);

  return { wrapper, table, tbody };
}

/**
 * Creates a responsive table template that adapts to different screen sizes.
 * @param {Object} config - Responsive table configuration
 * @param {Object} config.tableConfig - Base table configuration
 * @param {Object} [config.responsiveConfig={}] - Responsive-specific configuration
 * @param {boolean} [config.inSelection=false] - Whether currently in selection mode
 * @returns {{ wrapper: HTMLDivElement, table: HTMLTableElement, tbody: HTMLTableSectionElement }} Responsive table elements
 */
export function createResponsiveTableTemplate(config) {
  const { tableConfig, responsiveConfig = {}, inSelection = false } = config;
  const { breakpoints = ['mobile', 'tablet', 'desktop'], stackOnMobile = true } = responsiveConfig;

  // Create enhanced table with responsive wrapper
  const { wrapper, table, tbody } = createEnhancedTableTemplate({
    tableConfig,
    templateConfig: {
      className: 'responsive-table-wrapper',
      wrapperConfig: {
        attributes: {
          'data-responsive': 'true',
          'data-stack-mobile': String(stackOnMobile),
        },
      },
    },
    inSelection,
  });

  // Add responsive classes
  breakpoints.forEach((breakpoint) => {
    wrapper.classList.add(`responsive-${breakpoint}`);
  });

  return { wrapper, table, tbody };
}

/**
 * Creates a paginated table template with pagination controls.
 * @param {Object} config - Paginated table configuration
 * @param {Object} config.tableConfig - Base table configuration
 * @param {Object} [config.paginationConfig={}] - Pagination-specific configuration
 * @param {boolean} [config.inSelection=false] - Whether currently in selection mode
 * @returns {{ wrapper: HTMLDivElement, table: HTMLTableElement, tbody: HTMLTableSectionElement, pagination: HTMLDivElement }} Paginated table elements
 */
export function createPaginatedTableTemplate(config) {
  const { tableConfig, paginationConfig = {}, inSelection = false } = config;
  const { pageSize = 10, showPageInfo = true, showPageSizeSelector = true } = paginationConfig;

  // Create base table
  const { wrapper, table, tbody } = createEnhancedTableTemplate({
    tableConfig,
    templateConfig: {
      className: 'paginated-table-wrapper',
    },
    inSelection,
  });

  // Create pagination controls
  const pagination = createPaginationControls({
    pageSize,
    showPageInfo,
    showPageSizeSelector,
    totalItems: tableConfig.localData.length,
  });

  wrapper.appendChild(pagination);

  return { wrapper, table, tbody, pagination };
}

/**
 * Creates a table template with grouped rows.
 * @param {Object} config - Grouped table configuration
 * @param {Object} config.tableConfig - Base table configuration
 * @param {string} config.groupBy - Field to group by
 * @param {Object} [config.groupConfig={}] - Group-specific configuration
 * @param {boolean} [config.inSelection=false] - Whether currently in selection mode
 * @returns {{ wrapper: HTMLDivElement, table: HTMLTableElement, tbody: HTMLTableSectionElement }} Grouped table elements
 */
export function createGroupedTableTemplate(config) {
  const { tableConfig, groupBy, groupConfig = {}, inSelection = false } = config;
  const { collapsible = true, showGroupSummary = false } = groupConfig;

  // Group the data
  const groupedData = groupDataBy(tableConfig.localData, groupBy);

  // Create enhanced table
  const { wrapper, table, tbody } = createEnhancedTableTemplate({
    tableConfig: {
      ...tableConfig,
      localData: [], // We'll populate this manually
    },
    templateConfig: {
      className: 'grouped-table-wrapper',
    },
    inSelection,
  });

  // Populate grouped rows
  Object.entries(groupedData).forEach(([groupKey, items]) => {
    // Create group header
    const groupHeader = createGroupHeader(groupKey, items.length, {
      collapsible,
      showGroupSummary,
    });
    tbody.appendChild(groupHeader);

    // Add group items
    items.forEach((item) => {
      const row = createTableRow(item, inSelection);
      row.classList.add('group-item');
      tbody.appendChild(row);
    });
  });

  return { wrapper, table, tbody };
}

/**
 * Adds sorting features to a table.
 * @param {HTMLTableElement} table - The table element
 */
function addSortingFeatures(table) {
  const headers = table.querySelectorAll('th');
  headers.forEach((header, index) => {
    header.classList.add('sortable');
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-sort', 'none');
    header.setAttribute('data-column', String(index));

    // Add sort indicator
    const sortIndicator = createElement('span', { className: 'sort-indicator', 'aria-hidden': 'true' });
    header.appendChild(sortIndicator);
  });
}

/**
 * Creates filter controls for a table.
 * @param {Object} _tableConfig - Table configuration (currently unused)
 * @returns {HTMLDivElement} Filter controls element
 */
function createFilterControls(_tableConfig) {
  const controls = createBaseTemplate({
    className: 'table-filter-controls',
    role: 'search',
    ariaLabel: 'Table filters',
  });

  // Create search input
  const searchInput = createElement('input', {
    type: 'text',
    className: 'table-search',
    placeholder: 'Search table...',
    'aria-label': 'Search table content',
  });

  controls.appendChild(searchInput);
  return controls;
}

/**
 * Creates pagination controls.
 * @param {Object} config - Pagination configuration
 * @returns {HTMLDivElement} Pagination controls element
 */
function createPaginationControls(config) {
  const { pageSize, showPageInfo, showPageSizeSelector, totalItems } = config;
  const totalPages = Math.ceil(totalItems / pageSize);

  const pagination = createBaseTemplate({
    className: 'table-pagination',
    role: 'navigation',
    ariaLabel: 'Table pagination',
  });

  if (showPageInfo) {
    const pageInfo = createElement(
      'div',
      { className: 'page-info' },
      `Showing 1-${Math.min(pageSize, totalItems)} of ${totalItems} items`
    );
    pagination.appendChild(pageInfo);
  }

  // Page navigation buttons
  const pageNav = createElement('div', { className: 'page-navigation' });

  // Previous button
  const prevButton = createElement(
    'button',
    {
      className: 'page-button prev',
      disabled: 'true',
      'aria-label': 'Previous page',
    },
    'Previous'
  );
  pageNav.appendChild(prevButton);

  // Page numbers (simplified - show current page)
  const currentPage = createElement('span', { className: 'current-page' }, '1');
  pageNav.appendChild(currentPage);

  // Next button
  const nextButton = createElement(
    'button',
    {
      className: 'page-button next',
      disabled: totalPages <= 1 ? 'true' : undefined,
      'aria-label': 'Next page',
    },
    'Next'
  );
  pageNav.appendChild(nextButton);

  pagination.appendChild(pageNav);

  if (showPageSizeSelector) {
    const sizeSelector = createPageSizeSelector(pageSize);
    pagination.appendChild(sizeSelector);
  }

  return pagination;
}

/**
 * Creates a page size selector.
 * @param {number} currentPageSize - Current page size
 * @returns {HTMLDivElement} Page size selector element
 */
function createPageSizeSelector(currentPageSize) {
  const selector = createElement('div', { className: 'page-size-selector' });

  const label = createElement('label', { for: 'page-size-select' }, 'Items per page:');
  const select = createElement('select', { id: 'page-size-select', className: 'page-size-select' });

  [5, 10, 25, 50, 100].forEach((size) => {
    const option = createElement('option', { value: String(size) }, String(size));
    if (size === currentPageSize) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  selector.appendChild(label);
  selector.appendChild(select);

  return selector;
}

/**
 * Creates a group header row.
 * @param {string} groupKey - Group identifier
 * @param {number} itemCount - Number of items in group
 * @param {Object} config - Group header configuration
 * @returns {HTMLTableRowElement} Group header row
 */
function createGroupHeader(groupKey, itemCount, config) {
  const { collapsible, showGroupSummary } = config;

  const row = createElement('tr', { className: 'group-header' });
  const cell = createElement('td', {
    colSpan: '2',
    className: 'group-header-cell',
    role: collapsible ? 'button' : undefined,
    tabindex: collapsible ? '0' : undefined,
    'aria-expanded': collapsible ? 'true' : undefined,
  });

  let content = groupKey;
  if (showGroupSummary) {
    content += ` (${itemCount} items)`;
  }

  cell.textContent = content;
  row.appendChild(cell);

  return row;
}

/**
 * Groups data by a specified field.
 * @param {Array} data - Data to group
 * @param {string} groupBy - Field to group by
 * @returns {Object} Grouped data
 */
function groupDataBy(data, groupBy) {
  return data.reduce((groups, item) => {
    const key = item.dim[groupBy] || item.meas[groupBy] || 'Unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}
