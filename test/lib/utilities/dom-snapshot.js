/**
 * @fileoverview DOM snapshot utilities for selector discovery and drift detection.
 *
 * Captures a structured, readable representation of the visible DOM using
 * Playwright's built-in accessibility snapshot. Useful during test development
 * to identify selectors without guessing, and as a baseline for detecting
 * structural drift when Nebula Hub versions change.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Captures the ARIA accessibility tree for a page or scoped locator and returns
 * it as a formatted YAML string — the same format Playwright uses in error context
 * snapshots, so the output is already familiar.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [options]
 * @param {import('@playwright/test').Locator} [options.root] - Scope snapshot to this locator
 * @param {boolean} [options.interestingOnly=true] - Omit elements with no accessible role
 * @returns {Promise<string>} ARIA tree as a YAML string
 */
async function captureAriaSnapshot(page, { root, interestingOnly = true } = {}) {
  const target = root ?? page;
  return await target.ariaSnapshot({ interestingOnly });
}

/**
 * Logs the ARIA snapshot to the console, scoped to a label for context.
 * Intended for use during headed test development — call inside a test,
 * run headed, and read the output to identify selectors.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} label - Context label printed above the snapshot
 * @param {object} [options]
 * @param {import('@playwright/test').Locator} [options.root] - Scope snapshot to this locator
 */
async function logAriaSnapshot(page, label, { root, interestingOnly = true } = {}) {
  const snapshot = await captureAriaSnapshot(page, { root, interestingOnly });
  console.log(`\n📸 DOM Snapshot — ${label}\n${'─'.repeat(60)}\n${snapshot}\n${'─'.repeat(60)}\n`);
}

/**
 * Saves the ARIA snapshot to a file in the test artifacts directory.
 * File is named by label and timestamp so successive captures don't overwrite.
 * Intended for use as a baseline for drift detection.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} label - Descriptive name used in the filename (spaces → hyphens)
 * @param {object} [options]
 * @param {import('@playwright/test').Locator} [options.root] - Scope snapshot to this locator
 * @param {string} [options.outputDir='test/snapshots'] - Directory to write snapshot files
 * @returns {Promise<string>} Absolute path of the written file
 */
async function saveAriaSnapshot(page, label, { root, outputDir = 'test/snapshots' } = {}) {
  const snapshot = await captureAriaSnapshot(page, { root });
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${slug}-${timestamp}.yaml`;
  const dir = join(process.cwd(), outputDir);
  mkdirSync(dir, { recursive: true });
  const filepath = join(dir, filename);
  writeFileSync(filepath, snapshot, 'utf8');
  console.log(`   • Snapshot saved: ${filepath}`);
  return filepath;
}

export { captureAriaSnapshot, logAriaSnapshot, saveAriaSnapshot };
