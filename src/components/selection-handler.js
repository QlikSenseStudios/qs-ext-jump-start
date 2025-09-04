/**
 * Selection handler component for managing user interactions and Qlik selections
 */

import {
  getRowEntry,
  toggleElementSelection,
  isSelectionSessionEmpty,
  getHypercubePath,
  getDimensionColumnIndex,
} from '../state';

/**
 * Creates and attaches selection event handlers to a table body.
 * @param {HTMLTableSectionElement} tbody - The table body element
 * @param {Object} config - Selection configuration
 * @param {Object} config.selectionState - The selection state object
 * @param {boolean} config.inSelection - Whether currently in selection mode
 * @param {Object} config.selections - Qlik selections API object
 * @returns {Function} Cleanup function to remove event listeners
 */
export function attachSelectionHandlers(tbody, { selectionState, inSelection, selections }) {
  /**
   * Handles click/keyboard activation from a dimension cell.
   * Updates Sense selections and local selection session state.
   * @param {HTMLElement} cell - The clicked/focused dimension cell
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
      updateCellVisualState(cell, isSelected);

      // Then call backend selection API
      await handleQlikSelection(selections, elem, inSelection);

      // If no selections remain in this session, exit selection mode (after select)
      if (inSelection && isSelectionSessionEmpty(selectionState)) {
        await exitSelectionMode(selections);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Selection failed', err);
    }
  };

  // Event handlers
  const clickHandler = (e) => {
    const cell = e.target.closest && e.target.closest('.dim-cell');
    if (cell && tbody.contains(cell)) {
      activateFromCell(cell);
    }
  };

  const keydownHandler = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    const cell = e.target.closest && e.target.closest('.dim-cell');
    if (cell && tbody.contains(cell)) {
      e.preventDefault();
      activateFromCell(cell);
    }
  };

  // Attach event listeners
  tbody.addEventListener('click', clickHandler);
  tbody.addEventListener('keydown', keydownHandler);

  // Return cleanup function
  return () => {
    tbody.removeEventListener('click', clickHandler);
    tbody.removeEventListener('keydown', keydownHandler);
  };
}

/**
 * Updates the visual state of a cell based on selection status.
 * @param {HTMLElement} cell - The cell element to update
 * @param {boolean} isSelected - Whether the cell is selected
 */
function updateCellVisualState(cell, isSelected) {
  if (isSelected) {
    cell.classList.add('local-selected');
  } else {
    cell.classList.remove('local-selected');
  }
}

/**
 * Handles Qlik Sense selection API calls.
 * @param {Object} selections - Qlik selections API object
 * @param {number} elem - Element number to select
 * @param {boolean} inSelection - Whether currently in selection mode
 */
async function handleQlikSelection(selections, elem, inSelection) {
  if (selections && typeof selections.select === 'function') {
    if (!inSelection && typeof selections.begin === 'function') {
      await selections.begin(getHypercubePath());
    }
    await selections.select({
      method: 'selectHyperCubeValues',
      params: [getHypercubePath(), getDimensionColumnIndex(), [elem], inSelection],
    });
  }
}

/**
 * Exits selection mode when no selections remain.
 * @param {Object} selections - Qlik selections API object
 */
async function exitSelectionMode(selections) {
  try {
    if (selections && typeof selections.cancel === 'function') {
      await selections.cancel();
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to exit selection mode', e);
  }
}
