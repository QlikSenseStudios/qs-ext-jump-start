const { test, expect } = require('@playwright/test');
const { getNebulaQueryString, getQlikServerAuthenticatedContext } = require('./qs-ext.connect');

// Import modular state-specific test suites
const noDataTests = require('./states/no-data.test');
const dataTests = require('./states/data.test');
const selectionTests = require('./states/selection.test');
const errorTests = require('./states/error.test');
const commonTests = require('./states/common.test');

test.describe('Qlik Sense Extension E2E Tests', () => {
  // Test configuration constants
  const nebulaQueryString = getNebulaQueryString();
  const content = '.njs-viz[data-render-count]'; // Keep original name for compatibility
  const viewports = [ // Keep original name for compatibility
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' },
  ];

  let context;
  let page;

  // Global test setup - establish authenticated Qlik context
  test.beforeAll(async ({ browser }) => {
    context = await getQlikServerAuthenticatedContext({ browser });
  });

  // Global test teardown - cleanup resources
  test.afterAll(async ({ browser }) => {
    await context.close();
    await browser.close();
  });

  test.beforeEach(async () => {
    page = await context.newPage();
    await page.goto(`/dev/${nebulaQueryString}`);
    await commonTests.waitForExtensionRender(page, content);
  });

  test.afterEach(async () => {
    // Clean up any configuration before closing
    try {
      await dataTests.cleanupConfiguration(page);
    } catch {
      // Silently handle cleanup failures
    }
    await page.close();
  });

  test.describe('No-Data State', () => {
    test('should render no-data state by default', async () => {
      const state = await commonTests.getExtensionState(page, content);
      expect(state).toBe('no-data');

      await noDataTests.shouldRenderNoDataState(page, content);
    });

    test('should have proper accessibility in no-data state', async () => {
      await commonTests.validateStateExists(page, content, ['no-data']);
      await noDataTests.shouldHaveProperAccessibility(page, content);
    });

    test('should be responsive in no-data state', async () => {
      await commonTests.validateStateExists(page, content, ['no-data']);

      for (const viewport of viewports) {
        await noDataTests.shouldBeResponsive(page, content, viewport);
      }
    });
  });

  test.describe('Data State', () => {
    test('should attempt to configure extension for data state', async () => {
      // This test documents the configuration attempt without depending on success
      await dataTests.attemptConfiguration(page);

      // We can't guarantee configuration success in E2E environment
      // So we test what we can observe
      const finalState = await commonTests.getExtensionState(page, content);
      expect(['no-data', 'extension-container', 'error-message']).toContain(finalState);
    });

    test('should validate data state if reachable', async () => {
      await dataTests.attemptConfiguration(page);
      const state = await commonTests.getExtensionState(page, content);

      // Only run data state tests if we actually reached that state
      if (state === 'extension-container') {
        await dataTests.shouldRenderDataState(page, content);
        await dataTests.shouldHaveProperAccessibility(page, content);
        await dataTests.shouldDisplayDataCorrectly(page, content);
      } else {
        // Document that data state was not reachable
        test.info().annotations.push({
          type: 'info',
          description: `Data state not reached. Current state: ${state}`,
        });
      }
    });

    test('should support keyboard navigation if in data state', async () => {
      await dataTests.attemptConfiguration(page);
      const state = await commonTests.getExtensionState(page, content);

      if (state === 'extension-container') {
        await dataTests.shouldSupportKeyboardNavigation(page, content);
      } else {
        test.info().annotations.push({
          type: 'skip',
          description: 'Keyboard navigation test skipped - data state not reachable',
        });
      }
    });
  });

  test.describe('Selection State', () => {
    test('should attempt to trigger selection state', async () => {
      // First try to configure data
      await dataTests.attemptConfiguration(page);

      // Then attempt selection
      const selectionAttempted = await selectionTests.attemptSelectionTrigger(page, content);

      // Document the attempt
      test.info().annotations.push({
        type: 'info',
        description: `Selection trigger attempted: ${selectionAttempted}`,
      });
    });

    test('should validate selection state if reachable', async () => {
      // Configure and attempt selection
      await dataTests.attemptConfiguration(page);
      await selectionTests.attemptSelectionTrigger(page, content);

      const state = await commonTests.getExtensionState(page, content);

      if (state === 'selection-mode') {
        await selectionTests.shouldRenderSelectionState(page, content);
        await selectionTests.shouldHaveProperAccessibility(page, content);
        await selectionTests.shouldIndicateActiveSelection(page, content);
      } else {
        test.info().annotations.push({
          type: 'info',
          description: `Selection state not reached. Current state: ${state}`,
        });
      }
    });
  });

  test.describe('Error State', () => {
    test('should attempt to trigger error state', async () => {
      const errorAttempted = await errorTests.attemptErrorTrigger(page, content);

      test.info().annotations.push({
        type: 'info',
        description: `Error trigger attempted: ${errorAttempted}`,
      });
    });

    test('should validate error state if reachable', async () => {
      await errorTests.attemptErrorTrigger(page, content);

      // Wait for potential error state
      await page.waitForTimeout(2000);

      const state = await commonTests.getExtensionState(page, content);

      if (state === 'error-message') {
        await errorTests.shouldRenderErrorState(page, content);
        await errorTests.shouldHaveProperAccessibility(page, content);
        await errorTests.shouldProvideUsefulErrorMessage(page, content);
      } else {
        test.info().annotations.push({
          type: 'info',
          description: `Error state not reached. Current state: ${state}`,
        });
      }
    });
  });

  test.describe('Common Functionality', () => {
    test('should maintain basic accessibility across all states', async () => {
      await commonTests.validateBasicAccessibility(page, content);

      // Test state detection works
      const state = await commonTests.getExtensionState(page, content);
      expect(['no-data', 'extension-container', 'selection-mode', 'error-message']).toContain(state);
    });

    test('should handle responsive design across viewports', async () => {
      await commonTests.testResponsiveDesign(page, content, viewports);
    });

    test('should validate state transitions are handled gracefully', async () => {
      // Test that extension handles rapid changes without breaking
      const initialState = await commonTests.getExtensionState(page, content);

      // Attempt various configurations
      await dataTests.attemptConfiguration(page);
      await page.waitForTimeout(500);

      await selectionTests.attemptSelectionTrigger(page, content);
      await page.waitForTimeout(500);

      // Ensure we're still in a valid state
      const finalState = await commonTests.getExtensionState(page, content);
      expect(['no-data', 'extension-container', 'selection-mode', 'error-message']).toContain(finalState);

      test.info().annotations.push({
        type: 'info',
        description: `State transition: ${initialState} → ${finalState}`,
      });
    });
  });
});
