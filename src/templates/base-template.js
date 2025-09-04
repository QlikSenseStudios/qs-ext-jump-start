/**
 * Base template for common UI patterns and layout structures
 * Provides foundational templates for consistent component composition
 */

import { createElement } from '../utils';

/**
 * @typedef {Object} BaseTemplateConfig
 * @property {string} [className] - CSS class for the container
 * @property {Object} [attributes] - Additional attributes for the container
 * @property {string} [role] - ARIA role for accessibility
 * @property {string} [ariaLabel] - ARIA label for accessibility
 */

/**
 * Creates a base container template with consistent structure and accessibility.
 * @param {BaseTemplateConfig} [config={}] - Template configuration
 * @returns {HTMLDivElement} The base container element
 */
export function createBaseTemplate(config = {}) {
  const { className = 'template-container', attributes = {}, role = 'region', ariaLabel = 'Content area' } = config;

  const container = createElement('div', {
    className,
    role,
    'aria-label': ariaLabel,
    ...attributes,
  });

  return container;
}

/**
 * Creates a content wrapper template for organizing child elements.
 * @param {Object} config - Content wrapper configuration
 * @param {string} [config.className='content-wrapper'] - CSS class for the wrapper
 * @param {HTMLElement[]} [config.children=[]] - Child elements to append
 * @param {Object} [config.attributes={}] - Additional attributes
 * @returns {HTMLDivElement} The content wrapper element
 */
export function createContentWrapper(config = {}) {
  const { className = 'content-wrapper', children = [], attributes = {} } = config;

  const wrapper = createElement('div', {
    className,
    ...attributes,
  });

  children.forEach((child) => {
    if (child instanceof HTMLElement) {
      wrapper.appendChild(child);
    }
  });

  return wrapper;
}

/**
 * Creates a section template with optional header and content areas.
 * @param {Object} config - Section configuration
 * @param {string} [config.className='section'] - CSS class for the section
 * @param {string} [config.title] - Optional section title
 * @param {string} [config.titleTag='h3'] - HTML tag for the title
 * @param {HTMLElement[]} [config.content=[]] - Section content elements
 * @param {Object} [config.attributes={}] - Additional attributes
 * @returns {HTMLElement} The section element
 */
export function createSectionTemplate(config = {}) {
  const { className = 'section', title, titleTag = 'h3', content = [], attributes = {} } = config;

  const section = createElement('section', {
    className,
    ...attributes,
  });

  if (title) {
    const titleElement = createElement(titleTag, { className: 'section-title' }, title);
    section.appendChild(titleElement);
  }

  const contentWrapper = createContentWrapper({
    className: 'section-content',
    children: content,
  });
  section.appendChild(contentWrapper);

  return section;
}

/**
 * Creates a card template for contained content areas.
 * @param {Object} config - Card configuration
 * @param {string} [config.className='card'] - CSS class for the card
 * @param {string} [config.title] - Optional card title
 * @param {HTMLElement[]} [config.content=[]] - Card content elements
 * @param {Object} [config.attributes={}] - Additional attributes
 * @returns {HTMLDivElement} The card element
 */
export function createCardTemplate(config = {}) {
  const { className = 'card', title, content = [], attributes = {} } = config;

  const card = createElement('div', {
    className,
    ...attributes,
  });

  if (title) {
    const header = createElement('div', { className: 'card-header' });
    const titleElement = createElement('h4', { className: 'card-title' }, title);
    header.appendChild(titleElement);
    card.appendChild(header);
  }

  const body = createContentWrapper({
    className: 'card-body',
    children: content,
  });
  card.appendChild(body);

  return card;
}

/**
 * Creates a flexible layout template with configurable regions.
 * @param {Object} config - Layout configuration
 * @param {string} [config.className='layout'] - CSS class for the layout
 * @param {HTMLElement} [config.header] - Header element
 * @param {HTMLElement} [config.main] - Main content element
 * @param {HTMLElement} [config.footer] - Footer element
 * @param {Object} [config.attributes={}] - Additional attributes
 * @returns {HTMLDivElement} The layout element
 */
export function createLayoutTemplate(config = {}) {
  const { className = 'layout', header, main, footer, attributes = {} } = config;

  const layout = createElement('div', {
    className,
    ...attributes,
  });

  if (header) {
    const headerWrapper = createElement('div', { className: 'layout-header' });
    headerWrapper.appendChild(header);
    layout.appendChild(headerWrapper);
  }

  if (main) {
    const mainWrapper = createElement('div', { className: 'layout-main' });
    mainWrapper.appendChild(main);
    layout.appendChild(mainWrapper);
  }

  if (footer) {
    const footerWrapper = createElement('div', { className: 'layout-footer' });
    footerWrapper.appendChild(footer);
    layout.appendChild(footerWrapper);
  }

  return layout;
}
