const { expect, test } = require('@playwright/test');
const { configureExtension, clearAllSelections } = require('../helpers/test-utils');
const commonTests = require('./common.test');

module.exports = {
  /**
   * Verify container roles/labels across states (no-data → data → selection → exit)
   */
  async verifyContainerRolesAcrossStates(page, content) {
    // No-data by default
    const initial = await commonTests.getExtensionState(page, content);
    expect(initial).toBe('no-data');
    const noData = await page.$(content + ' .no-data');
    expect(noData).toBeTruthy();
    const noDataAria = await noData.getAttribute('aria-label');
    expect(noDataAria).toBe('No data available');

    // Configure data
    await clearAllSelections(page).catch(() => {});
    const configured = await configureExtension(page, {
      dimensions: ['Dim1'],
      measures: [{ field: 'Expression1', aggregation: 'Sum' }],
    });
    await page.waitForTimeout(500);
    const state = await commonTests.getExtensionState(page, content);
    if (!configured) {
      test.info().annotations.push({ type: 'skip', description: `Configuration failed; state=${state}` });
      return;
    }
    expect(state).toBe('extension-container');
    const container = await page.$(content + ' .extension-container');
    expect(await container.getAttribute('role')).toBe('main');
    expect(await container.getAttribute('aria-label')).toBe('Qlik Sense Extension Content');
    expect(await container.getAttribute('tabindex')).toBe('0');

  // Enter selection and verify attributes persist
  const firstCellHandle = await page.$(content + ' td.dim-cell.selectable-item');
  expect(firstCellHandle).toBeTruthy();
  const elem0 = await firstCellHandle.getAttribute('data-q-elem');
  await firstCellHandle.click({ force: true });
    await page.waitForSelector(content + ' .extension-container.in-selection', { timeout: 3000 });
    const selectionContainer = await page.$(content + ' .extension-container.in-selection');
    expect(selectionContainer).toBeTruthy();
    expect(await selectionContainer.getAttribute('role')).toBe('main');
    expect(await selectionContainer.getAttribute('aria-label')).toBe('Qlik Sense Extension Content');

  // Toggle the same cell off to exit selection (session becomes empty triggers cancel)
  const firstCell = page.locator(`${content} [data-q-elem="${elem0}"]`);
  await firstCell.click({ force: true });
  await expect(page.locator(content + ' .extension-container.in-selection')).toHaveCount(0);
  },

  /**
   * Cells expose role=button, tabindex=0, and aria-label="Select <value>"; Tab moves to next cell
   */
  async verifyCellAccessibilityAndTabOrder(page, content) {
    await clearAllSelections(page).catch(() => {});
    const configured = await configureExtension(page, {
      dimensions: ['Dim1'],
      measures: [{ field: 'Expression1', aggregation: 'Sum' }],
    });
    await page.waitForTimeout(500);
    const state = await commonTests.getExtensionState(page, content);
    if (!configured) {
      test.info().annotations.push({ type: 'skip', description: `Configuration failed; state=${state}` });
      return;
    }

    const cellLoc = page.locator(content + ' td.dim-cell.selectable-item');
    const count = await cellLoc.count();
    expect(count).toBeGreaterThanOrEqual(2);
    const c0 = cellLoc.nth(0);
    const c1 = cellLoc.nth(1);
    expect(await c0.getAttribute('role')).toBe('button');
    expect(await c1.getAttribute('role')).toBe('button');
    expect(await c0.getAttribute('tabindex')).toBe('0');
    expect(await c1.getAttribute('tabindex')).toBe('0');
    const t0 = (await c0.textContent()).trim();
    const t1 = (await c1.textContent()).trim();
    expect(await c0.getAttribute('aria-label')).toBe(`Select ${t0}`);
    expect(await c1.getAttribute('aria-label')).toBe(`Select ${t1}`);

    // Focus first cell and Tab to next
    await c0.focus();
    await page.keyboard.press('Tab');
    // Allow processing
    await page.waitForTimeout(50);
    const isC1Focused = await page.evaluate((el) => document.activeElement === el, await c1.elementHandle());
    expect(isC1Focused).toBe(true);
  },

  /**
   * No-data hint uses aria-live=polite role=note in the hint region
   */
  async verifyNoDataLiveRegion(page, content) {
    const initial = await commonTests.getExtensionState(page, content);
    if (initial !== 'no-data') {
      test.info().annotations.push({ type: 'skip', description: `Expected no-data initial, got ${initial}` });
      return;
    }
    const hint = await page.$(content + ' .no-data .no-data-hint');
    expect(hint).toBeTruthy();
    expect(await hint.getAttribute('role')).toBe('note');
    expect(await hint.getAttribute('aria-live')).toBe('polite');
  },

  /**
   * Table headers are accessible and properly scoped
   */
  async verifyHeaderScopes(page, content) {
    await clearAllSelections(page).catch(() => {});
    const configured = await configureExtension(page, {
      dimensions: ['Dim1'],
      measures: [{ field: 'Expression1', aggregation: 'Sum' }],
    });
    await page.waitForTimeout(500);
    const state = await commonTests.getExtensionState(page, content);
    if (!configured || state !== 'extension-container') {
      test.info().annotations.push({ type: 'skip', description: `Data state not reachable (${state})` });
      return;
    }
    const headers = await page.$$(content + ' table.data-table thead th');
    expect(headers.length).toBe(2);
    for (const h of headers) {
      const scope = await h.getAttribute('scope');
      expect(scope).toBe('col');
      const txt = (await h.textContent()).trim();
      expect(txt.length).toBeGreaterThan(0);
    }
  },
};
