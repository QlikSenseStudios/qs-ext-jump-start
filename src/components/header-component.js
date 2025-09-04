/**
 * Header component for the extension content area
 */

import { createElement } from '../utils';

/**
 * Creates the main header component for the extension.
 * @param {string} [title='Hello World!'] - The header title
 * @param {Object} [options={}] - Header options
 * @param {string} [options.className='content'] - CSS class for the header container
 * @param {string} [options.titleTag='h2'] - HTML tag for the title element
 * @returns {HTMLDivElement} The constructed header content element
 */
export function createHeaderComponent(title = 'Hello World!', options = {}) {
  const { className = 'content', titleTag = 'h2' } = options;

  const content = createElement('div', { className });
  const heading = createElement(titleTag, {}, title);
  content.appendChild(heading);

  return content;
}

/**
 * Creates a simple title element.
 * @param {string} title - The title text
 * @param {string} [tag='h2'] - The HTML tag to use
 * @param {Object} [attributes={}] - Additional attributes for the title element
 * @returns {HTMLElement} The title element
 */
export function createTitleElement(title, tag = 'h2', attributes = {}) {
  return createElement(tag, attributes, title);
}
