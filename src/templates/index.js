/**
 * Template System Index
 * Centralized access point for all template modules
 * Provides factory functions and template utilities
 */

// Import all template modules
import {
  createBaseTemplate,
  createSectionTemplate,
  createContentWrapper,
  createCardTemplate,
  createLayoutTemplate,
} from './base-template';

import {
  createExtensionStateTemplate,
  createDataStateTemplate,
  createErrorStateTemplate,
  createLoadingStateTemplate,
  createNoDataStateTemplate,
} from './state-template';

import {
  createEnhancedTableTemplate,
  createResponsiveTableTemplate,
  createPaginatedTableTemplate,
  createGroupedTableTemplate,
} from './table-template';

/**
 * @typedef {Object} TemplateRegistry
 * @property {Object} base - Base template functions
 * @property {Object} state - State-specific template functions
 * @property {Object} table - Table template functions
 * @property {Object} utils - Template utility functions
 */

/**
 * Template registry providing organized access to all templates.
 * @type {TemplateRegistry}
 */
export const templates = {
  // Base templates for fundamental UI structures
  base: {
    createBaseTemplate,
    createSectionTemplate,
    createContentWrapper,
    createCardTemplate,
    createLayoutTemplate,
  },

  // State-specific templates for different extension states
  state: {
    createExtensionStateTemplate,
    createDataStateTemplate,
    createErrorStateTemplate,
    createLoadingStateTemplate,
    createNoDataStateTemplate,
  },

  // Table templates for complex data display
  table: {
    createEnhancedTableTemplate,
    createResponsiveTableTemplate,
    createPaginatedTableTemplate,
    createGroupedTableTemplate,
  },

  // Template utilities
  utils: {
    createTemplate,
    createTemplateFromConfig,
    combineTemplates,
    createTemplateFactory,
  },
};

/**
 * @typedef {Object} TemplateConfig
 * @property {string} type - Template type ('base', 'state', 'table')
 * @property {string} variant - Template variant within the type
 * @property {Object} config - Configuration object for the template
 */

/**
 * Universal template factory function.
 * Creates templates based on type and variant specification.
 * @param {TemplateConfig} templateConfig - Template configuration
 * @returns {HTMLElement|Object} Created template element or template object
 */
export function createTemplate(templateConfig) {
  const { type, variant, config = {} } = templateConfig;

  // Validate template type
  if (!templates[type]) {
    throw new Error(`Unknown template type: ${type}`);
  }

  // Get the template function
  const templateFunction = templates[type][variant];
  if (!templateFunction) {
    throw new Error(`Unknown template variant: ${variant} for type: ${type}`);
  }

  // Create and return the template
  return templateFunction(config);
}

/**
 * Creates a template from a configuration object.
 * Supports nested template configurations and composition.
 * @param {Object} config - Template configuration
 * @param {string} config.template - Template identifier in "type.variant" format
 * @param {Object} [config.props={}] - Template properties
 * @param {Array} [config.children=[]] - Child template configurations
 * @returns {HTMLElement} Created template element
 */
export function createTemplateFromConfig(config) {
  const { template, props = {}, children = [] } = config;

  if (!template) {
    throw new Error('Template identifier is required');
  }

  // Parse template identifier
  const [type, variant] = template.split('.');
  if (!type || !variant) {
    throw new Error(`Invalid template identifier: ${template}. Expected format: "type.variant"`);
  }

  // Create the template
  const templateElement = createTemplate({
    type,
    variant,
    config: props,
  });

  // Handle template object (like table templates that return multiple elements)
  const containerElement = templateElement.wrapper || templateElement;

  // Process children
  children.forEach((childConfig) => {
    const childElement = createTemplateFromConfig(childConfig);
    containerElement.appendChild(childElement);
  });

  return templateElement;
}

/**
 * Combines multiple templates into a single container.
 * @param {Array<TemplateConfig>} templateConfigs - Array of template configurations
 * @param {Object} [containerConfig={}] - Configuration for the container element
 * @returns {HTMLElement} Container element with all templates
 */
