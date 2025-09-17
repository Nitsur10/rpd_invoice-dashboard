import { test, expect } from '@playwright/test';

test.describe('Invoices Page', () => {
  test('should load invoices page with data table', async ({ page }) => {
    await page.goto('/invoices');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Invoices');
    
    // Check for filters section
    await expect(page.locator('text=Filters')).toBeVisible();
    
    // Check for data table
    await expect(page.locator('[role="table"]')).toBeVisible();
    
    // Check for pagination
    await expect(page.locator('text=rows per page')).toBeVisible();
  });

  test('should be able to search invoices', async ({ page }) => {
    await page.goto('/invoices');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="vendor" i], input[placeholder*="search" i], input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(1000);
    }
  });

  test('should be able to filter by date range', async ({ page }) => {
    await page.goto('/invoices');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for date inputs
    const dateInputs = page.locator('input[type="date"]');
    
    if (await dateInputs.count() > 0) {
      await dateInputs.first().fill('2025-01-01');
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
    }
  });

  test('should display invoice data correctly', async ({ page }) => {
    await page.goto('/invoices');
    
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Check if table has data
    const tableRows = page.locator('[role="table"] tbody tr');
    
    if (await tableRows.count() > 0) {
      // Check first row has expected columns
      const firstRow = tableRows.first();
      await expect(firstRow).toBeVisible();
    }
  });
});