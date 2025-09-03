/**
 * Declarative Rendering System
 * Configuration-driven UI composition using template foundation
 * Enables dynamic UI generation from JSON configurations
 */

import { createElement } from '../utils';
import { createTemplate, createTemplateFromConfig, templatePresets } from '../templates';

/**
 * @typedef {Object} RenderConfig
 * @property {string} layout - Layout strategy ('single', 'grid', 'flex', 'auto')
 * @property {Array<ComponentConfig>} components - Component configurations
 * @property {Object} [options] - Rendering options
 * @property {Object} [styles] - Custom styles
 * @property {Object} [events] - Event handlers
 */

/**
 * @typedef {Object} ComponentConfig
 * @property {string} id - Unique component identifier
 * @property {string} type - Component type ('template', 'custom', 'conditional')
 * @property {string} template - Template identifier (for template type)
 * @property {Object} [props] - Component properties
 * @property {Array<ComponentConfig>} [children] - Child components
 * @property {ConditionalConfig} [conditional] - Conditional rendering config
 * @property {GridConfig} [grid] - Grid positioning config
 * @property {Object} [styles] - Component-specific styles
 */

/**
 * @typedef {Object} ConditionalConfig
 * @property {Function|string} condition - Condition function or expression
 * @property {ComponentConfig} ifTrue - Component to render if true
 * @property {ComponentConfig} [ifFalse] - Component to render if false
 */

/**
 * @typedef {Object} GridConfig
 * @property {number} [row] - Grid row position
 * @property {number} [col] - Grid column position
 * @property {number} [rowSpan] - Number of rows to span
 * @property {number} [colSpan] - Number of columns to span
 */

/**
 * Main declarative renderer class for configuration-driven UI composition.
 */
export class DeclarativeRenderer {
  constructor() {
    this.componentCache = new Map();
    this.eventHandlers = new Map();
    this.renderContext = {};
  }

  /**
   * Renders a complete UI from a declarative configuration.
   * @param {RenderConfig} config - Render configuration
   * @param {HTMLElement} container - Target container element
   * @param {Object} [context={}] - Rendering context data
   * @returns {HTMLElement} The rendered container
   */
  render(config, container, context = {}) {
    this.renderContext = { ...context };

    // Clear existing content
    this.clearContainer(container);

    // Create main layout container
    const layoutContainer = this.createLayoutContainer(config.layout, config.options);

    // Render all components
    const renderedComponents = this.renderComponents(config.components);

    // Apply layout strategy
    this.applyLayout(layoutContainer, renderedComponents, config.layout);

    // Apply styles and events
    this.applyStyles(layoutContainer, config.styles);
    this.attachEvents(layoutContainer, config.events);

    container.appendChild(layoutContainer);
    return layoutContainer;
  }

  /**
   * Creates the main layout container based on strategy.
   * @param {string} layout - Layout strategy
   * @param {Object} [options={}] - Layout options
   * @returns {HTMLElement} Layout container
   */
  createLayoutContainer(layout, options = {}) {
    const { className = 'declarative-layout', attributes = {} } = options;

    switch (layout) {
      case 'grid':
        return createElement('div', {
          className: `${className} layout-grid`,
          style: {
            display: 'grid',
            gridTemplateColumns: options.columns || 'repeat(auto-fit, minmax(250px, 1fr))',
            gridGap: options.gap || '1rem',
          },
          ...attributes,
        });

      case 'flex':
        return createElement('div', {
          className: `${className} layout-flex`,
          style: {
            display: 'flex',
            flexDirection: options.direction || 'row',
            gap: options.gap || '1rem',
            flexWrap: options.wrap || 'wrap',
          },
          ...attributes,
        });

      case 'single':
        return createElement('div', {
          className: `${className} layout-single`,
          ...attributes,
        });

      case 'auto':
      default:
        return createElement('div', {
          className: `${className} layout-auto`,
          ...attributes,
        });
    }
  }

  /**
   * Renders an array of component configurations.
   * @param {Array<ComponentConfig>} components - Component configurations
   * @returns {Array<HTMLElement>} Rendered components
   */
  renderComponents(components) {
    return components.map((componentConfig) => this.renderComponent(componentConfig));
  }

  /**
   * Renders a single component from configuration.
   * @param {ComponentConfig} componentConfig - Component configuration
   * @returns {HTMLElement} Rendered component
   */
  renderComponent(componentConfig) {
    const { id, type, conditional } = componentConfig;

    // Handle conditional rendering
    if (conditional) {
      return this.renderConditional(componentConfig);
    }

    // Check component cache
    if (this.componentCache.has(id)) {
      return this.componentCache.get(id);
    }

    let component;

    switch (type) {
      case 'template':
        component = this.renderTemplateComponent(componentConfig);
        break;
      case 'custom':
        component = this.renderCustomComponent(componentConfig);
        break;
      case 'conditional':
        component = this.renderConditional(componentConfig);
        break;
      default:
        component = this.renderFallbackComponent(componentConfig);
    }

    // Apply component-specific styles
    this.applyStyles(component, componentConfig.styles);

    // Cache the component
    if (id) {
      this.componentCache.set(id, component);
    }

    return component;
  }

  /**
   * Renders a template-based component.
   * @param {ComponentConfig} componentConfig - Component configuration
   * @returns {HTMLElement} Rendered template component
   */
  renderTemplateComponent(componentConfig) {
    const { template, props = {}, children = [] } = componentConfig;

    // Check if it's a preset template
    if (templatePresets[template]) {
      const preset = templatePresets[template];
      const mergedProps = { ...preset.defaultProps, ...props };

      return createTemplate({
        ...preset.config,
        config: mergedProps,
      });
    }

    // Create from template configuration
    const templateConfig = {
      template,
      props,
      children: children.map((child) => this.convertToTemplateConfig(child)),
    };

    return createTemplateFromConfig(templateConfig);
  }

