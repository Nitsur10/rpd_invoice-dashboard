import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loaded
    await expect(page).toHaveTitle(/Invoice Manager Pro/);
    
    // Check main dashboard elements - use the main content h1
    await expect(page.locator('main h1')).toContainText('RPD Invoice Dashboard');
    
    // Check navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Check stats cards are present (or any dashboard content)
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to invoices page', async ({ page }) => {
    await page.goto('/');
    
    // Click on invoices navigation
    await page.click('text=Invoices');
    
    // Verify we're on invoices page
    await expect(page).toHaveURL('/invoices');
    await expect(page.locator('main h1')).toContainText('Invoice Management');
  });

  test('should navigate to kanban page', async ({ page }) => {
    await page.goto('/');
    
    // Click on kanban navigation
    await page.click('text=Kanban Board');
    
    // Verify we're on kanban page
    await expect(page).toHaveURL('/kanban');
    await expect(page.locator('main h1')).toContainText('Kanban Board');
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.goto('/');
    
    // Click on analytics navigation
    await page.click('text=Analytics');
    
    // Verify we're on analytics page
    await expect(page).toHaveURL('/analytics');
    await expect(page.locator('main h1')).toContainText('Analytics Dashboard');
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/');
    
    // Click on settings navigation
    await page.click('text=Settings');
    
    // Verify we're on settings page
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('main h1')).toContainText('Settings');
  });

  test('should navigate to status page', async ({ page }) => {
    await page.goto('/');
    
    // Click on status navigation
    await page.click('text=API Status');
    
    // Verify we're on status page
    await expect(page).toHaveURL('/status');
    await expect(page.locator('main h1')).toContainText('API Status');
  });
});