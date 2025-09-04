/**
 * Selection state management for Qlik Sense extension
 * Handles selection sessions, pending clicks, and element mapping
 */

/**
 * Tracks per-element selection session state to avoid global leakage.
 * Key: host HTMLElement, Value: SelectionState
 * @type {WeakMap<HTMLElement, SelectionState>}
 */
const selectionStateByElement = new WeakMap();

/**
 * @typedef {Object} SelectionState
 * @property {Array} data - Current data array for the element
 * @property {Set<number>} pendingByElem - Clicks made outside selection mode
 * @property {Set<number>} sessionByElem - Selections within current selection mode session
 * @property {boolean} lastInSelection - Previous selection mode state
 * @property {Map<number, number>} elemToRowIndex - Maps element number to row index
 */

/**
 * Ensures a selection state exists for the given element.
 * Creates a new state if none exists.
 * @param {HTMLElement} element - The host element
 * @returns {SelectionState} The selection state for this element
 */
export function ensureSelectionState(element) {
  let state = selectionStateByElement.get(element);
  if (!state) {
    state = {
      data: [],
      pendingByElem: new Set(),
      sessionByElem: new Set(),
      lastInSelection: false,
      elemToRowIndex: new Map(),
    };
    selectionStateByElement.set(element, state);
  }
  return state;
}

/**
 * Handles the transition into selection mode.
 * Starts a fresh session from pending clicks.
 * @param {SelectionState} state - The selection state
 */
export function enterSelectionMode(state) {
  // Entering selection mode: start a fresh session from pending clicks
  state.sessionByElem = new Set(state.pendingByElem);
  state.pendingByElem.clear();
}

/**
 * Updates the selection state for a given element number.
 * @param {SelectionState} state - The selection state
 * @param {number} elem - The element number
 * @param {boolean} inSelection - Whether currently in selection mode
 * @returns {{ wasSelected: boolean, isSelected: boolean }} Selection change info
 */
export function toggleElementSelection(state, elem, inSelection) {
  if (inSelection) {
    const wasSelected = state.sessionByElem.has(elem);
    if (wasSelected) {
      state.sessionByElem.delete(elem);
      return { wasSelected: true, isSelected: false };
    } else {
      state.sessionByElem.add(elem);
      return { wasSelected: false, isSelected: true };
    }
  } else {
    const wasPending = state.pendingByElem.has(elem);
    if (!wasPending) {
      state.pendingByElem.add(elem);
    }
    return { wasSelected: false, isSelected: true };
  }
}

/**
 * Checks if an element is currently selected.
 * @param {SelectionState} state - The selection state
 * @param {number} elem - The element number
 * @param {boolean} inSelection - Whether currently in selection mode
 * @returns {boolean} True if the element is selected
 */
export function isElementSelected(state, elem, inSelection) {
  if (inSelection) {
    return state.sessionByElem.has(elem);
  }
  return state.pendingByElem.has(elem);
}

/**
 * Updates the local data state with current selection information.
 * @param {SelectionState} state - The selection state
 * @param {Array} dataMatrix - The current data matrix
 * @param {boolean} inSelection - Whether currently in selection mode
 * @returns {Array} Updated local data array
 */
export function updateLocalDataState(state, dataMatrix, inSelection) {
  const prevSelected = inSelection ? new Set(state.sessionByElem) : new Set();
  const elemToRowIndex = new Map();
  const localData = [];

  dataMatrix.forEach((row, rowIndex) => {
    // Extract dimension info from row
    const dimCellText = row[0]?.qText || '-';
    const dimElem = row[0]?.qElemNumber ?? -1;
    const isSelected = prevSelected.has(dimElem);

    // Extract measure info
    const measCellText = row[1]?.qText || '-';

    // Map elem -> rowIndex for fast updates
    if (Number.isFinite(dimElem) && dimElem >= 0) {
      elemToRowIndex.set(dimElem, rowIndex);
    }

    // Build local data entry
    localData.push({
      row: rowIndex,
      dim: { text: dimCellText, elem: dimElem, selected: isSelected },
      meas: { text: measCellText },
    });
  });

  // Update state references
  state.data = localData;
  state.elemToRowIndex = elemToRowIndex;

  return localData;
}

/**
 * Finds the cached data row entry for a given qElemNumber.
 * @param {SelectionState} state - The selection state
 * @param {number} elem - qElemNumber for the dimension cell
 * @returns {Object|undefined} The row entry or undefined if not found
 */
export function getRowEntry(state, elem) {
  const idx = state.elemToRowIndex?.get(elem);
  return Number.isInteger(idx) ? state.data[idx] : (state.data || []).find((r) => r.dim.elem === elem);
}

/**
 * Checks if the selection session is empty.
 * @param {SelectionState} state - The selection state
 * @returns {boolean} True if no selections remain in the session
 */
export function isSelectionSessionEmpty(state) {
  return state.sessionByElem.size === 0;
}

/**
 * Updates the last selection mode state.
 * @param {SelectionState} state - The selection state
 * @param {boolean} inSelection - Current selection mode state
 */
export function updateLastSelectionState(state, inSelection) {
  state.lastInSelection = inSelection;
}
