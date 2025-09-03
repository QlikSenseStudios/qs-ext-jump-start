/**
 * Declarative Rendering Module Index
 * Centralized exports for declarative rendering system
 */

// Core declarative rendering
export {
  DeclarativeRenderer,
  createDeclarativeRenderer,
  renderDeclarative,
} from './declarative-renderer';

// Configuration system
export {
  extensionConfigurations,
  validateRenderConfig,
  processTemplateStrings,
  getExtensionConfig,
  listExtensionConfigs,
  createConfigBuilder,
} from './declarative-config';

// Integration layer
export {
  DeclarativeExtensionRenderer,
  createDeclarativeExtension,
  shouldUseDeclarativeRendering,
  renderExtensionAuto,
  createDeclarativeStrategy,
} from './declarative-integration';

// Example configurations
export {
  examples,
  createExampleConfig,
  getExampleConfigs,
  validateExample,
} from './declarative-examples';

// Re-export default renderer
export { default as declarativeRenderer } from './declarative-integration';
