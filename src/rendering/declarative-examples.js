/**
 * Declarative Rendering Examples
 * Example configurations demonstrating declarative rendering capabilities
 */

import { createConfigBuilder } from './declarative-config';

/**
 * Example configurations for common extension scenarios.
 */
export const examples = {
  // Simple data table with basic configuration
  simpleDataTable: {
    id: 'simple-data-table',
    name: 'Simple Data Table',
    description: 'Basic data table with header',
    render: {
      layout: 'single',
      components: [
        {
          id: 'main-header',
          type: 'template',
          template: 'base.createSectionTemplate',
          props: {
            title: 'Extension Data',
            className: 'main-header',
          },
        },
        {
          id: 'data-table',
          type: 'conditional',
          conditional: {
            condition: 'hasData',
            ifTrue: {
              id: 'table-view',
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
              id: 'no-data-view',
              type: 'template',
              template: 'state.createNoDataStateTemplate',
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
      hasData: false,
    },
  },

  // Card-based layout with statistics
  cardLayout: {
    id: 'card-layout',
    name: 'Card Layout',
    description: 'Card-based layout with summary statistics',
    render: {
      layout: 'grid',
      options: {
        columns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
      },
      components: [
        {
          id: 'summary-card',
          type: 'template',
          template: 'base.createCardTemplate',
          props: {
            title: 'Summary',
            className: 'summary-card',
          },
          children: [
            {
              id: 'record-count',
              type: 'custom',
              props: {
                tag: 'div',
                className: 'metric',
                content: 'Records: {{totalRecords}}',
              },
            },
            {
              id: 'dimension-info',
              type: 'custom',
              props: {
                tag: 'div',
                className: 'metric',
                content: 'Dimensions: {{dimCount}}',
              },
            },
          ],
        },
        {
          id: 'data-card',
          type: 'template',
          template: 'base.createCardTemplate',
          props: {
            title: 'Data',
            className: 'data-card',
          },
          children: [
            {
              id: 'data-content',
              type: 'conditional',
              conditional: {
                condition: 'hasData',
                ifTrue: {
                  id: 'data-table',
                  type: 'template',
                  template: 'table.createEnhancedTableTemplate',
                  props: {
                    dimHeader: '{{dimHeader}}',
                    measHeader: '{{measHeader}}',
                    localData: '{{localData}}',
                    sortable: true,
                  },
                },
                ifFalse: {
                  id: 'no-data-message',
                  type: 'custom',
                  props: {
                    tag: 'div',
                    className: 'no-data-message',
                    content: 'No data available',
                  },
                },
              },
            },
          ],
        },
      ],
    },
    defaults: {
      totalRecords: 0,
      dimCount: 0,
      hasData: false,
    },
  },

  // Flexible sidebar layout
  sidebarLayout: {
    id: 'sidebar-layout',
    name: 'Sidebar Layout',
    description: 'Two-column layout with sidebar and main content',
    render: {
      layout: 'grid',
      options: {
        columns: '250px 1fr',
        gap: '1rem',
      },
      components: [
        {
          id: 'sidebar',
          type: 'template',
          template: 'base.createSectionTemplate',
          props: {
            className: 'sidebar',
            title: 'Information',
          },
          children: [
            {
              id: 'info-panel',
              type: 'custom',
              props: {
                tag: 'div',
                className: 'info-panel',
              },
              children: [
                {
                  id: 'status',
                  type: 'custom',
                  props: {
                    tag: 'div',
                    className: 'status',
                    content: 'Status: {{extensionState}}',
                  },
                },
                {
                  id: 'selection-info',
                  type: 'conditional',
                  conditional: {
                    condition: 'inSelection',
                    ifTrue: {
                      id: 'selection-active',
                      type: 'custom',
                      props: {
                        tag: 'div',
                        className: 'selection-active',
                        content: 'Selection Mode Active',
                      },
                    },
                    ifFalse: {
                      id: 'selection-inactive',
                      type: 'custom',
                      props: {
                        tag: 'div',
                        className: 'selection-inactive',
                        content: 'Normal Mode',
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'main-content',
          type: 'template',
          template: 'base.createLayoutTemplate',
          props: {
            className: 'main-content',
          },
          children: [
            {
              id: 'content-header',
              type: 'template',
              template: 'base.createSectionTemplate',
              props: {
                title: '{{title}}',
                className: 'content-header',
              },
            },
            {
              id: 'content-body',
              type: 'conditional',
              conditional: {
                condition: 'hasData',
                ifTrue: {
                  id: 'paginated-table',
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
                  id: 'empty-state',
                  type: 'template',
                  template: 'state.createNoDataStateTemplate',
                  props: {
                    dimCount: '{{dimCount}}',
                    measCount: '{{measCount}}',
                  },
                },
              },
            },
          ],
        },
      ],
    },
    defaults: {
      title: 'Extension Content',
      extensionState: 'no-data',
      hasData: false,
      inSelection: false,
    },
  },
};

/**
 * Creates a configuration using the builder pattern.
 * @param {string} type - Configuration type ('simple', 'card', 'sidebar', 'custom')
 * @param {Object} options - Configuration options
 * @returns {Object} Built configuration
 */
export function createExampleConfig(type, options = {}) {
  switch (type) {
    case 'simple':
      return createSimpleConfig(options);
    case 'card':
      return createCardConfig(options);
    case 'sidebar':
      return createSidebarConfig(options);
    case 'custom':
      return createCustomConfig(options);
    default:
      throw new Error(`Unknown configuration type: ${type}`);
  }
}

/**
 * Creates a simple table configuration.
 * @param {Object} options - Configuration options
 * @returns {Object} Simple configuration
 */
function createSimpleConfig(options = {}) {
  const { title = 'Data Table', responsive = true } = options;

  return createConfigBuilder('single')
    .addComponent({
      id: 'header',
      type: 'template',
      template: 'base.createSectionTemplate',
      props: { title, className: 'main-header' },
    })
    .addComponent({
      id: 'table',
      type: 'conditional',
      conditional: {
        condition: 'hasData',
        ifTrue: {
          id: 'data-table',
          type: 'template',
          template: responsive ? 'table.createResponsiveTableTemplate' : 'table.createEnhancedTableTemplate',
          props: {
            dimHeader: '{{dimHeader}}',
            measHeader: '{{measHeader}}',
            localData: '{{localData}}',
          },
        },
        ifFalse: {
          id: 'no-data',
          type: 'template',
          template: 'state.createNoDataStateTemplate',
          props: {
            dimCount: '{{dimCount}}',
            measCount: '{{measCount}}',
          },
        },
      },
    })
    .build();
}

/**
 * Creates a card-based configuration.
 * @param {Object} options - Configuration options
 * @returns {Object} Card configuration
 */
function createCardConfig(options = {}) {
  const { columns = 'repeat(auto-fit, minmax(300px, 1fr))', showSummary = true } = options;

  const builder = createConfigBuilder('grid').setOptions({ columns, gap: '1rem' });

  if (showSummary) {
    builder.addComponent({
      id: 'summary',
      type: 'template',
      template: 'base.createCardTemplate',
      props: { title: 'Summary', className: 'summary-card' },
      children: [
        {
          id: 'metrics',
          type: 'custom',
          props: {
            tag: 'div',
            className: 'metrics',
            content: 'Total: {{totalRecords}} records',
          },
        },
      ],
    });
  }

  builder.addComponent({
    id: 'data-card',
    type: 'template',
    template: 'base.createCardTemplate',
    props: { title: 'Data', className: 'data-card' },
    children: [
      {
        id: 'table-container',
        type: 'conditional',
        conditional: {
          condition: 'hasData',
          ifTrue: {
            id: 'enhanced-table',
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
          ifFalse: {
            id: 'empty-card',
            type: 'custom',
            props: {
              tag: 'div',
              className: 'empty-state',
              content: 'Configure dimensions and measures to see data',
            },
          },
        },
      },
    ],
  });

  return builder.build();
}

/**
 * Creates a sidebar configuration.
 * @param {Object} options - Configuration options
 * @returns {Object} Sidebar configuration
 */
function createSidebarConfig(options = {}) {
  const { sidebarWidth = '250px', showInfo = true } = options;

  const builder = createConfigBuilder('grid').setOptions({
    columns: `${sidebarWidth} 1fr`,
    gap: '1rem',
  });

  if (showInfo) {
    builder.addComponent({
      id: 'sidebar',
      type: 'template',
      template: 'base.createSectionTemplate',
      props: { title: 'Info', className: 'sidebar' },
      children: [
        {
          id: 'status',
          type: 'custom',
          props: {
            tag: 'div',
            className: 'status-info',
            content: 'Mode: {{inSelection ? "Selection" : "Normal"}}',
          },
        },
      ],
    });
  }

  builder.addComponent({
    id: 'main-area',
    type: 'template',
    template: 'base.createLayoutTemplate',
    props: { className: 'main-content' },
    children: [
      {
        id: 'content',
        type: 'conditional',
        conditional: {
          condition: 'hasData',
          ifTrue: {
            id: 'paginated-table',
            type: 'template',
            template: 'table.createPaginatedTableTemplate',
            props: {
              dimHeader: '{{dimHeader}}',
              measHeader: '{{measHeader}}',
              localData: '{{localData}}',
              pageSize: 15,
            },
          },
          ifFalse: {
            id: 'no-data-main',
            type: 'template',
            template: 'state.createNoDataStateTemplate',
            props: {
              dimCount: '{{dimCount}}',
              measCount: '{{measCount}}',
            },
          },
        },
      },
    ],
  });

  return builder.build();
}

/**
 * Creates a custom configuration using the builder.
 * @param {Object} options - Configuration options
 * @returns {Object} Custom configuration
 */
function createCustomConfig(options = {}) {
  const { layout = 'single', components = [], layoutOptions = {}, styles = {} } = options;

  const builder = createConfigBuilder(layout);

  if (Object.keys(layoutOptions).length > 0) {
    builder.setOptions(layoutOptions);
  }

  if (Object.keys(styles).length > 0) {
    builder.setStyles(styles);
  }

  components.forEach((component) => {
    builder.addComponent(component);
  });

  return builder.build();
}

/**
 * Gets example configurations by category.
 * @param {string} [category] - Optional category filter
 * @returns {Array<Object>} Example configurations
 */
export function getExampleConfigs(category = null) {
  const configs = Object.values(examples);

  if (!category) {
    return configs;
  }

  return configs.filter((config) => config.description.toLowerCase().includes(category.toLowerCase()));
}

/**
 * Validates an example configuration.
 * @param {string} exampleId - Example identifier
 * @returns {Object} Validation result
 */
export function validateExample(exampleId) {
  const example = examples[exampleId];

  if (!example) {
    return {
      valid: false,
      errors: [`Example not found: ${exampleId}`],
    };
  }

  return {
    valid: true,
    errors: [],
    example,
  };
}
