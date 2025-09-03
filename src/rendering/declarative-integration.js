/**
 * Declarative Integration Layer
 * Integrates declarative rendering with existing extension infrastructure
 */

import { createDeclarativeRenderer } from './declarative-renderer';
import { 
  extensionConfigurations, 
  processTemplateStrings, 
  validateRenderConfig,
  getExtensionConfig 
} from './declarative-config';

/**
 * @typedef {Object} ExtensionState
 * @property {string} state - Current extension state ('no-data', 'data', 'error', 'loading')
 * @property {Object} data - Extension data context
 * @property {boolean} inSelection - Whether in selection mode
 * @property {Object} layout - Qlik layout object
 * @property {HTMLElement} element - Container element
 */

/**
 * Declarative extension renderer that bridges configuration and existing components.
 */
export class DeclarativeExtensionRenderer {
  constructor() {
    this.renderer = createDeclarativeRenderer();
    this.currentConfig = null;
    this.currentContext = {};
    this.isDeclarativeMode = false;
  }

  /**
   * Enables declarative rendering mode for the extension.
   * @param {string|Object} configOrId - Configuration ID or full configuration object
   * @returns {boolean} Success status
   */
  enableDeclarativeMode(configOrId) {
    try {
      let config;
      
      if (typeof configOrId === 'string') {
        config = getExtensionConfig(configOrId);
        if (!config) {
          return false;
        }
      } else {
        config = configOrId;
      }

      // Validate the configuration
      const validation = validateRenderConfig(config.render || config);
      if (!validation.valid) {
        return false;
      }

      this.currentConfig = config;
      this.isDeclarativeMode = true;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Disables declarative rendering mode.
   */
  disableDeclarativeMode() {
    this.isDeclarativeMode = false;
    this.currentConfig = null;
    this.renderer.cleanup();
  }

  /**
   * Renders the extension using declarative configuration if enabled.
   * @param {ExtensionState} extensionState - Current extension state
   * @returns {boolean} Whether declarative rendering was used
   */
  renderExtension(extensionState) {
    if (!this.isDeclarativeMode || !this.currentConfig) {
      return false;
    }

    try {
      // Build context from extension state
      const context = this.buildRenderContext(extensionState);
      
      // Process template strings in configuration
      const processedConfig = this.processConfiguration(context);
      
      // Render using declarative renderer
      this.renderer.render(processedConfig, extensionState.element, context);
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Builds rendering context from extension state.
   * @param {ExtensionState} extensionState - Extension state
   * @returns {Object} Rendering context
   */
  buildRenderContext(extensionState) {
    const { state, data, inSelection, layout } = extensionState;

    // Base context
    const context = {
      // Extension state
      extensionState: state,
      inSelection,
      hasData: state === 'data' && data.localData?.length > 0,
      
      // Data context
      ...data,
      
      // Configuration defaults
      ...this.currentConfig.defaults,
      
      // Layout information
      layout,
      
      // Additional computed properties
      totalRecords: data.localData?.length || 0,
      dimCount: data.dimCount || 0,
      measCount: data.measCount || 0,
      
      // State booleans for conditional rendering
      isNoData: state === 'no-data',
      isError: state === 'error',
      isLoading: state === 'loading',
      isData: state === 'data',
    };

    // Merge with current context
    return { ...this.currentContext, ...context };
  }

  /**
   * Processes configuration with context values.
   * @param {Object} context - Rendering context
   * @returns {Object} Processed configuration
   */
  processConfiguration(context) {
    const config = this.currentConfig.render || this.currentConfig;
    return processTemplateStrings(config, context);
  }

  /**
   * Updates the rendering context and re-renders if needed.
   * @param {Object} contextUpdates - Context updates
   * @param {HTMLElement} [element] - Container element for re-render
   */
  updateContext(contextUpdates, element = null) {
    this.currentContext = { ...this.currentContext, ...contextUpdates };
    
    if (element && this.isDeclarativeMode) {
      this.renderer.updateContext(this.currentContext);
      
      // Re-render with updated context
      const processedConfig = this.processConfiguration(this.currentContext);
      this.renderer.render(processedConfig, element, this.currentContext);
    }
  }

  /**
   * Checks if declarative mode is enabled.
   * @returns {boolean} Whether declarative mode is active
   */
  isDeclarative() {
    return this.isDeclarativeMode;
  }

  /**
   * Gets the current configuration.
   * @returns {Object|null} Current configuration
   */
  getCurrentConfig() {
    return this.currentConfig;
  }

  /**
   * Gets available configuration options.
   * @returns {Array<Object>} Available configurations
   */
  getAvailableConfigs() {
    return Object.values(extensionConfigurations).map(config => ({
      id: config.id,
      name: config.name,
      description: config.description,
    }));
  }
}

/**
 * Factory function to create declarative extension renderer with configuration.
 * @param {string|Object} [configOrId] - Initial configuration
 * @returns {DeclarativeExtensionRenderer} Renderer instance
 */
export function createDeclarativeExtension(configOrId = null) {
  const renderer = new DeclarativeExtensionRenderer();
  
  if (configOrId) {
    renderer.enableDeclarativeMode(configOrId);
  }
  
  return renderer;
}

/**
 * Utility function to check if extension state should use declarative rendering.
 * @param {ExtensionState} extensionState - Extension state
 * @param {Object} [options={}] - Check options
 * @returns {boolean} Whether declarative rendering is appropriate
 */
export function shouldUseDeclarativeRendering(extensionState, options = {}) {
  const { forceDeclarative = false, preferDeclarative = true } = options;
  
  if (forceDeclarative) {
    return true;
  }
  
  if (!preferDeclarative) {
    return false;
  }
  
  // Use declarative for complex layouts or when specifically configured
  return extensionState.layout?.qHyperCube?.qDataPages?.length > 0 || 
         extensionState.data?.useDeclarative === true;
}

/**
 * Helper function to render extension with automatic mode detection.
 * @param {ExtensionState} extensionState - Extension state
 * @param {Object} [options={}] - Rendering options
 * @returns {boolean} Whether declarative rendering was used
 */
export function renderExtensionAuto(extensionState, options = {}) {
  const { configId = 'dataTableView', fallbackRenderer = null } = options;
  
  if (!shouldUseDeclarativeRendering(extensionState, options)) {
    return false;
  }
  
  const declarativeRenderer = createDeclarativeExtension(configId);
  const success = declarativeRenderer.renderExtension(extensionState);
  
  if (!success && fallbackRenderer) {
    fallbackRenderer(extensionState);
  }
  
  return success;
}

/**
 * Creates a declarative rendering strategy for specific extension states.
 * @param {Object} stateConfigs - State-specific configurations
 * @returns {Function} Rendering strategy function
 */
export function createDeclarativeStrategy(stateConfigs) {
  const renderers = new Map();
  
  // Initialize renderers for each state
  Object.entries(stateConfigs).forEach(([state, config]) => {
    const renderer = createDeclarativeExtension(config);
    renderers.set(state, renderer);
  });
  
  return function renderWithStrategy(extensionState) {
    const renderer = renderers.get(extensionState.state);
    if (renderer) {
      return renderer.renderExtension(extensionState);
    }
    return false;
  };
}

// Default declarative renderer instance
const defaultDeclarativeRenderer = new DeclarativeExtensionRenderer();

export default defaultDeclarativeRenderer;
