/**
 * Declarative Configuration Schemas
 * Provides configuration schemas and validation for declarative rendering
 */

/**
 * @typedef {Object} ExtensionRenderConfig
 * @property {string} id - Unique configuration identifier
 * @property {string} name - Human-readable configuration name
 * @property {string} description - Configuration description
 * @property {RenderConfig} render - Render configuration
 * @property {Object} [defaults] - Default context values
 * @property {Array<string>} [requiredContext] - Required context properties
 */

/**
 * Predefined extension configurations for common scenarios.
 */
export const extensionConfigurations = {
  // Standard data table with header
  dataTableView: {
    id: 'data-table-view',
    name: 'Data Table View',
    description: 'Standard data table with header and responsive layout',
    render: {
      layout: 'single',
      components: [
        {
          id: 'header-section',
          type: 'template',
          template: 'base.createSectionTemplate',
          props: {
            title: '{{title}}',
            className: 'extension-header',
          },
        },
        {
          id: 'data-table',
          type: 'template',
          template: 'dataTable',
          props: {
            responsiveConfig: {
              stackOnMobile: true,
              breakpoints: ['mobile', 'tablet', 'desktop'],
            },
          },
          conditional: {
            condition: 'hasData',
            ifTrue: {
              id: 'table-content',
              type: 'template',
              template: 'table.createResponsiveTableTemplate',
              props: {
                dimHeader: '{{dimHeader}}',
                measHeader: '{{measHeader}}',
                localData: '{{localData}}',
                inSelection: '{{inSelection}}',
              },
            },
            ifFalse: {
              id: 'no-data-message',
              type: 'template',
              template: 'noDataMessage',
              props: {
                dimCount: '{{dimCount}}',
                measCount: '{{measCount}}',
              },
            },
          },
        },
      ],
    },
    defaults: {
      title: 'Hello World!',
      hasData: false,
      inSelection: false,
    },
    requiredContext: ['dimHeader', 'measHeader'],
  },

  // Error state configuration
  errorStateView: {
    id: 'error-state-view',
    name: 'Error State View',
    description: 'Error display with optional retry functionality',
    render: {
      layout: 'single',
      components: [
        {
          id: 'error-display',
          type: 'template',
          template: 'errorDisplay',
          props: {
            title: '{{errorTitle}}',
            message: '{{errorMessage}}',
            showRetry: true,
            showDetails: false,
          },
        },
      ],
    },
    defaults: {
      errorTitle: 'Extension Error',
      errorMessage: 'An error occurred while rendering the extension.',
    },
    requiredContext: [],
  },

  // Loading state configuration
  loadingStateView: {
    id: 'loading-state-view',
    name: 'Loading State View',
    description: 'Loading spinner with customizable message',
    render: {
      layout: 'single',
      components: [
        {
          id: 'loading-spinner',
          type: 'template',
          template: 'loadingSpinner',
          props: {
            message: '{{loadingMessage}}',
            showSpinner: true,
          },
        },
      ],
    },
    defaults: {
      loadingMessage: 'Loading data...',
    },
    requiredContext: [],
  },

  // Dashboard-style grid layout
  dashboardView: {
    id: 'dashboard-view',
    name: 'Dashboard Grid View',
    description: 'Grid-based dashboard layout with multiple sections',
    render: {
      layout: 'grid',
      options: {
        columns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
      },
      components: [
        {
          id: 'summary-card',
          type: 'template',
          template: 'base.createCardTemplate',
          props: {
            title: 'Summary',
            className: 'dashboard-summary',
          },
          children: [
            {
              id: 'summary-content',
              type: 'custom',
              props: {
                tag: 'div',
                className: 'summary-metrics',
                content: 'Total Records: {{totalRecords}}',
              },
            },
          ],
        },
        {
          id: 'data-section',
          type: 'template',
          template: 'base.createCardTemplate',
          props: {
            title: 'Data View',
            className: 'dashboard-data',
          },
          children: [
            {
              id: 'main-table',
              type: 'template',
              template: 'table.createEnhancedTableTemplate',
              props: {
                dimHeader: '{{dimHeader}}',
                measHeader: '{{measHeader}}',
                localData: '{{localData}}',
                sortable: true,
                filterable: true,
              },
            },
          ],
        },
      ],
    },
    defaults: {
      totalRecords: 0,
    },
    requiredContext: ['dimHeader', 'measHeader', 'localData'],
  },

  // Flexible content layout
  flexibleContentView: {
    id: 'flexible-content-view',
    name: 'Flexible Content View',
    description: 'Flexible layout that adapts to content and screen size',
    render: {
      layout: 'flex',
      options: {
        direction: 'column',
        gap: '1rem',
        wrap: 'nowrap',
      },
      components: [
        {
          id: 'header-banner',
          type: 'template',
          template: 'base.createSectionTemplate',
          props: {
            title: '{{title}}',
            className: 'content-header',
          },
          styles: {
            flex: '0 0 auto',
            marginBottom: '1rem',
          },
        },
        {
          id: 'content-area',
          type: 'template',
          template: 'base.createContentWrapper',
          props: {
            className: 'main-content',
          },
          styles: {
            flex: '1 1 auto',
            overflow: 'auto',
          },
          children: [
            {
              id: 'dynamic-content',
              type: 'conditional',
              conditional: {
                condition: 'contentType',
                ifTrue: {
                  id: 'table-content',
                  type: 'template',
                  template: 'table.createPaginatedTableTemplate',
                  props: {
                    dimHeader: '{{dimHeader}}',
                    measHeader: '{{measHeader}}',
                    localData: '{{localData}}',
                    pageSize: 10,
                  },
                },
                ifFalse: {
                  id: 'message-content',
                  type: 'template',
                  template: 'noDataMessage',
                },
              },
            },
          ],
        },
      ],
    },
    defaults: {
      title: 'Extension Content',
      contentType: false,
    },
    requiredContext: [],
  },
};