  /**
   * Renders a custom component.
   * @param {ComponentConfig} componentConfig - Component configuration
   * @returns {HTMLElement} Rendered custom component
   */
  renderCustomComponent(componentConfig) {
    const { props = {}, children = [] } = componentConfig;
    const { tag = 'div', className = 'custom-component', content = '' } = props;

    const element = createElement(tag, {
      className,
      ...props.attributes,
    });

    if (content) {
      element.textContent = content;
    }

    // Render children
    children.forEach((childConfig) => {
      const childElement = this.renderComponent(childConfig);
      element.appendChild(childElement);
    });

    return element;
  }

  /**
   * Renders a conditional component based on condition evaluation.
   * @param {ComponentConfig} componentConfig - Component configuration
   * @returns {HTMLElement} Rendered component
   */
  renderConditional(componentConfig) {
    const { conditional } = componentConfig;
    const { condition, ifTrue, ifFalse } = conditional;

    // Evaluate condition
    const conditionResult = this.evaluateCondition(condition);

    // Render appropriate component
    const targetConfig = conditionResult ? ifTrue : ifFalse;

    if (!targetConfig) {
      return createElement('div', { className: 'conditional-empty' });
    }

    return this.renderComponent(targetConfig);
  }

  /**
   * Renders a fallback component for unknown types.
   * @param {ComponentConfig} componentConfig - Component configuration
   * @returns {HTMLElement} Fallback component
   */
  renderFallbackComponent(componentConfig) {
    const { id, type } = componentConfig;

    return createElement(
      'div',
      {
        className: 'component-fallback',
        'data-component-id': id,
        'data-component-type': type,
      },
      `Unknown component type: ${type}`
    );
  }

  /**
   * Converts component config to template config format.
   * @param {ComponentConfig} componentConfig - Component configuration
   * @returns {Object} Template configuration
   */
  convertToTemplateConfig(componentConfig) {
    return {
      template: componentConfig.template,
      props: componentConfig.props,
      children: componentConfig.children || [],
    };
  }

  /**
   * Evaluates a condition for conditional rendering.
   * @param {Function|string} condition - Condition to evaluate
   * @returns {boolean} Condition result
   */
  evaluateCondition(condition) {
    if (typeof condition === 'function') {
      return condition(this.renderContext);
    }

    if (typeof condition === 'string') {
      // Simple property checks
      if (condition.startsWith('!')) {
        const prop = condition.slice(1);
        return !this.renderContext[prop];
      }
      return !!this.renderContext[condition];
    }

    return false;
  }

  /**
   * Applies layout strategy to rendered components.
   * @param {HTMLElement} container - Layout container
   * @param {Array<HTMLElement>} components - Rendered components
   * @param {string} layout - Layout strategy
   */
  applyLayout(container, components, layout) {
    components.forEach((component, index) => {
      if (layout === 'grid') {
        this.applyGridPosition(component, index);
      }
      container.appendChild(component);
    });
  }

  /**
   * Applies grid positioning to a component.
   * @param {HTMLElement} component - Component element
   * @param {number} _index - Component index (unused)
   */
  applyGridPosition(component, _index) {
    const gridConfig = component.dataset.grid ? JSON.parse(component.dataset.grid) : {};

    if (gridConfig.row) {
      component.style.gridRow = gridConfig.row;
    }
    if (gridConfig.col) {
      component.style.gridColumn = gridConfig.col;
    }
    if (gridConfig.rowSpan) {
      component.style.gridRowEnd = `span ${gridConfig.rowSpan}`;
    }
    if (gridConfig.colSpan) {
      component.style.gridColumnEnd = `span ${gridConfig.colSpan}`;
    }
  }

  /**
   * Applies styles to an element.
   * @param {HTMLElement} element - Target element
   * @param {Object} [styles={}] - Style definitions
   */
  applyStyles(element, styles = {}) {
    Object.entries(styles).forEach(([property, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        element.style[property] = value;
      }
    });
  }

  /**
   * Attaches event handlers to the container.
   * @param {HTMLElement} container - Container element
   * @param {Object} [events={}] - Event handler definitions
   */
  attachEvents(container, events = {}) {
    Object.entries(events).forEach(([eventType, handler]) => {
      if (typeof handler === 'function') {
        container.addEventListener(eventType, handler);
        this.eventHandlers.set(`${container.id || 'container'}-${eventType}`, handler);
      }
    });
  }

  /**
   * Clears container content.
   * @param {HTMLElement} container - Container to clear
   */
  clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  /**
   * Updates the rendering context.
   * @param {Object} newContext - New context data
   */
  updateContext(newContext) {
    this.renderContext = { ...this.renderContext, ...newContext };
  }

  /**
   * Clears component cache.
   */
  clearCache() {
    this.componentCache.clear();
  }

  /**
   * Removes event handlers.
   */
  cleanup() {
    this.eventHandlers.clear();
    this.clearCache();
  }
}

/**
 * Creates a new declarative renderer instance.
 * @returns {DeclarativeRenderer} New renderer instance
 */
export function createDeclarativeRenderer() {
  return new DeclarativeRenderer();
}

/**
 * Convenience function to render a configuration directly.
 * @param {RenderConfig} config - Render configuration
 * @param {HTMLElement} container - Target container
 * @param {Object} [context={}] - Rendering context
 * @returns {HTMLElement} Rendered container
 */
export function renderDeclarative(config, container, context = {}) {
  const renderer = createDeclarativeRenderer();
  return renderer.render(config, container, context);
}

// Export default renderer instance
export default createDeclarativeRenderer();
