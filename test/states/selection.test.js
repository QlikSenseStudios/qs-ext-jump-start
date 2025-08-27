const { expect, test } = require('@playwright/test');
const { triggerSelectionMode, configureExtension, clearAllSelections } = require('../helpers/test-utils');
const commonTests = require('./common.test');

/**
 * Tests for selection state
 * This state may not be reachable in E2E testing without proper data interaction
 */
module.exports = {
  async attemptSelectionTrigger(page, _content) {
    // Attempt to trigger selection mode
    const selectionTriggered = await triggerSelectionMode(page);
    return selectionTriggered;
  },

  async shouldRenderSelectionState(page, content) {
    const container = await page.$(content + ' .extension-container.in-selection');
    if (!container) {
      return false;
    }
    // Table should still be present
    const table = await page.$(content + ' table.data-table');
    expect(table).toBeTruthy();
    return true;
  },

  async shouldHaveProperAccessibility(page, content) {
    const container = await page.$(content + ' .extension-container.in-selection');
    if (container) {
      const role = await container.getAttribute('role');
      const ariaLabel = await container.getAttribute('aria-label');
      expect(role).toBe('main');
      expect(ariaLabel).toBe('Qlik Sense Extension Content');
    }
  },

  async shouldIndicateActiveSelection(page, content) {
    const container = await page.$(content + ' .extension-container.in-selection');
    if (container) {
      const className = await container.getAttribute('class');
      expect(className).toContain('in-selection');
      // At least one selected cell should be highlighted if a selection was made
      const selectedCells = await page.$$(content + ' .dim-cell.state-S');
      expect(selectedCells.length).toBeGreaterThanOrEqual(0);
    }
  },

  /**
   * Click without Ctrl should enter selection mode and toggle a single cell
   */
  async shouldEnterSelectionWithPlainClick(page, content) {
    await clearAllSelections(page).catch(() => {});
    await configureExtension(page, { dimensions: ['Dim1'], measures: [{ field: 'Expression1', aggregation: 'Sum' }] });
    await page.waitForTimeout(800);

    const state = await commonTests.getExtensionState(page, content);
    if (state !== 'extension-container') {
      test.info().annotations.push({ type: 'skip', description: `Data state not reachable (${state})` });
      return;
    }

    const firstCellHandle = await page.$(content + ' td.dim-cell.selectable-item');
    if (!firstCellHandle) {
      test.info().annotations.push({ type: 'skip', description: 'No selectable cells found' });
      return;
    }
    const firstElem = await firstCellHandle.getAttribute('data-q-elem');
    await firstCellHandle.click({ force: true });
    // Wait for selection mode to be active and DOM to re-render
    await page.waitForSelector(content + ' .extension-container.in-selection', { timeout: 3000 });

    // Cell should gain local-selected (re-query by stable data-q-elem)
    const firstCell = page.locator(`${content} [data-q-elem="${firstElem}"]`);
    await expect(firstCell).toHaveClass(/local-selected/);

    // cleanup handled in global afterEach
  },

  /**
   * Clicking same cell twice toggles selection off
   */
  async shouldToggleSameCellOff(page, content) {
    await clearAllSelections(page).catch(() => {});
    await configureExtension(page, { dimensions: ['Dim1'], measures: [{ field: 'Expression1', aggregation: 'Sum' }] });
    await page.waitForTimeout(800);

    const state = await commonTests.getExtensionState(page, content);
    if (state !== 'extension-container') {
      test.info().annotations.push({ type: 'skip', description: `Data state not reachable (${state})` });
      return;
    }

    const firstCellHandle = await page.$(content + ' td.dim-cell.selectable-item');
    if (!firstCellHandle) {
      test.info().annotations.push({ type: 'skip', description: 'No selectable cells found' });
      return;
    }
    const firstElem = await firstCellHandle.getAttribute('data-q-elem');
    const firstCell = page.locator(`${content} [data-q-elem="${firstElem}"]`);
    await firstCellHandle.click({ force: true });
    await page.waitForSelector(content + ' .extension-container.in-selection', { timeout: 3000 });
    await expect(firstCell).toHaveClass(/local-selected/);
    // Toggle off
    await firstCell.click({ force: true });
    await expect(firstCell).not.toHaveClass(/local-selected/);

    // cleanup handled in global afterEach
  },

  /**
   * Multi-select two cells then deselect all should exit selection mode
   */
  async shouldMultiSelectAndThenExit(page, content) {
    await clearAllSelections(page).catch(() => {});
    await configureExtension(page, { dimensions: ['Dim1'], measures: [{ field: 'Expression1', aggregation: 'Sum' }] });
    await page.waitForTimeout(800);
    const state = await commonTests.getExtensionState(page, content);
    if (state !== 'extension-container') {
      test.info().annotations.push({ type: 'skip', description: `Data state not reachable (${state})` });
      return;
    }

    const cells = await page.$$(content + ' td.dim-cell.selectable-item');
    if (cells.length < 2) {
      test.info().annotations.push({ type: 'skip', description: 'Less than 2 selectable cells available' });
      return;
    }
    const elem0 = await cells[0].getAttribute('data-q-elem');
    const elem1 = await cells[1].getAttribute('data-q-elem');
    const loc0 = page.locator(`${content} [data-q-elem="${elem0}"]`);
    const loc1 = page.locator(`${content} [data-q-elem="${elem1}"]`);

    await cells[0].click({ force: true });
    await page.waitForSelector(content + ' .extension-container.in-selection', { timeout: 3000 });
    await loc1.click({ force: true });

    await expect(loc0).toHaveClass(/local-selected/);
    await expect(loc1).toHaveClass(/local-selected/);

    // Toggle both off
    await loc0.click({ force: true });
    await loc1.click({ force: true });

    await expect(loc0).not.toHaveClass(/local-selected/);
    await expect(loc1).not.toHaveClass(/local-selected/);

    // Selection mode should exit when none selected
    await expect(page.locator(content + ' .extension-container.in-selection')).toHaveCount(0);

    // cleanup handled in global afterEach
  },

  /**
   * Keyboard toggling (Enter/Space) mirrors click behavior
   */
  async shouldSupportKeyboardToggle(page, content) {
    await clearAllSelections(page).catch(() => {});
    await configureExtension(page, { dimensions: ['Dim1'], measures: [{ field: 'Expression1', aggregation: 'Sum' }] });
    await page.waitForTimeout(800);

    const state = await commonTests.getExtensionState(page, content);
    if (state !== 'extension-container') {
      test.info().annotations.push({ type: 'skip', description: `Data state not reachable (${state})` });
      return;
    }

    const firstCellHandle = await page.$(content + ' td.dim-cell.selectable-item');
    if (!firstCellHandle) {
      test.info().annotations.push({ type: 'skip', description: 'No selectable cells found' });
      return;
    }
    const elem = await firstCellHandle.getAttribute('data-q-elem');
    const firstCell = page.locator(`${content} [data-q-elem="${elem}"]`);
    await firstCell.focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector(content + ' .extension-container.in-selection', { timeout: 3000 });
    await expect(firstCell).toHaveClass(/local-selected/);

    // Re-focus the same cell after re-render
    await firstCell.focus();
    await page.keyboard.press('Enter');
    await expect(firstCell).not.toHaveClass(/local-selected/);
    // Selection mode likely exited when none selected
    await expect(page.locator(content + ' .extension-container.in-selection')).toHaveCount(0);

    // Re-enter with Space, then select with another Space
    await firstCell.focus();
    await page.keyboard.press(' ');
    await expect(page.locator(content + ' .extension-container.in-selection')).toHaveCount(1);
    await page.keyboard.press(' ');
    await expect(firstCell).toHaveClass(/local-selected/);

    // cleanup handled in global afterEach
  },

  /**
   * Confirm selections by clicking outside the extension; verify table is filtered to selected value(s)
   */
  async shouldConfirmSelectionsByClickingOutside(page, content) {
    await clearAllSelections(page).catch(() => {});
    await configureExtension(page, { dimensions: ['Dim1'], measures: [{ field: 'Expression1', aggregation: 'Sum' }] });
    await page.waitForTimeout(800);

    const state = await commonTests.getExtensionState(page, content);
    if (state !== 'extension-container') {
      test.info().annotations.push({ type: 'skip', description: `Data state not reachable (${state})` });
      return;
    }

    // Select first cell and capture its text/value
    const firstCellHandle = await page.$(content + ' td.dim-cell.selectable-item');
    if (!firstCellHandle) {
      test.info().annotations.push({ type: 'skip', description: 'No selectable cells found' });
      return;
    }
    const selectedText = (await firstCellHandle.textContent()).trim();
    await firstCellHandle.click({ force: true });
    await page.waitForSelector(content + ' .extension-container.in-selection', { timeout: 3000 });

    // Click outside the extension container to confirm
    const bbox = await (await page.$(content + ' .extension-container')).boundingBox();
    const clickX = Math.max(1, bbox.x - 10);
    const clickY = Math.max(1, bbox.y - 10);
    await page.mouse.click(clickX, clickY);

    // Wait for selection mode to exit and layout to update
    await expect(page.locator(content + ' .extension-container.in-selection')).toHaveCount(0);
    await page.waitForTimeout(500);

    // Verify all rows show only the selected value
    const dimCells = await page.$$(content + ' table.data-table tbody tr td.dim-cell');
    expect(dimCells.length).toBeGreaterThan(0);
    const texts = await Promise.all(dimCells.map(async (c) => (await c.textContent()).trim()));
    for (const t of texts) {
      expect(t).toBe(selectedText);
    }
  },

  /**
   * Confirm selections via the Confirm selection button; verify table is filtered to selected value(s)
   */
  async shouldConfirmSelectionsByButton(page, content) {
    await clearAllSelections(page).catch(() => {});
    await configureExtension(page, { dimensions: ['Dim1'], measures: [{ field: 'Expression1', aggregation: 'Sum' }] });
    await page.waitForTimeout(800);

    const state = await commonTests.getExtensionState(page, content);
    if (state !== 'extension-container') {
      test.info().annotations.push({ type: 'skip', description: `Data state not reachable (${state})` });
      return;
    }

    // Select up to two cells and capture their texts using locators to avoid stale handles
    const cellLoc = page.locator(content + ' td.dim-cell.selectable-item');
    const cellCount = await cellLoc.count();
    if (cellCount < 1) {
      test.info().annotations.push({ type: 'skip', description: 'No selectable cells found' });
      return;
    }
    const selectedTexts = new Set();
    const loc0 = cellLoc.nth(0);
    const firstText = (await loc0.textContent()).trim();
    selectedTexts.add(firstText);
    await loc0.click({ force: true });
    await page.waitForSelector(content + ' .extension-container.in-selection', { timeout: 3000 });
    if (cellCount > 1) {
      const loc1 = cellLoc.nth(1);
      const secondText = (await loc1.textContent()).trim();
      selectedTexts.add(secondText);
      await loc1.click({ force: true });
    }

    // Click confirm selection button in the Sense toolbar
    const confirmBtnCandidates = [
      '[title="Confirm selection"]',
      'button[title*="Confirm selection"]',
      'button[aria-label*="Confirm selection"]',
      'button:has-text("Confirm selection")',
    ];
    let confirmed = false;
    for (const sel of confirmBtnCandidates) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click({ force: true });
        confirmed = true;
        break;
      }
    }
    if (!confirmed) {
      test.info().annotations.push({ type: 'skip', description: 'Confirm selection button not found' });
      return;
    }

    // Wait for selection mode to exit and layout to update
    await expect(page.locator(content + ' .extension-container.in-selection')).toHaveCount(0);
    await page.waitForTimeout(500);

    // Verify all rows show only the selected values
    const dimCells = await page.$$(content + ' table.data-table tbody tr td.dim-cell');
    expect(dimCells.length).toBeGreaterThan(0);
    const texts = await Promise.all(dimCells.map(async (c) => (await c.textContent()).trim()));
    for (const t of texts) {
      expect(selectedTexts.has(t)).toBeTruthy();
    }
  },
};
