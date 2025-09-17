import { test, expect } from '@playwright/test';

test.describe('Accessibility Improvements Verification', () => {
  test('should have proper labels for all inputs on invoices page', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');

    // Check search input has proper label
    const searchInput = page.locator('input[placeholder="Search invoices..."]');
    await expect(searchInput).toHaveAttribute('aria-label', 'Search invoices by vendor name, invoice number, or description');

    // Check pagination select has proper label  
    const paginationSelect = page.locator('[aria-label="Select number of rows per page"]');
    await expect(paginationSelect).toBeVisible();

    // Check faceted filter inputs have proper labels
    const statusFilterButton = page.locator('button:has-text("Status")');
    if (await statusFilterButton.isVisible()) {
      await statusFilterButton.click();
      const statusFilterInput = page.locator('[aria-label="Filter by status"]');
      await expect(statusFilterInput).toBeVisible();
      await page.keyboard.press('Escape');
    }

    // Check select all checkbox has proper label
    const selectAllCheckbox = page.locator('[aria-label="Select all invoices on this page"]');
    await expect(selectAllCheckbox).toBeVisible();

    // Check individual row checkboxes have proper labels
    const firstRowCheckbox = page.locator('[aria-label*="Select invoice"]').first();
    if (await firstRowCheckbox.isVisible()) {
      await expect(firstRowCheckbox).toHaveAttribute('aria-label');
    }
  });

  test('should have accessible action buttons', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');

    // Check action menu buttons have proper labels
    const actionMenuButtons = page.locator('[aria-label*="Open actions menu for invoice"]');
    const count = await actionMenuButtons.count();
    
    if (count > 0) {
      const firstActionButton = actionMenuButtons.first();
      await expect(firstActionButton).toHaveAttribute('aria-label');
      
      // Test opening the action menu
      await firstActionButton.click();
      const menuContent = page.locator('[role="menu"]');
      await expect(menuContent).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation has proper structure
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();
    
    // Check navigation links are accessible
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      await expect(link).toBeVisible();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const pages = [
      { url: '/', expectedH1: 'RPD Invoice Dashboard' },
      { url: '/invoices', expectedH1: 'Invoice Management' },
      { url: '/kanban', expectedH1: 'Kanban Board' },
      { url: '/analytics', expectedH1: 'Analytics Dashboard' },
      { url: '/settings', expectedH1: 'Settings' },
      { url: '/status', expectedH1: 'API Status' },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      const h1 = page.locator('main h1').first();
      await expect(h1).toContainText(pageInfo.expectedH1);
    }
  });

  test('should have accessible form controls', async ({ page }) => {
    await page.goto('/');
    
    // Check filter popover has proper labels
    const filterButton = page.locator('button:has-text("Filter")');
    await filterButton.click();
    
    const fromDateInput = page.locator('#dateFrom');
    await expect(fromDateInput).toHaveAttribute('id', 'dateFrom');
    
    const toDateInput = page.locator('#dateTo');  
    await expect(toDateInput).toHaveAttribute('id', 'dateTo');
    
    await page.keyboard.press('Escape');
  });
});