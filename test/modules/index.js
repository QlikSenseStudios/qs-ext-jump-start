/**
 * @fileoverview Test modules index.
 *
 * Centralizes all test modules for easy importing and organization.
 */

import { connectionTests } from './connection.test.js';
import { hubReadyTests } from './hub-ready.test.js';
import { extensionUnconfiguredTests } from './extension-unconfigured.test.js';
import { extensionConfiguredTests } from './extension-configured.test.js';

export {
  connectionTests,
  hubReadyTests,
  extensionUnconfiguredTests,
  extensionConfiguredTests,
};
