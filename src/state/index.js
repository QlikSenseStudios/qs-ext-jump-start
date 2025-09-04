/**
 * State management module exports
 * Centralized access to all state management functionality
 */

// Selection state management
export {
  ensureSelectionState,
  enterSelectionMode,
  toggleElementSelection,
  isElementSelected,
  updateLocalDataState,
  getRowEntry,
  isSelectionSessionEmpty,
  updateLastSelectionState,
} from './selection-state';

// Render state management
export {
  clearChildren,
  ensureContainer,
  getContainer,
  resetElementContainer,
  updateContainerState,
  setContainerData,
  getContainerData,
  ensureContainerAttached,
} from './render-state';

// Data state management
export {
  getCounts,
  isInvalidConfig,
  getSelectionInfo,
  getDataMatrix,
  getHeaders,
  processLayoutData,
  getHypercubePath,
  getDimensionColumnIndex,
} from './data-state';
