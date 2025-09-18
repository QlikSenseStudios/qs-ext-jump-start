/**
 * State management module
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
  validateConfiguration,
  getSelectionInfo,
  getDataMatrix,
  getHeaders,
  processLayoutData,
  checkDataAvailability,
  getHypercubePath,
  getDimensionColumnIndex,
} from './data-state';
