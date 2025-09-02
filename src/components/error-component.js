/**
 * Error component for displaying error states with user-friendly messages
 */

import { createElement } from '../utils';

/**
 * Creates a standardized error UI component.
 * @param {string} [title='Unable to load extension'] - Error title
 * @param {string} [message='Please check your data configuration and try again.'] - Error message
 * @returns {HTMLDivElement} The constructed error element
 */
export function createErrorComponent(
  title = 'Unable to load extension',
  message = 'Please check your data configuration and try again.'
) {
  const errorDiv = createElement('div', {
    className: 'error-message',
    role: 'alert',
    'aria-live': 'polite',
  });

  errorDiv.appendChild(createElement('h3', {}, title));
  errorDiv.appendChild(createElement('p', {}, message));

  return errorDiv;
}

/**
 * Appends a standardized error UI to the host element and logs the error.
 * @param {HTMLElement} element - Host container
 * @param {unknown} error - Error object thrown during rendering
 * @param {string} [title] - Optional custom error title
 * @param {string} [message] - Optional custom error message
 */
export function appendErrorToElement(element, error, title, message) {
  const errorComponent = createErrorComponent(title, message);
  element.appendChild(errorComponent);

  // eslint-disable-next-line no-console
  console.error('Extension rendering error:', error);
}
