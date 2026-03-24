/**
 * @fileoverview Main entry point for the test framework library.
 *
 * This module provides essential testing utilities and page objects
 * needed for the e2e environment validation tests.
 *
 * @module TestFramework
 * @since 1.0.0
 */

// Core validation function (used directly by e2e tests)
import { clearValidationCache } from './core/validation.js';

// Page objects (main interface for e2e tests)
import { NebulaHubPage } from './page-objects/nebula-hub.js';

export {
  clearValidationCache,
  NebulaHubPage,
};
