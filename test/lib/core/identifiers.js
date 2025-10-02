/**
 * @fileoverview Core DOM identifiers and selectors for Qlik Sense extension testing.
 *
 * This module provides centralized, maintainable selectors that are the foundation
 * of the testing framework. All test interactions should use these identifiers to
 * ensure consistency and maintainability.
 *
 * @module TestIdentifiers
 * @since 1.0.0
 */

const pkg = require('../../../package.json');

/**
 * Core DOM selectors for nebula hub environment validation.
 * These identifiers represent the essential UI elements needed for testing.
 *
 * @readonly
 * @enum {string}
 */
const IDENTIFIERS = Object.freeze({
  /**
   * Extension title from package.json, used in object-properties.js
   * This is the source of truth for the extension name in the UI.
   */
  EXTENSION_TITLE: pkg.name,

  /**
   * Settings/gear button for accessing extension property configuration.
   * This button opens the properties dialog where JSON configuration is set.
   */
  MODIFY_PROPERTIES_BUTTON: '[title="Modify object properties"]',

  /**
   * Extension view container that validates the extension is loaded in nebula hub.
   * Uses the extension name from package.json as the aria-label value.
   */
  EXTENSION_VIEW: `[aria-label="${pkg.name}"]`,

  /**
   * Property cache configuration checkbox in the nebula hub settings panel.
   * This validates that the nebula hub configuration panel is accessible.
   */
  PROPERTY_CACHE_CHECKBOX: 'label:has-text("Enable property cache") input[type="checkbox"]',

  /**
   * Fully rendered and configured visualization container.
   * Indicates the extension has been configured and is displaying data.
   */
  COMPLETE_VISUALIZATION: '.njs-viz[data-render-count]',

  /**
   * Incomplete visualization state selector - shows configuration errors.
   * This appears when the extension needs configuration or has errors.
   */
  INCOMPLETE_VISUALIZATION: '[data-tid="error-title"]',
});

/**
 * Standardized timeout values for different types of operations.
 * These values are tuned for reliability across different environments.
 *
 * @readonly
 * @enum {number}
 */
const TIMEOUTS = Object.freeze({
  /** Standard element detection timeout - most UI interactions */
  STANDARD: 5000,

  /** Fast element check timeout - quick existence checks */
  FAST: 2000,

  /** Network operations timeout - API calls, data loading */
  NETWORK: 10000,
});

module.exports = {
  IDENTIFIERS,
  TIMEOUTS,
};
