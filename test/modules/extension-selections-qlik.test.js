/**
 * @fileoverview Qlik behavioral selection tests.
 *
 * Validates interactions that drive the Qlik associative engine — entering
 * selection mode, confirming, cancelling, and verifying that the engine-side
 * state is reflected in the extension's rendered output.
 *
 * All tests configure the extension with Dim1 only. Measures are optional
 * and not selectable, so they are excluded to keep the setup minimal.
 *
 * Test app data: Dim1 has three values — A, B, C — across 1000 transactions.
 * All three values are always present after a data reload.
 * See test/qlik-sense-app/load-script.qvs.
 */

import { test, expect } from '@playwright/test';
import { IDENTIFIERS, TIMEOUTS } from '../lib/core/identifiers.js';
import { CONFIGURATION_IDENTIFIERS } from '../lib/core/configuration-identifiers.js';
import { assertCleanExtensionState } from '../lib/utilities/test-setup.js';

/**
 * Clicks "Clear all selections" in the Nebula Hub selection bar and waits for
 * all three Dim1 values (A, B, C) to return to the extension.
 *
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} hub
 */
async function clearAllSelectionsAndVerify(hub) {
  const clearAllBtn = hub.page.locator('[title="Clear all selections"]');
  await expect(
    clearAllBtn,
    '"Clear all selections" button not visible — selection bar title selector may have drifted.'
  ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
  await clearAllBtn.click();
  console.log('   • Clear all selections: clicked');

  for (const value of ['A', 'B', 'C']) {
    await expect(
      hub.page.getByLabel(`Select ${value}`, { exact: true }),
      `Dim1 value "${value}" not visible after clearing selections — engine filter may not have been removed.`
    ).toBeVisible({ timeout: TIMEOUTS.NETWORK });
    console.log(`   • Post-clear: ✅ "${value}" visible`);
  }
}

/**
 * Configures the extension with Dim1 via the Nebula Hub data panel.
 * Shared setup for all selection tests — waits for the extension to reach
 * complete state before returning.
 *
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} hub
 */
async function configureDim1(hub) {
  const addDimensionBtn = hub.page.locator(CONFIGURATION_IDENTIFIERS.ADD_DIMENSION_BUTTON);
  await expect(
    addDimensionBtn,
    'Add Dimension button not visible — hub may still be loading or selector has drifted.'
  ).toBeVisible({ timeout: TIMEOUTS.NETWORK });
  await addDimensionBtn.click();

  const searchInput = hub.page.locator(CONFIGURATION_IDENTIFIERS.FIELD_PICKER_SEARCH).first();
  await expect(searchInput).toBeVisible({ timeout: TIMEOUTS.STANDARD });
  await searchInput.fill('Dim1');

  const fieldNav = hub.page.locator('nav').first();
  await expect(fieldNav).toBeVisible({ timeout: TIMEOUTS.STANDARD });

  const dim1Option = hub.page.getByRole('button', { name: 'Dim1', exact: true });
  await expect(
    dim1Option,
    '"Dim1" not found in field picker — verify the test app data model has a Dim1 field (see test/qlik-sense-app/load-script.qvs).'
  ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
  await dim1Option.click();

  // Wait for the extension to reach complete state before the test body runs
  await expect(
    hub.page.locator(IDENTIFIERS.INCOMPLETE_VISUALIZATION),
    'Incomplete visualization still visible after Dim1 added — extension did not transition to complete state.'
  ).toBeHidden({ timeout: TIMEOUTS.NETWORK });
  await expect(
    hub.page.locator(IDENTIFIERS.COMPLETE_VISUALIZATION),
    'Complete visualization not found after Dim1 added — extension did not reach rendered state.'
  ).toBeAttached({ timeout: TIMEOUTS.NETWORK });

  console.log('   • Setup: ✅ Extension configured with Dim1 and in complete state');
}

/**
 * Qlik behavioral selection tests.
 *
 * @param {Object} testContext
 * @param {import('@playwright/test').Page} testContext.page
 * @param {import('../lib/page-objects/nebula-hub').NebulaHubPage} testContext.hub
 */
function extensionSelectionsQlikTests(testContext) {
  test.describe('Qlik Behavioral — Selection Mode', () => {
    test.beforeEach(async () => {
      await assertCleanExtensionState(testContext);
    });

    test('validates all three Dim1 values are visible after configuration', async () => {
      const { hub } = testContext;

      await configureDim1(hub);

      // All three Dim1 values must be present as selectable dim cells.
      // The extension renders td.dim-cell elements with aria-label="Select {value}".
      // With 1000 transactions distributed across A/B/C, all three are always present.
      const dimValues = ['A', 'B', 'C'];

      for (const value of dimValues) {
        const cell = hub.page.getByLabel(`Select ${value}`, { exact: true });
        await expect(
          cell,
          `Dim1 value "${value}" not visible — extension may not have rendered data rows, ` +
            'or the test app data does not contain this value. Re-run the load script in the Qlik app.'
        ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
        console.log(`   • Dim1 value "${value}": ✅ Visible`);
      }
    });

    test('selects A, confirms, validates only A visible, clears, validates all three visible', async () => {
      const { hub } = testContext;

      await configureDim1(hub);

      // --- Select A ---
      // Clicking a dim cell enters selection mode: Nebula Hub renders the inline
      // selection menu and the extension container gains the .in-selection class.
      const cellA = hub.page.getByLabel('Select A', { exact: true });
      await expect(
        cellA,
        '"Select A" cell not found — extension may not have rendered or Dim1 data is missing.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await cellA.click();
      console.log('   • Clicked "A": entering selection mode');

      // Confirm .in-selection class is applied to the extension container
      const extensionContainer = hub.page.locator('.extension-container');
      await expect(
        extensionContainer,
        'Extension container does not have .in-selection class after clicking a dim cell — ' +
          'selection mode may not have been entered or the class name has drifted from state-template.js.'
      ).toHaveClass(/in-selection/, { timeout: TIMEOUTS.STANDARD });
      console.log('   • Extension container: ✅ .in-selection class present');

      // Confirm A is marked as selected in the working session
      await expect(
        cellA,
        '"Select A" cell does not have .local-selected class — selection state not reflected in the cell.'
      ).toHaveClass(/local-selected/, { timeout: TIMEOUTS.STANDARD });
      console.log('   • Cell "A": ✅ .local-selected class present');

      // --- Confirm selection ---
      // The inline menu appears after the first click. Confirming commits the selection
      // to the engine, closes the menu, and triggers a hypercube re-render.
      const confirmBtn = hub.page.getByLabel('Confirm selection', { exact: true });
      await expect(
        confirmBtn,
        '"Confirm selection" button not visible — inline selection menu may not have appeared after clicking the dim cell.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await confirmBtn.click();
      console.log('   • Confirm selection: clicked');

      // .in-selection class must clear once the session is committed
      await expect(
        extensionContainer,
        'Extension container still has .in-selection class after confirming — selection mode did not exit.'
      ).not.toHaveClass(/in-selection/, { timeout: TIMEOUTS.STANDARD });
      console.log('   • Extension container: ✅ .in-selection class removed after confirm');

      // Engine filters the hypercube to A only — B and C must no longer be visible.
      // Use NETWORK timeout: engine round-trip required before the re-render completes.
      await expect(
        hub.page.getByLabel('Select B', { exact: true }),
        '"Select B" still visible after confirming selection of A — engine filter did not apply or extension did not re-render.'
      ).toBeHidden({ timeout: TIMEOUTS.NETWORK });
      await expect(
        hub.page.getByLabel('Select C', { exact: true }),
        '"Select C" still visible after confirming selection of A — engine filter did not apply or extension did not re-render.'
      ).toBeHidden({ timeout: TIMEOUTS.NETWORK });
      await expect(
        hub.page.getByLabel('Select A', { exact: true }),
        '"Select A" not visible after confirming selection — extension may have lost the selected value.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      console.log('   • Post-confirm: ✅ Only "A" visible, "B" and "C" hidden');

      // --- Clear all selections ---
      // The Nebula Hub selection bar is always visible. After confirming, the active
      // selection entry appears in the bar. Selection bar buttons use title attribute,
      // not aria-label — getByLabel() does not match them.
      await clearAllSelectionsAndVerify(hub);
    });

    test('selects B and C, confirms, validates only B and C visible, clears, validates all three visible', async () => {
      const { hub } = testContext;

      await configureDim1(hub);

      const extensionContainer = hub.page.locator('.extension-container');

      // --- Select B ---
      const cellB = hub.page.getByLabel('Select B', { exact: true });
      await expect(
        cellB,
        '"Select B" cell not found — extension may not have rendered or Dim1 data is missing.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await cellB.click();
      console.log('   • Clicked "B": entering selection mode');

      await expect(
        extensionContainer,
        'Extension container does not have .in-selection class after clicking "B".'
      ).toHaveClass(/in-selection/, { timeout: TIMEOUTS.STANDARD });
      await expect(cellB).toHaveClass(/local-selected/, { timeout: TIMEOUTS.STANDARD });
      console.log('   • Cell "B": ✅ .in-selection active, .local-selected present');

      // --- Select C while still in the same session ---
      // The inline menu stays open between clicks within a session — clicking a second
      // dim cell accumulates it into the working selection without closing the menu.
      const cellC = hub.page.getByLabel('Select C', { exact: true });
      await expect(
        cellC,
        '"Select C" cell not found — extension may not have rendered or Dim1 data is missing.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await cellC.click();
      console.log('   • Clicked "C": accumulating into selection session');

      await expect(cellC).toHaveClass(/local-selected/, { timeout: TIMEOUTS.STANDARD });
      console.log('   • Cell "C": ✅ .local-selected present');

      // --- Confirm B and C ---
      const confirmBtn = hub.page.getByLabel('Confirm selection', { exact: true });
      await expect(
        confirmBtn,
        '"Confirm selection" button not visible — inline selection menu may have closed unexpectedly.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await confirmBtn.click();
      console.log('   • Confirm selection: clicked');

      await expect(
        extensionContainer,
        'Extension container still has .in-selection class after confirming.'
      ).not.toHaveClass(/in-selection/, { timeout: TIMEOUTS.STANDARD });
      console.log('   • Extension container: ✅ .in-selection class removed after confirm');

      // Engine filters the hypercube to B and C — A must no longer be visible.
      // B and C must both remain. Use NETWORK timeout for the engine round-trip.
      await expect(
        hub.page.getByLabel('Select A', { exact: true }),
        '"Select A" still visible after confirming B and C — engine filter did not apply or extension did not re-render.'
      ).toBeHidden({ timeout: TIMEOUTS.NETWORK });
      await expect(
        hub.page.getByLabel('Select B', { exact: true }),
        '"Select B" not visible after confirming — engine may have filtered it out incorrectly.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await expect(
        hub.page.getByLabel('Select C', { exact: true }),
        '"Select C" not visible after confirming — engine may have filtered it out incorrectly.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      console.log('   • Post-confirm: ✅ "A" hidden, "B" and "C" visible');

      // --- Clear all selections ---
      await clearAllSelectionsAndVerify(hub);
    });

    test('selects A, cancels, validates all three values still visible', async () => {
      const { hub } = testContext;

      await configureDim1(hub);

      const extensionContainer = hub.page.locator('.extension-container');

      // --- Select A ---
      const cellA = hub.page.getByLabel('Select A', { exact: true });
      await expect(
        cellA,
        '"Select A" cell not found — extension may not have rendered or Dim1 data is missing.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await cellA.click();
      console.log('   • Clicked "A": entering selection mode');

      await expect(
        extensionContainer,
        'Extension container does not have .in-selection class after clicking "A".'
      ).toHaveClass(/in-selection/, { timeout: TIMEOUTS.STANDARD });
      console.log('   • Extension container: ✅ .in-selection class present');

      // --- Cancel the selection session ---
      // Cancel discards all working selections without writing to the engine.
      // The inline menu closes and the extension exits selection mode — no hypercube
      // re-render occurs so all three values must remain visible.
      const cancelBtn = hub.page.getByLabel('Cancel selection', { exact: true });
      await expect(
        cancelBtn,
        '"Cancel selection" button not visible — inline selection menu may not have appeared after clicking the dim cell.'
      ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await cancelBtn.click();
      console.log('   • Cancel selection: clicked');

      // .in-selection class must clear immediately — no engine round-trip on cancel
      await expect(
        extensionContainer,
        'Extension container still has .in-selection class after cancelling — selection mode did not exit.'
      ).not.toHaveClass(/in-selection/, { timeout: TIMEOUTS.STANDARD });
      console.log('   • Extension container: ✅ .in-selection class removed after cancel');

      // Engine state is unchanged — all three values must still be visible
      for (const value of ['A', 'B', 'C']) {
        await expect(
          hub.page.getByLabel(`Select ${value}`, { exact: true }),
          `Dim1 value "${value}" not visible after cancelling — engine state should be unchanged but extension may have re-rendered incorrectly.`
        ).toBeVisible({ timeout: TIMEOUTS.STANDARD });
        console.log(`   • Post-cancel: ✅ "${value}" visible`);
      }
    });
  });
}

export { extensionSelectionsQlikTests };
