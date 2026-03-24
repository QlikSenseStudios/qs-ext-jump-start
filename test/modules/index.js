/**
 * @fileoverview Test modules index.
 *
 * Centralizes all test modules for easy importing and organization.
 */

import { connectionTests } from './connection.test.js';
import { environmentTests } from './environment.test.js';
import { extensionUnconfiguredTests } from './extension-unconfigured.test.js';

export {
  connectionTests,
  environmentTests,
  extensionUnconfiguredTests,
};
