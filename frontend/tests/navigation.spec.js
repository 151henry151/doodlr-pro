// @ts-check
const { test, expect } = require('@playwright/test');

// Assumes Expo web is running at localhost:19006 and backend at 8000

test.describe('Hierarchical navigation', () => {
  test('L1 (0,0) -> L2 (0,0) -> L3 (0,1)', async ({ page }) => {
    await page.goto('/');

    // Wait for level 1 to render
    await expect(page.getByTestId('debug-label')).toContainText('Level 1');

    // Click L1 section (0,0)
    await page.getByTestId('section-1-0-0').click();
    await expect(page.getByTestId('debug-label')).toContainText('Level 2');

    // Click L2 section (0,0)
    await page.getByTestId('section-2-0-0').click();
    await expect(page.getByTestId('debug-label')).toContainText('Level 3');

    // We are at L3 after clicking (0,0). Now go back to L2 then click (0,1)
    // Alternatively, navigate directly to another L3 section from L3 grid
    // Click L3 section (0,1)
    await page.getByTestId('section-3-0-1').click();
    await expect(page.getByTestId('debug-label')).toContainText('Level 4');
  });
}); 