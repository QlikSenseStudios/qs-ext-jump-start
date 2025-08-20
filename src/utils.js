/**
 * Utility functions for component rendering and data handling
 */

/**
 * Creates a DOM element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {object} attributes - Object of attributes to set
 * @param {string|HTMLElement} content - Content to add to the element
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  if (typeof content === 'string') {
    element.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    element.appendChild(content);
  }
  
  return element;
}

/**
 * Safely gets nested object properties
 * @param {object} obj - Object to traverse
 * @param {string} path - Dot-separated path
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} Value at path or default value
 */
export function safeGet(obj, path, defaultValue = null) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
}

/**
 * Formats numbers for display
 * @param {number} value - Number to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted number string
 */
export function formatNumber(value, options = {}) {
  const {
    decimals = 0,
    thousands = ',',
    prefix = '',
    suffix = '',
  } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  
  const formatted = Number(value).toFixed(decimals);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  
  return prefix + parts.join('.') + suffix;
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
