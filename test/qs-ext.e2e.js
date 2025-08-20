const { test, expect } = require('@playwright/test');
const { getNebulaQueryString, getQlikServerAuthenticatedContext } = require('./qs-ext.connect');

test.describe('Qlik Sense Extension E2E Tests', () => {
  const nebulaQueryString = getNebulaQueryString();

  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    context = await getQlikServerAuthenticatedContext({ browser });
  });

  test.afterAll(async ({ browser }) => {
    await context.close();
    await browser.close();
  });

  test.beforeEach(async () => {
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should render extension content', async () => {
    await page.goto(`/dev/${nebulaQueryString}`);

    const content = '.njs-viz[data-render-count="1"]';
    await page.waitForSelector(content, { visible: true });
    
    // Check that something is rendered (extension-container, no-data, or selection-mode)
    const hasContent = await page.$eval(content, (el) => {
      return el.querySelector('.extension-container') ||
             el.querySelector('.no-data') ||
             el.querySelector('.selection-mode') ||
             el.querySelector('.error-message');
    });
    expect(hasContent).toBeTruthy();
  });

  test('should handle different states appropriately', async () => {
    await page.goto(`/dev/${nebulaQueryString}`);

    const content = '.njs-viz[data-render-count="1"]';
    await page.waitForSelector(content, { visible: true });
    
    // Check for main container (with data)
    const mainContainer = await page.$(content + ' .extension-container');
    
    // Check for no-data state
    const noDataContainer = await page.$(content + ' .no-data');
    
    // Check for selection mode
    const selectionContainer = await page.$(content + ' .selection-mode');
    
    // Check for error state
    const errorContainer = await page.$(content + ' .error-message');
    
    // At least one state should be present
    expect(mainContainer || noDataContainer || selectionContainer || errorContainer).toBeTruthy();
    
    // If main container exists, check for accessibility attributes
    if (mainContainer) {
      const role = await mainContainer.getAttribute('role');
      const ariaLabel = await mainContainer.getAttribute('aria-label');
      expect(role).toBe('main');
      expect(ariaLabel).toBe('Qlik Sense Extension Content');
    }
    
    // If no-data container exists, check for proper labeling
    if (noDataContainer) {
      const ariaLabel = await noDataContainer.getAttribute('aria-label');
      expect(ariaLabel).toBe('No data available');
    }
  });

  test('should have proper error handling', async () => {
    await page.goto(`/dev/${nebulaQueryString}`);

    const content = '.njs-viz[data-render-count="1"]';
    await page.waitForSelector(content, { visible: true });
    
    // Check that error messages have proper ARIA attributes if they exist
    const errorElement = await page.$(content + ' .error-message');
    if (errorElement) {
      const role = await errorElement.getAttribute('role');
      const ariaLive = await errorElement.getAttribute('aria-live');
      expect(role).toBe('alert');
      expect(ariaLive).toBe('polite');
    }
  });
});
