import { useElement, useLayout, useEffect, useSelections } from '@nebula.js/stardust';

import { properties, data } from './qae';
import ext from './ext';
import { createElement } from './utils';
import {
  ensureSelectionState,
  enterSelectionMode,
  toggleElementSelection,
  updateLocalDataState,
  getRowEntry,
  isSelectionSessionEmpty,
  updateLastSelectionState,
  ensureContainer,
  resetElementContainer,
  updateContainerState,
  setContainerData,
  ensureContainerAttached,
  clearChildren,
  processLayoutData,
  getSelectionInfo,
  getHypercubePath,
  getDimensionColumnIndex,
  isInvalidConfig,
} from './state';
import './styles.css';

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
      const selectionState = ensureSelectionState(element);

      useEffect(() => {
        // Do not clear the root element up-front; we keep a stable container for data/selection

        try {
          const inSelection = getSelectionInfo(layout);

          // Handle transitions to keep selection sessions discrete
          const wasInSelection = !!selectionState.lastInSelection;
          if (!wasInSelection && inSelection) {
            // Entering selection mode: start a fresh session from pending clicks
            enterSelectionMode(selectionState);
          }

          // Process layout data for validation and extraction
          const processedData = processLayoutData(layout);
          if (!processedData.isValid) {
            // Ensure we don't accumulate multiple .no-data nodes across renders
            resetElementContainer(element);
            element.appendChild(createNoDataDiv(processedData.counts.dimCount, processedData.counts.measCount));
            return;
          }

          // Check for data availability (edge case: empty hypercube)
          if (!processedData.hasData) {
            resetElementContainer(element);
            element.appendChild(createNoDataDiv(processedData.counts.dimCount, processedData.counts.measCount));
            return;
          }

          // Acquire or create a stable container per element for data/selection states
          const container = ensureContainer(element);

          // Update container accessibility and state classes
          updateContainerState(container, inSelection);

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
          headerRow.appendChild(createElement('th', { scope: 'col' }, processedData.dimHeader));
          headerRow.appendChild(createElement('th', { scope: 'col' }, processedData.measHeader));
          thead.appendChild(headerRow);

          const tbody = createElement('tbody');
          const tbodyFrag = document.createDocumentFragment();

          // Update local data state with current selection information
          const localData = updateLocalDataState(selectionState, processedData.dataMatrix, inSelection);

          localData.forEach((dataEntry) => {
            const tr = createElement('tr', { 'data-row-index': String(dataEntry.row) });

            // Use data from the processed entry
            const { dim, meas } = dataEntry;
            const isSelected = dim.selected;

            const tdDim = createElement(
              'td',
              {
                className: `dim-cell selectable-item${inSelection && isSelected ? ' local-selected' : ''}`,
                role: 'button',
                tabindex: '0',
                'data-q-elem': String(dim.elem),
                'aria-label': `Select ${dim.text}`,
              },
              dim.text
            );

            // Optional measure
            const tdMeas = createElement('td', { className: 'meas-cell' }, meas.text);

            tr.appendChild(tdDim);
            tr.appendChild(tdMeas);
            tbodyFrag.appendChild(tr);
          });

          table.appendChild(thead);
          tbody.appendChild(tbodyFrag);
          table.appendChild(tbody);
          content.appendChild(table);
          container.appendChild(content);

          // Update persisted local selection state and record current data
          updateLastSelectionState(selectionState, inSelection);

          // Store current data externally without attaching properties to DOM nodes
          setContainerData(container, localData);

          // Ensure container remains attached (append only if not already present)
          ensureContainerAttached(element, container);

          // Event delegation: attach once on tbody
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
              const rowEntry = getRowEntry(selectionState, elem);

              // Update local state using state management functions
              const { isSelected } = toggleElementSelection(selectionState, elem, inSelection);

              // Update the row entry if it exists
              if (rowEntry) {
                rowEntry.dim.selected = isSelected;
              }

              // Update cell visual state
              if (isSelected) {
                cell.classList.add('local-selected');
              } else {
                cell.classList.remove('local-selected');
              }

              // Then call backend selection API
              if (selections && typeof selections.select === 'function') {
                if (!inSelection && typeof selections.begin === 'function') {
                  await selections.begin(getHypercubePath());
                }
                await selections.select({
                  method: 'selectHyperCubeValues',
                  params: [getHypercubePath(), getDimensionColumnIndex(), [elem], inSelection],
                });
              }

              // If no selections remain in this session, exit selection mode (after select)
              if (inSelection && isSelectionSessionEmpty(selectionState)) {
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
