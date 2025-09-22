/**
 * @fileoverview Test modules index.
 *
 * Centralizes all test modules for easy importing and organization.
 */

const { connectionTests } = require('./connection.test');
const { environmentTests } = require('./environment.test');
const { extensionDefaultTests } = require('./extension-default.test');

module.exports = {
  connectionTests,
  environmentTests,
  extensionDefaultTests,
};
