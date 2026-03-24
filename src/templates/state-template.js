/**
 * Extension state templates for standardized UI patterns
 * Provides templates for different extension states with consistent structure
 */

import {
  createErrorComponent,
  createHeaderComponent,
  createTableComponent,
} from '../components';
import { createBaseTemplate, createLayoutTemplate } from './base-template';

/**
 * @typedef {Object} ExtensionStateConfig
 * @property {boolean} [inSelection=false] - Whether currently in selection mode
 * @property {Object} [containerConfig] - Configuration for the container
 * @property {Object} [layoutConfig] - Configuration for the layout
 */

/**
 * Creates an error state template with consistent structure.
 * @param {Object} config - Error state configuration
 * @param {string} [config.title] - Error title
 * @param {string} [config.message] - Error message
 * @param {ExtensionStateConfig} [stateConfig={}] - Extension state configuration
 * @returns {HTMLDivElement} The error state template
 */
export function createErrorStateTemplate(config = {}, stateConfig = {}) {
  const { title, message } = config;
  const { containerConfig = {} } = stateConfig;

  // Create the error component
  const errorComponent = createErrorComponent(title, message);

  // Wrap in base template for consistency
  const container = createBaseTemplate({
    className: 'extension-error-state',
    role: 'main',
    ariaLabel: 'Error state',
    ...containerConfig,
  });

  container.appendChild(errorComponent);
  return container;
}

/**
 * Creates a data state template with header and table components.
 * @param {Object} config - Data state configuration
 * @param {string} [config.title='Hello World!'] - Header title
 * @param {Object} config.tableConfig - Table configuration
 * @param {string} config.tableConfig.dimHeader - Dimension header
 * @param {string} config.tableConfig.measHeader - Measure header
 * @param {Array} config.tableConfig.localData - Local data array
 * @param {ExtensionStateConfig} [stateConfig={}] - Extension state configuration
 * @returns {{ container: HTMLDivElement, tbody: HTMLTableSectionElement }} The data state template and table body
 */
export function createDataStateTemplate(config, stateConfig = {}) {
  const { title = 'Hello World!', tableConfig } = config;
  const { inSelection = false, containerConfig = {}, layoutConfig = {} } = stateConfig;

  // Create header component
  const headerComponent = createHeaderComponent(title);

  // Create table component
  const { table, tbody } = createTableComponent({
    ...tableConfig,
    inSelection,
  });

  // Create main content area
  const mainContent = createBaseTemplate({
    className: 'content',
    role: 'region',
    ariaLabel: 'Data content',
  });
  mainContent.appendChild(headerComponent);
  mainContent.appendChild(table);

  // Create layout with main content
  const layout = createLayoutTemplate({
    className: 'extension-data-layout',
    main: mainContent,
    ...layoutConfig,
  });

  // Wrap in extension container
  const container = createBaseTemplate({
    className: `extension-container${inSelection ? ' in-selection' : ''}`,
    role: 'main',
    ariaLabel: 'Qlik Sense Extension Content',
    attributes: { tabindex: '0' },
    ...containerConfig,
  });

  container.appendChild(layout);

  return { container, tbody };
}

/**
 * Factory function to create extension state templates based on state type.
 * @param {string} stateType - Type of state ('no-data', 'error', 'data', 'loading')
 * @param {Object} config - State-specific configuration
 * @param {ExtensionStateConfig} [stateConfig={}] - Extension state configuration
 * @returns {HTMLDivElement|Object} The state template (or object with container and tbody for data state)
 */
export function createExtensionStateTemplate(stateType, config, stateConfig = {}) {
  switch (stateType) {
    case 'error':
      return createErrorStateTemplate(config, stateConfig);
    case 'data':
      return createDataStateTemplate(config, stateConfig);
    default:
      throw new Error(`Unknown state type: ${stateType}`);
  }
}
