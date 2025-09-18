/**
 * @fileoverview Environment validation utilities for testing framework.
 *
 * This module provides intelligent validation of the nebula hub environment
 * with smart caching to avoid redundant DOM queries. All validation logic
 * is centralized here for consistency and maintainability.
 *
 * @module EnvironmentValidator
 * @since 1.0.0
 */

const { IDENTIFIERS, TIMEOUTS } = require('./identifiers');

/**
 * Cache for validation results to avoid redundant DOM queries during tests.
 * Uses WeakMap for automatic garbage collection when page objects are disposed.
 *
 * @type {WeakMap<import('@playwright/test').Page, ValidationResult>}
 */
const validationCache = new WeakMap();

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} success - Overall validation success
 * @property {ComponentValidation} components - Individual component validation results
 * @property {string[]} errors - Array of validation error messages
 */

/**
 * @typedef {Object} ComponentValidation
 * @property {boolean} modifyPropertiesButton - Settings button accessibility
 * @property {boolean} extensionView - Extension view container presence
 * @property {boolean} propertyCacheCheckbox - Property cache checkbox accessibility
 */

/**
 * Validates that all essential nebula hub environment components are present and accessible.
 *
 * This function performs a comprehensive check of the three core UI components needed
 * for extension testing. Results are cached to improve performance during test execution.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {boolean} [forceRefresh=false] - Skip cache and perform fresh validation
 * @returns {Promise<ValidationResult>} Validation results with component details
 *
 * @example
 * ```javascript
 * const validation = await validateEnvironmentComponents(page);
 * if (validation.success) {
 *   console.log('Environment ready for testing');
 * } else {
 *   console.error('Environment issues:', validation.errors);
 * }
 * ```
 */
async function validateEnvironmentComponents(page, forceRefresh = false) {
  // Return cached result if available and not forcing refresh
  const cached = validationCache.get(page);
  if (!forceRefresh && cached) {
    return cached;
  }

  /** @type {ValidationResult} */
  const results = {
    success: false,
    components: {
      modifyPropertiesButton: false,
      extensionView: false,
      propertyCacheCheckbox: false,
    },
    errors: [],
  };

  try {
    // Validate settings/properties button (always needed for configuration tests)
    const modifyButton = await page
      .waitForSelector(IDENTIFIERS.MODIFY_PROPERTIES_BUTTON, { timeout: TIMEOUTS.STANDARD })
      .catch(() => null);

    if (modifyButton) {
      results.components.modifyPropertiesButton = true;
    } else {
      results.errors.push('Settings button (modify object properties) not accessible');
    }

    // Validate extension view container
    // Use 'attached' state since elements may exist in DOM before becoming visible
    const extensionView = await page
      .waitForSelector(IDENTIFIERS.EXTENSION_VIEW, {
        timeout: TIMEOUTS.STANDARD,
        state: 'attached',
      })
      .catch(() => null);

    if (extensionView) {
      results.components.extensionView = true;
    } else {
      results.errors.push(`Extension view container with aria-label="${IDENTIFIERS.EXTENSION_TITLE}" not found`);
    }

    // Validate property cache checkbox (essential for comprehensive testing)
    const propertyCacheCheckbox = await page
      .waitForSelector(IDENTIFIERS.PROPERTY_CACHE_CHECKBOX, { timeout: TIMEOUTS.STANDARD })
      .catch(() => null);

    if (propertyCacheCheckbox) {
      results.components.propertyCacheCheckbox = true;
    } else {
      results.errors.push('Property cache checkbox not accessible in configuration panel');
    }

    // Overall success requires all components to be present
    results.success = Object.values(results.components).every(Boolean);

    // Cache the result for future use
    validationCache.set(page, results);

    return results;
  } catch (error) {
    results.errors.push(`Environment validation failed: ${error.message}`);
    // Cache failed results to avoid repeated failures
    validationCache.set(page, results);
    return results;
  }
}

/**
 * Retrieves cached validation results without performing new validation.
 *
 * This is useful when you need validation results but know that validation
 * was recently performed and the results should still be valid.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {ValidationResult | null} Cached validation results or null if not cached
 */
function getCachedValidationResults(page) {
  return validationCache.get(page) || null;
}

/**
 * Clears validation cache for a specific page.
 *
 * This should be called during test teardown to ensure clean state between tests
 * and prevent cache pollution across test runs.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
function clearValidationCache(page) {
  validationCache.delete(page);
}

/**
 * Waits for the nebula hub environment to be in a ready state for testing.
 *
 * This function combines page load state checking with environment component validation
 * to ensure the testing environment is fully prepared before test execution begins.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>} True if environment is ready, false otherwise
 *
 * @example
 * ```javascript
 * if (await waitForEnvironmentReady(page)) {
 *   // Proceed with test execution
 * } else {
 *   // Handle environment not ready scenario
 * }
 * ```
 */
async function waitForEnvironmentReady(page) {
  try {
    // Ensure DOM is loaded (avoiding flaky networkidle)
    await page.waitForLoadState('domcontentloaded');

    // Perform comprehensive validation
    const validation = await validateEnvironmentComponents(page, false);

    if (validation.success) {
      console.log('✓ Nebula hub environment ready - all components validated');
      return true;
    } else {
      console.warn('✗ Environment not ready:', validation.errors.join(', '));
      return false;
    }
  } catch (error) {
    console.warn('Environment readiness check failed:', error.message);
    return false;
  }
}

module.exports = {
  validateEnvironmentComponents,
  getCachedValidationResults,
  clearValidationCache,
  waitForEnvironmentReady,
};
