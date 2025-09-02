/**
 * Render state management for container and DOM tracking
 * Manages stable containers and local data associations
 */

/**
 * Tracks the stable container node attached under each host element.
 * Key: host HTMLElement, Value: container HTMLDivElement
 * @type {WeakMap<HTMLElement, HTMLDivElement>}
 */
const containerByElement = new WeakMap();

/**
 * Associates current local data with a container without attaching properties to DOM nodes.
 * Key: container HTMLDivElement, Value: Array<LocalDataEntry>
 * @type {WeakMap<HTMLDivElement, Array>}
 */
const localDataByContainer = new WeakMap();

/**
 * @typedef {Object} LocalDataEntry
 * @property {number} row - Row index
 * @property {Object} dim - Dimension data
 * @property {string} dim.text - Display text
 * @property {number} dim.elem - Element number
 * @property {boolean} dim.selected - Selection state
 * @property {Object} meas - Measure data
 * @property {string} meas.text - Display text
 */

/**
 * Removes all child nodes from a container element.
 * Safe, small utility to avoid repeating while-firstChild clears.
 * @param {HTMLElement} node - Host element whose children will be removed
 */
export function clearChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

/**
 * Acquires or creates a stable container for the given element.
 * Ensures only one container exists per element.
 * @param {HTMLElement} element - The host element
 * @returns {HTMLDivElement} The stable container
 */
export function ensureContainer(element) {
  let container = containerByElement.get(element);
  if (!container) {
    container = document.createElement('div');
    containerByElement.set(element, container);
    // Remove any existing children before first attach
    clearChildren(element);
    element.appendChild(container);
  }
  return container;
}

/**
 * Gets the existing container for an element, if any.
 * @param {HTMLElement} element - The host element
 * @returns {HTMLDivElement|undefined} The container or undefined
 */
export function getContainer(element) {
  return containerByElement.get(element);
}

/**
 * Removes and forgets a previously attached container for an element.
 * Used before rendering special states (no-data, error) to prevent duplicates.
 * @param {HTMLElement} element - Host root element
 */
export function resetElementContainer(element) {
  const existing = containerByElement.get(element);
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
  containerByElement.delete(element);
  clearChildren(element);
}

/**
 * Updates container attributes for accessibility and state indication.
 * @param {HTMLDivElement} container - The container element
 * @param {boolean} inSelection - Whether currently in selection mode
 */
export function updateContainerState(container, inSelection) {
  container.setAttribute('class', inSelection ? 'extension-container in-selection' : 'extension-container');
  container.setAttribute('role', 'main');
  container.setAttribute('aria-label', 'Qlik Sense Extension Content');
  container.setAttribute('tabindex', '0');
}

/**
 * Associates local data with a container element.
 * @param {HTMLDivElement} container - The container element
 * @param {Array} localData - The local data array
 */
export function setContainerData(container, localData) {
  localDataByContainer.set(container, localData);
}

/**
 * Retrieves local data associated with a container element.
 * @param {HTMLDivElement} container - The container element
 * @returns {Array|undefined} The local data array or undefined
 */
export function getContainerData(container) {
  return localDataByContainer.get(container);
}

/**
 * Ensures the container is properly attached to its parent element.
 * Only appends if not already present to avoid duplicate attachments.
 * @param {HTMLElement} element - The host element
 * @param {HTMLDivElement} container - The container to attach
 */
export function ensureContainerAttached(element, container) {
  if (!container.parentNode) {
    element.appendChild(container);
  }
}