export function combineTemplates(templateConfigs, containerConfig = {}) {
  const container = createBaseTemplate({
    className: 'template-container',
    ...containerConfig,
  });

  templateConfigs.forEach((templateConfig) => {
    const template = createTemplate(templateConfig);
    const element = template.wrapper || template;
    container.appendChild(element);
  });

  return container;
}

/**
 * Creates a template factory function for a specific template type and variant.
 * @param {string} type - Template type
 * @param {string} variant - Template variant
 * @returns {Function} Factory function that creates templates with the specified type and variant
 */
export function createTemplateFactory(type, variant) {
  return (config = {}) => createTemplate({ type, variant, config });
}

/**
 * @typedef {Object} PresetTemplateConfig
 * @property {string} name - Preset name
 * @property {TemplateConfig} config - Template configuration
 * @property {Object} [defaultProps] - Default properties for the preset
 */

/**
 * Preset template configurations for common use cases.
 * @type {Object<string, PresetTemplateConfig>}
 */
export const templatePresets = {
  // Extension state presets
  dataTable: {
    name: 'Data Table',
    config: {
      type: 'table',
      variant: 'createResponsiveTableTemplate',
    },
    defaultProps: {
      responsiveConfig: {
        breakpoints: ['mobile', 'tablet', 'desktop'],
        stackOnMobile: true,
      },
    },
  },

  errorDisplay: {
    name: 'Error Display',
    config: {
      type: 'state',
      variant: 'createErrorStateTemplate',
    },
    defaultProps: {
      showRetry: true,
      showDetails: false,
    },
  },

  loadingSpinner: {
    name: 'Loading Spinner',
    config: {
      type: 'state',
      variant: 'createLoadingStateTemplate',
    },
    defaultProps: {
      style: 'spinner',
      message: 'Loading data...',
    },
  },

  noDataMessage: {
    name: 'No Data Message',
    config: {
      type: 'state',
      variant: 'createNoDataStateTemplate',
    },
    defaultProps: {
      showActions: true,
      customMessage: null,
    },
  },

  // Layout presets
  centeredContent: {
    name: 'Centered Content',
    config: {
      type: 'base',
      variant: 'createLayoutTemplate',
    },
    defaultProps: {
      layout: 'center',
      padding: 'medium',
    },
  },

  sidebarLayout: {
    name: 'Sidebar Layout',
    config: {
      type: 'base',
      variant: 'createLayoutTemplate',
    },
    defaultProps: {
      layout: 'sidebar',
      sidebarPosition: 'left',
    },
  },
};

/**
 * Creates a template from a preset configuration.
 * @param {string} presetName - Name of the preset to use
 * @param {Object} [overrideProps={}] - Properties to override preset defaults
 * @returns {HTMLElement|Object} Created template element or template object
 */
export function createTemplateFromPreset(presetName, overrideProps = {}) {
  const preset = templatePresets[presetName];
  if (!preset) {
    throw new Error(`Unknown template preset: ${presetName}`);
  }

  const config = {
    ...preset.config,
    config: {
      ...preset.defaultProps,
      ...overrideProps,
    },
  };

  return createTemplate(config);
}

/**
 * Gets all available template types and variants.
 * @returns {Object} Object containing all available templates organized by type
 */
export function getAvailableTemplates() {
  const available = {};

  Object.keys(templates).forEach((type) => {
    if (type !== 'utils') {
      available[type] = Object.keys(templates[type]);
    }
  });

  return available;
}

/**
 * Gets all available template presets.
 * @returns {Array<string>} Array of preset names
 */
export function getAvailablePresets() {
  return Object.keys(templatePresets);
}

// Export template functions for direct access
export {
  createBaseTemplate,
  createSectionTemplate,
  createContentWrapper,
  createCardTemplate,
  createLayoutTemplate,
} from './base-template';

export {
  createExtensionStateTemplate,
  createDataStateTemplate,
  createErrorStateTemplate,
  createLoadingStateTemplate,
  createNoDataStateTemplate,
} from './state-template';

export {
  createEnhancedTableTemplate,
  createResponsiveTableTemplate,
  createPaginatedTableTemplate,
  createGroupedTableTemplate,
} from './table-template';

// Export the default template function
export default createTemplate;
