/**
 * @fileoverview Test modules index.
 *
 * Centralizes all test modules for easy importing and organization.
 */

const { connectionTests } = require('./connection.test');
const { environmentTests } = require('./environment.test');
const { extensionUnconfiguredTests } = require('./extension-unconfigured.test');

module.exports = {
  connectionTests,
  environmentTests,
  extensionUnconfiguredTests,
};
