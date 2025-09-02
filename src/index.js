import { useElement, useLayout, useEffect, useSelections } from '@nebula.js/stardust';

import { properties, data } from './qae';
import ext from './ext';
import { createElement, safeGet } from './utils';
import './styles.css';

// Helpers and constants for readability and DRY
const HYPERCUBE_PATH = '/qHyperCubeDef';
const DIM_COL_IDX = 0;

// Small DOM helper
/**
 * Removes all child nodes from a container element.
 * Safe, small utility to avoid repeating while-firstChild clears.
 * @param {HTMLElement} node Host element whose children will be removed
 */
function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

/**
 * Returns dimension and measure counts from the layout.
 * @param {object} layout Current layout provided by Stardust
 * @returns {{ dimCount: number, measCount: number }} Counts used for config validation
 */
function getCounts(layout) {
  const dimCount = (safeGet(layout, 'qHyperCube.qDimensionInfo', []) || []).length;
  const measCount = (safeGet(layout, 'qHyperCube.qMeasureInfo', []) || []).length;
  return { dimCount, measCount };
}

/**
 * Validates the configuration: requires exactly 1 dimension and at most 1 measure.
 * @param {{ dimCount: number, measCount: number }} counts
 * @returns {boolean} True if the configuration is invalid
 */
function isInvalidConfig({ dimCount, measCount }) {
  return dimCount !== 1 || measCount > 1;
}

/**
 * Builds the no-data UI with an optional hint for invalid configurations.
 * @param {number} dimCount Number of dimensions
 * @param {number} measCount Number of measures
 * @returns {HTMLDivElement} The constructed .no-data element
 */
function createNoDataDiv(dimCount, measCount) {
  const noDataDiv = createElement('div', {
    className: 'no-data',
    'aria-label': 'No data available',
    'data-dim-count': String(dimCount ?? ''),
    'data-meas-count': String(measCount ?? ''),
  });

  noDataDiv.appendChild(createElement('div', {}, 'No data to display'));

  if (isInvalidConfig({ dimCount, measCount })) {
    const hintList = createElement('ul', {}, [
      createElement('li', {}, 'Required: Add 1 dimension in the Data panel.'),
      createElement('li', {}, 'Optional: Add 0 or 1 measure.'),
    ]);
    const hint = createElement('div', { className: 'no-data-hint', role: 'note', 'aria-live': 'polite' }, [
      createElement('p', {}, 'Configure this visualization with exactly 1 dimension and at most 1 measure (optional).'),
      hintList,
    ]);
    noDataDiv.appendChild(hint);
  }

  return noDataDiv;
}

/**
 * Appends a standardized error UI to the host element and logs the error.
 * @param {HTMLElement} element Host container
 * @param {unknown} error Error object thrown during rendering
 */
function appendError(element, error) {
  const errorDiv = createElement('div', {
    className: 'error-message',
    role: 'alert',
    'aria-live': 'polite',
  });
  errorDiv.appendChild(createElement('h3', {}, 'Unable to load extension'));
  errorDiv.appendChild(createElement('p', {}, 'Please check your data configuration and try again.'));
  element.appendChild(errorDiv);
  // eslint-disable-next-line no-console
  console.error('Extension rendering error:', error);
}

/**
 * Entrypoint for your sense visualization
 * @param {object} galaxy Contains global settings from the environment.
 * Useful for cases when stardust hooks are unavailable (ie: outside the component function)
 * @param {object} galaxy.anything Extra environment dependent options
 * @param {object=} galaxy.anything.sense Optional object only present within Sense,
 * see: https://qlik.dev/extend/build-extension/in-qlik-sense
 *
 * Component contract:
 * - Inputs: layout (Hypercube and properties), element (container)
 * - Behavior: Render different UI for selection mode, no data, and normal states
 * - Errors: Caught and presented as user-friendly message
 */
// Maintain per-element state without leaking via globals or function properties
/**
 * Tracks per-element selection session state to avoid global leakage.
 * Key: host HTMLElement, Value: { data: Array, pendingByElem: Set<number>, sessionByElem: Set<number>, lastInSelection: boolean, elemToRowIndex: Map<number, number> }
 */
const selectionStateByElement = new WeakMap();
/**
 * Tracks the stable container node attached under each host element.
 * Key: host HTMLElement, Value: container HTMLDivElement
 */
const containerByElement = new WeakMap();

/**
 * Associates current local data with a container without attaching properties to DOM nodes.
 * Key: container HTMLDivElement, Value: Array<{row:number, dim:{text:string, elem:number, selected:boolean}, meas:{text:string}}>
 */
const localDataByContainer = new WeakMap();

