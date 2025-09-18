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
const { clearValidationCache } = require('./core/validation');

// Page objects (main interface for e2e tests)
const { NebulaHubPage } = require('./page-objects/nebula-hub');

module.exports = {
  // Validation functions (used directly by e2e tests)
  clearValidationCache,

  // Page objects (main interface for e2e tests)
  NebulaHubPage,
};
