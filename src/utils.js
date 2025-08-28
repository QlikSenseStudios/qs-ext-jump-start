/**
 * Utility functions for component rendering and data handling.
 * These helpers avoid unsafe patterns and favor explicit, composable APIs.
 */

/**
 * Creates a DOM element with attributes and content.
 * Content may be:
 * - string: assigned via textContent (safe by default)
 * - Node: appended directly
 * - Node[]: each appended
 * - { html: string }: assigned via innerHTML (use only for trusted templates)
 * @param {string} tag HTML tag name
 * @param {Record<string, any>} attributes Attributes to set; use className for classes
 * @param {string | Node | Node[] | {html: string}} [content] Optional content
 * @returns {HTMLElement}
 */
export function createElement(tag, attributes = {}, content) {
  const element = document.createElement(tag);

  Object.entries(attributes || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (key === 'className') {
      element.className = String(value);
    } else {
      element.setAttribute(key, String(value));
    }
  });

  if (content !== undefined) {
    if (typeof content === 'string') {
      element.textContent = content;
    } else if (Array.isArray(content)) {
      content.forEach((node) => node && element.appendChild(node));
    } else if (content && typeof content === 'object' && 'html' in content) {
      // Explicit opt-in for setting innerHTML
      element.innerHTML = String(content.html);
    } else if (content instanceof Node) {
      element.appendChild(content);
    }
  }

  return element;
}

/**
 * Safely gets a nested property value.
 * Supports array indices in the path (e.g., 'a.b.0.c').
 * @template T
 * @param {any} obj Root object
 * @param {string | (string|number)[]} path Dot-separated path or path parts
 * @param {T} [defaultValue=null] Default value when missing
 * @returns {any | T}
 */
export function safeGet(obj, path, defaultValue = null) {
  const parts = Array.isArray(path) ? path : String(path).split('.');
  let cur = obj;
  for (const raw of parts) {
    if (cur === null || cur === undefined) {
      return defaultValue;
    }
    const isIndex = typeof raw === 'number' || /^\d+$/.test(String(raw));
    const key = isIndex ? Number(raw) : raw;
    // Own-property/within-bounds checks
    if (isIndex) {
      if (!Array.isArray(cur) || key < 0 || key >= cur.length) {
        return defaultValue;
      }
    } else if (!Object.prototype.hasOwnProperty.call(cur, key)) {
      return defaultValue;
    }
    cur = cur[key];
  }
  return cur;
}

/**
 * Formats numbers for display.
 * @param {number} value Number to format
 * @param {{decimals?: number, thousands?: string, prefix?: string, suffix?: string}} options Formatting options
 * @returns {string}
 */
export function formatNumber(value, options = {}) {
  const { decimals = 0, thousands = ',', prefix = '', suffix = '' } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  const formatted = Number(value).toFixed(decimals);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);

  return prefix + parts.join('.') + suffix;
}

/**
 * Debounces a function call.
 * @template F extends (...args: any[]) => any
 * @param {F} func Function to debounce
 * @param {number} wait Wait time in milliseconds
 * @returns {F & { cancel: () => void }} Debounced function with cancel()
 */
export function debounce(func, wait) {
  /** @type {any} */
  let timeout;
  const debounced = function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  // @ts-ignore
  return debounced;
}