/**
 * Removes and forgets a previously attached container for an element.
 * Used before rendering special states (no-data, error) to prevent duplicates.
 * @param {HTMLElement} element host root
 */
function resetElementContainer(element) {
  const existing = containerByElement.get(element);
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
  containerByElement.delete(element);
  clearChildren(element);
}

export default function supernova(galaxy) {
  return {
    qae: {
      properties,
      data,
    },
    ext: ext(galaxy),
    component() {
      const element = useElement();
      const layout = useLayout();
      const selections = useSelections();

      // Persist local selection state per element across renders
      const selectionState = (function ensureState() {
        let state = selectionStateByElement.get(element);
        if (!state) {
          state = {
            data: [],
            pendingByElem: new Set(), // clicks made out of selection mode
            sessionByElem: new Set(), // selections within current selection mode session
            lastInSelection: false,
            elemToRowIndex: new Map(),
          };
          selectionStateByElement.set(element, state);
        }
        return state;
      })();

      useEffect(() => {
        // Do not clear the root element up-front; we keep a stable container for data/selection

        try {
          const inSelection = Boolean(safeGet(layout, 'qSelectionInfo.qInSelections', false));

          // Handle transitions to keep selection sessions discrete
          const wasInSelection = !!selectionState.lastInSelection;
          if (!wasInSelection && inSelection) {
            // Entering selection mode: start a fresh session from pending clicks
            selectionState.sessionByElem = new Set(selectionState.pendingByElem);
            selectionState.pendingByElem.clear();
          }

          // Validate configuration: exactly 1 dimension and 0 or 1 measure
          const { dimCount, measCount } = getCounts(layout);
          if (isInvalidConfig({ dimCount, measCount })) {
            // Ensure we don't accumulate multiple .no-data nodes across renders
            resetElementContainer(element);
            element.appendChild(createNoDataDiv(dimCount, measCount));
            return;
          }

          // Check for data availability (edge case: empty hypercube)
          const dataMatrix = safeGet(layout, 'qHyperCube.qDataPages.0.qMatrix', []);
          if (!dataMatrix.length) {
            resetElementContainer(element);
            element.appendChild(createNoDataDiv(dimCount, measCount));
            return;
          }

          // Acquire or create a stable container per element for data/selection states
          let container = containerByElement.get(element);
          if (!container) {
            container = createElement('div');
            containerByElement.set(element, container);
            // Remove any existing children before first attach
            clearChildren(element);
            element.appendChild(container);
          }
          // Update container accessibility and state classes
          container.setAttribute('class', inSelection ? 'extension-container in-selection' : 'extension-container');
          container.setAttribute('role', 'main');
          container.setAttribute('aria-label', 'Qlik Sense Extension Content');
          container.setAttribute('tabindex', '0');

          // Clear and rebuild inner content each render
          clearChildren(container);

          const content = createElement('div', { className: 'content' });

          // Title retained
          const heading = createElement('h2', {}, 'Hello World!');
          content.appendChild(heading);

          // No separate selection banner; selection is indicated via container class and cell highlights

          // Build a simple 2-column table for [Dimension, Measure]
          const table = createElement('table', { className: 'data-table', role: 'table' });
          const thead = createElement('thead');
          const headerRow = createElement('tr');

          // Derive headers from layout
          const dimHeader = safeGet(layout, 'qHyperCube.qDimensionInfo.0.qFallbackTitle', 'Dimension');
          const measHeader = safeGet(layout, 'qHyperCube.qMeasureInfo.0.qFallbackTitle', 'Measure');

          headerRow.appendChild(createElement('th', { scope: 'col' }, dimHeader));
          headerRow.appendChild(createElement('th', { scope: 'col' }, measHeader));
          thead.appendChild(headerRow);

          const tbody = createElement('tbody');
          const tbodyFrag = document.createDocumentFragment();
          const elemToRowIndex = new Map();

          const prevSelected = inSelection ? new Set(selectionState.sessionByElem) : new Set();

          const localData = [];
          dataMatrix.forEach((row, rowIndex) => {
            const tr = createElement('tr', { 'data-row-index': String(rowIndex) });

            // qText is string for display; qElemNumber used for selections in Sense
            const dimCellText = safeGet(row, '0.qText', '-');
            const dimElem = safeGet(row, '0.qElemNumber', -1);
            // Determine local selection from our local store (independent of visual gating)
            const isSelected = prevSelected.has(dimElem);

            const tdDim = createElement(
              'td',
              {
                className: `dim-cell selectable-item${inSelection && isSelected ? ' local-selected' : ''}`,
                role: 'button',
                tabindex: '0',
                'data-q-elem': String(dimElem),
                'aria-label': `Select ${dimCellText}`,
              },
              dimCellText
            );

            // Optional measure
            const measCellText = safeGet(row, '1.qText', '-');
            const tdMeas = createElement('td', { className: 'meas-cell' }, measCellText);

            tr.appendChild(tdDim);
            tr.appendChild(tdMeas);
            tbodyFrag.appendChild(tr);

            // Map elem -> rowIndex for fast updates
            if (Number.isFinite(dimElem) && dimElem >= 0) {
              elemToRowIndex.set(dimElem, rowIndex);
            }

            // Track local selection state
            localData.push({
              row: rowIndex,
              dim: { text: dimCellText, elem: dimElem, selected: isSelected },
              meas: { text: measCellText },
            });
          });

          table.appendChild(thead);
          tbody.appendChild(tbodyFrag);
          table.appendChild(tbody);
          content.appendChild(table);
          container.appendChild(content);
          // Update persisted local selection state and record current data
          selectionState.data = localData;
          selectionState.lastInSelection = inSelection;
          selectionState.elemToRowIndex = elemToRowIndex;
          // Store current data externally without attaching properties to DOM nodes
          localDataByContainer.set(container, localData);
          // Ensure container remains attached (append only if not already present)
          if (!container.parentNode) {
            element.appendChild(container);
          }

          // Event delegation: attach once on tbody
          /**
           * Finds the cached data row entry for a given qElemNumber.
           * @param {number} elem qElemNumber for the dimension cell
           * @returns {{row:number, dim:{text:string, elem:number, selected:boolean}, meas:{text:string}}|undefined}
           */
          const getRowEntry = (elem) => {
            const idx = selectionState.elemToRowIndex?.get(elem);
            return Number.isInteger(idx)
              ? selectionState.data[idx]
              : (selectionState.data || []).find((r) => r.dim.elem === elem);
          };

          /**
           * Handles click/keyboard activation from a dimension cell.
           * Updates Sense selections and local selection session state.
           * @param {HTMLElement} cell The clicked/focused dimension cell
           */
          const activateFromCell = async (cell) => {
            const elem = Number(cell.getAttribute('data-q-elem'));
            if (Number.isNaN(elem)) {
              return;
            }
            try {
              const rowEntry = getRowEntry(elem);
              // Update local state first to avoid races with re-render
              if (inSelection) {
                const wasSelected = selectionState.sessionByElem.has(elem);
                if (wasSelected) {
                  selectionState.sessionByElem.delete(elem);
                  if (rowEntry) {
                    rowEntry.dim.selected = false;
                  }
                  cell.classList.remove('local-selected');
                } else {
                  selectionState.sessionByElem.add(elem);
                  if (rowEntry) {
                    rowEntry.dim.selected = true;
                  }
                  cell.classList.add('local-selected');
                }
              } else {
                const wasPending = selectionState.pendingByElem.has(elem);
                if (!wasPending) {
                  selectionState.pendingByElem.add(elem);
                  if (rowEntry) {
                    rowEntry.dim.selected = true;
                  }
                }
              }

              // Then call backend selection API
              if (selections && typeof selections.select === 'function') {
                if (!inSelection && typeof selections.begin === 'function') {
                  selectionState.sessionByElem.clear();
                  selectionState.data = [];
                  await selections.begin(HYPERCUBE_PATH);
                }
                await selections.select({
                  method: 'selectHyperCubeValues',
                  params: [HYPERCUBE_PATH, DIM_COL_IDX, [elem], inSelection],
                });
              }

              // If no selections remain in this session, exit selection mode (after select)
              if (inSelection && selectionState.sessionByElem.size === 0) {
                try {
                  if (selections && typeof selections.cancel === 'function') {
                    await selections.cancel();
                  }
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.warn('Failed to exit selection mode', e);
                }
              }
            } catch (err) {
              // eslint-disable-next-line no-console
              console.warn('Selection failed', err);
            }
          };

          tbody.addEventListener('click', (e) => {
            const cell = e.target.closest && e.target.closest('.dim-cell');
            if (cell && tbody.contains(cell)) {
              activateFromCell(cell);
            }
          });
          tbody.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') {
              return;
            }
            const cell = e.target.closest && e.target.closest('.dim-cell');
            if (cell && tbody.contains(cell)) {
              e.preventDefault();
              activateFromCell(cell);
            }
          });
        } catch (error) {
          // Error handling with user feedback
          // If a container exists, remove it to prevent overlapping UI
          resetElementContainer(element);
          // Show error UI
          appendError(element, error);
        }
      }, [element, layout]);
    },
  };
}
