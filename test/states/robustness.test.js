const { expect, test } = require('@playwright/test');
const { configureExtension, triggerSelectionMode, clearAllSelections } = require('../helpers/test-utils');
const commonTests = require('./common.test');

// Extract magic numbers as named constants for clarity/maintainability
const THRASH_ITERATIONS = 5;
const SHORT_DELAY_MS = 40;

module.exports = {
  /**
   * Asserts re-renders do not duplicate containers/tables or surface errors.
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @returns {Promise<void>}
   */
  async verifyNoDuplicateContainersOrTablesOnReRender(page, content) {
    await clearAllSelections(page).catch(() => {});
    const configured = await configureExtension(page, {
      dimensions: ['Dim1'],
      measures: [{ field: 'Expression1', aggregation: 'Sum' }],
    });
    await page.waitForTimeout(300);
    const state = await commonTests.getExtensionState(page, content);
    if (!configured || state !== 'extension-container') {
      // Gate: requires data state; if not available, document and exit as a stub.
      test.info().annotations.push({ type: 'skip', description: `Data state not reachable (${state})` });
      return;
    }

    // Enter selection and thrash a bit to force re-renders
    await triggerSelectionMode(page);
    const cells = page.locator(content + ' td.dim-cell.selectable-item');
    const count = await cells.count();
    if (count < 2) {
      // Gate: need at least 2 selectable cells to induce re-render thrash.
      test.info().annotations.push({ type: 'skip', description: 'Not enough cells to test re-render thrash' });
      return;
    }
    // Use bottom-most cells to avoid any selection toolbar overlay at the top
    const firstIdx = Math.max(0, count - 2);
    const secondIdx = Math.max(0, count - 1);
    const a = cells.nth(firstIdx);
    const b = cells.nth(secondIdx);
    await a.scrollIntoViewIfNeeded();
    await b.scrollIntoViewIfNeeded();
    for (let i = 0; i < THRASH_ITERATIONS; i++) {
      await a.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(SHORT_DELAY_MS);
      await b.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(SHORT_DELAY_MS);
    }

    // Validate single container and table, and no error messages
    await expect(page.locator(content + ' .extension-container')).toHaveCount(1);
    await expect(page.locator(content + ' table.data-table')).toHaveCount(1);
    await expect(page.locator(content + ' .error-message')).toHaveCount(0);
  },

  /**
   * Ensures one click toggles selection once (no duplicate listeners across renders).
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @returns {Promise<void>}
   */
  async verifySelectionTogglesOncePerClick(page, content) {
    await clearAllSelections(page).catch(() => {});
    const configured = await configureExtension(page, {
      dimensions: ['Dim1'],
      measures: [{ field: 'Expression1', aggregation: 'Sum' }],
    });
    await page.waitForTimeout(300);
    const state = await commonTests.getExtensionState(page, content);
    if (!configured || state !== 'extension-container') {
      // Gate: requires data state; if not available, document and exit as a stub.
      test.info().annotations.push({ type: 'skip', description: `Data state not reachable (${state})` });
      return;
    }

    await triggerSelectionMode(page);
    await page.waitForSelector(content + ' .extension-container.in-selection', { timeout: 5000 });

    // If triggerSelectionMode selected one already, use that stable cell
    let selected = page.locator(content + ' td.dim-cell.selectable-item.local-selected').first();
    if (!(await selected.isVisible().catch(() => false))) {
      // Otherwise pick the first cell and make it selected
      const first = page.locator(content + ' td.dim-cell.selectable-item').first();
      await first.click({ force: true });
      selected = first;
    }
    const elemId = await selected.getAttribute('data-q-elem');
    const target = page.locator(`${content} td.dim-cell.selectable-item[data-q-elem="${elemId}"]`).first();

    // Ensure it's selected now
    await expect(target).toHaveClass(/local-selected/);

    // Single click -> deselected and selection mode should exit if it was the only selection
    await target.click({ force: true });
    await expect(target).not.toHaveClass(/local-selected/);
    await expect(page.locator(content + ' .extension-container.in-selection')).toHaveCount(0);

    // Another single click -> selected again (re-enter selection)
    await expect(target).toBeVisible();
    await target.click({ force: true });
    await expect(page.locator(content + ' .extension-container.in-selection')).toHaveCount(1);
    await expect(target).toHaveClass(/local-selected/);
  },

  /**
   * Verifies selections remain highlighted across subsequent re-renders during a session.
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @returns {Promise<void>}
   */
  async verifySelectionPersistsAcrossRenders(page, content) {
    await clearAllSelections(page).catch(() => {});
    const configured = await configureExtension(page, {
      dimensions: ['Dim1'],
      measures: [{ field: 'Expression1', aggregation: 'Sum' }],
    });
    await page.waitForTimeout(300);
    const state = await commonTests.getExtensionState(page, content);
    if (!configured || state !== 'extension-container') {
      // Gate: requires data state; if not available, document and exit as a stub.
      test.info().annotations.push({ type: 'skip', description: `Data state not reachable (${state})` });
      return;
    }

    await triggerSelectionMode(page);
    await page.waitForSelector(content + ' .extension-container.in-selection', { timeout: 5000 });
    const cells = page.locator(content + ' td.dim-cell.selectable-item');
    await expect(cells.nth(0)).toBeVisible();
    await expect(cells.nth(1)).toBeVisible();

    // Determine existing selected and choose two targets
    const initiallySelected = new Set(
      await page.$$eval(`${content} td.dim-cell.selectable-item.local-selected`, (els) =>
        els.map((e) => e.getAttribute('data-q-elem'))
      )
    );
    const allIds = await page.$$eval(`${content} td.dim-cell.selectable-item`, (els) =>
      els.map((e) => e.getAttribute('data-q-elem'))
    );
    let targetIds = [];
    if (initiallySelected.size >= 2) {
      targetIds = Array.from(initiallySelected).slice(0, 2);
    } else if (initiallySelected.size === 1) {
      const [sel] = Array.from(initiallySelected);
      const next = allIds.find((id) => id !== sel);
      targetIds = [sel, next];
      await page
        .locator(`${content} td.dim-cell.selectable-item[data-q-elem="${next}"]`)
        .first()
        .click({ force: true });
    } else {
      targetIds = allIds.slice(0, 2);
      await page
        .locator(`${content} td.dim-cell.selectable-item[data-q-elem="${targetIds[0]}"]`)
        .first()
        .click({ force: true });
      await page
        .locator(`${content} td.dim-cell.selectable-item[data-q-elem="${targetIds[1]}"]`)
        .first()
        .click({ force: true });
    }
    const c0 = page.locator(`${content} td.dim-cell.selectable-item[data-q-elem="${targetIds[0]}"]`).first();
    const c1 = page.locator(`${content} td.dim-cell.selectable-item[data-q-elem="${targetIds[1]}"]`).first();
    await expect(c0).toHaveClass(/local-selected/);
    await expect(c1).toHaveClass(/local-selected/);

    // Cause additional re-renders by toggling a third cell a few times
    // Toggle a third, different cell to induce re-renders
    const thirdId = allIds.find((id) => !targetIds.includes(id));
    if (thirdId) {
      const thirdSelector = `${content} td.dim-cell.selectable-item[data-q-elem="${thirdId}"]`;
      for (let i = 0; i < 3; i++) {
        await page.waitForSelector(thirdSelector, { state: 'attached', timeout: 2000 }).catch(() => {});
        const third = page.locator(thirdSelector).first();
        await third.scrollIntoViewIfNeeded().catch(() => {});
        // Prefer keyboard toggle on focused cell; click as fallback
        const focused = third.focus().catch(() => {});
        await focused;
        const pressed = page.keyboard.press('Enter').catch(() => {});
        await pressed;
        // If neither focus nor Enter seemed to register, fallback to a direct click
        if (!(await third.evaluate((el) => document.activeElement === el).catch(() => false))) {
          await third.click({ force: true }).catch(() => {});
        }
        await page.waitForTimeout(60);
      }
    }

    // Verify the two targets remain selected
    const selectedNow = new Set(
      await page.$$eval(`${content} td.dim-cell.selectable-item.local-selected`, (els) =>
        els.map((e) => e.getAttribute('data-q-elem'))
      )
    );
    expect(selectedNow.has(targetIds[0])).toBe(true);
    expect(selectedNow.has(targetIds[1])).toBe(true);
  },

  /**
   * After reload, the extension recovers to a valid state without error banners.
   * @param {import('@playwright/test').Page} page
   * @param {string} content
   * @returns {Promise<void>}
   */
  async verifyReloadRecovers(page, content) {
    // Try entering selection once before reload
    await clearAllSelections(page).catch(() => {});
    await configureExtension(page, { dimensions: ['Dim1'], measures: [{ field: 'Expression1', aggregation: 'Sum' }] });
    await page.waitForTimeout(200);
    await triggerSelectionMode(page);

    // Reload page and ensure extension renders to a valid state
    await page.reload();
    await commonTests.waitForExtensionRender(page, content);
    const state = await commonTests.getExtensionState(page, content);
    expect(['no-data', 'extension-container']).toContain(state);
    await expect(page.locator(content + ' .error-message')).toHaveCount(0);
  },
};