/**
 * Validates a render configuration against schema requirements.
 * @param {RenderConfig} config - Configuration to validate
 * @returns {Object} Validation result with errors array
 */
export function validateRenderConfig(config) {
  const errors = [];

  // Check required top-level properties
  if (!config.layout) {
    errors.push('Missing required property: layout');
  }

  if (!Array.isArray(config.components)) {
    errors.push('Components must be an array');
  } else {
    // Validate each component
    config.components.forEach((component, index) => {
      const componentErrors = validateComponentConfig(component, `components[${index}]`);
      errors.push(...componentErrors);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a component configuration.
 * @param {ComponentConfig} component - Component to validate
 * @param {string} path - Configuration path for error reporting
 * @returns {Array<string>} Array of validation errors
 */
function validateComponentConfig(component, path) {
  const errors = [];

  if (!component.id) {
    errors.push(`${path}: Missing required property 'id'`);
  }

  if (!component.type) {
    errors.push(`${path}: Missing required property 'type'`);
  }

  if (component.type === 'template' && !component.template) {
    errors.push(`${path}: Template type requires 'template' property`);
  }

  if (component.conditional) {
    if (!component.conditional.condition) {
      errors.push(`${path}: Conditional requires 'condition' property`);
    }
    if (!component.conditional.ifTrue) {
      errors.push(`${path}: Conditional requires 'ifTrue' property`);
    }
  }

  // Validate children recursively
  if (Array.isArray(component.children)) {
    component.children.forEach((child, index) => {
      const childErrors = validateComponentConfig(child, `${path}.children[${index}]`);
      errors.push(...childErrors);
    });
  }

  return errors;
}

/**
 * Processes template strings in configuration with context values.
 * @param {Object} config - Configuration object to process
 * @param {Object} context - Context values for template replacement
 * @returns {Object} Processed configuration
 */
export function processTemplateStrings(config, context) {
  return JSON.parse(
    JSON.stringify(config).replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] !== undefined ? context[key] : match;
    })
  );
}

/**
 * Gets an extension configuration by ID.
 * @param {string} configId - Configuration identifier
 * @returns {ExtensionRenderConfig|null} Configuration or null if not found
 */
export function getExtensionConfig(configId) {
  return extensionConfigurations[configId] || null;
}

/**
 * Lists all available extension configurations.
 * @returns {Array<Object>} Array of configuration summaries
 */
export function listExtensionConfigs() {
  return Object.values(extensionConfigurations).map((config) => ({
    id: config.id,
    name: config.name,
    description: config.description,
    requiredContext: config.requiredContext,
  }));
}

/**
 * Creates a configuration builder for dynamic configuration creation.
 * @param {string} layout - Layout strategy
 * @returns {ConfigurationBuilder} Builder instance
 */
export function createConfigBuilder(layout = 'single') {
  return new ConfigurationBuilder(layout);
}

/**
 * Configuration builder class for dynamic configuration creation.
 */
class ConfigurationBuilder {
  constructor(layout) {
    this.config = {
      layout,
      components: [],
      options: {},
      styles: {},
      events: {},
    };
  }

  /**
   * Adds a component to the configuration.
   * @param {ComponentConfig} component - Component configuration
   * @returns {ConfigurationBuilder} Builder instance for chaining
   */
  addComponent(component) {
    this.config.components.push(component);
    return this;
  }

  /**
   * Sets layout options.
   * @param {Object} options - Layout options
   * @returns {ConfigurationBuilder} Builder instance for chaining
   */
  setOptions(options) {
    this.config.options = { ...this.config.options, ...options };
    return this;
  }

  /**
   * Sets global styles.
   * @param {Object} styles - Style definitions
   * @returns {ConfigurationBuilder} Builder instance for chaining
   */
  setStyles(styles) {
    this.config.styles = { ...this.config.styles, ...styles };
    return this;
  }

  /**
   * Sets event handlers.
   * @param {Object} events - Event handler definitions
   * @returns {ConfigurationBuilder} Builder instance for chaining
   */
  setEvents(events) {
    this.config.events = { ...this.config.events, ...events };
    return this;
  }

  /**
   * Validates and builds the final configuration.
   * @returns {RenderConfig} Built configuration
   * @throws {Error} If configuration is invalid
   */
  build() {
    const validation = validateRenderConfig(this.config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
    return this.config;
  }

  /**
   * Gets the current configuration without validation.
   * @returns {RenderConfig} Current configuration
   */
  getConfig() {
    return this.config;
  }
}
