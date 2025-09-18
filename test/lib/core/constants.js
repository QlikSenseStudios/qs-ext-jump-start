/**
 * @fileoverview Shared constants for testing framework.
 *
 * This module centralizes timing values used across the testing framework.
 * These values are carefully tuned for reliability across different environments.
 *
 * @module TestConstants
 * @since 1.0.0
 */

/**
 * Standardized wait durations for consistent timing across tests.
 * These values are carefully tuned for reliability across different environments.
 *
 * @readonly
 * @enum {number}
 */
const WAIT_TIMES = Object.freeze({
  /** Very short delay for UI state transitions */
  TINY: 100,

  /** Short delay for quick interactions */
  SHORT: 200,

  /** Medium delay for moderate operations */
  MEDIUM: 400,

  /** Long delay for complex operations */
  LONG: 600,

  /** Extra long delay for heavy operations */
  EXTRA_LONG: 1000,
});

module.exports = {
  WAIT_TIMES,
};
