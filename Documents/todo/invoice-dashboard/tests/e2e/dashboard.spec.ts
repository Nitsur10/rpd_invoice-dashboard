import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loaded
    await expect(page).toHaveTitle(/Invoice Manager Pro/);
    
    // Check main dashboard elements - use the main content h1
    await expect(page.getByRole('heading', { level: 1, name: /RPD Invoice Dashboard/i })).toBeVisible();
    
    // Check navigation
    await expect(page.getByRole('navigation', { name: /Main navigation/i })).toBeVisible();
    
    // Check stats cards are present (or any dashboard content)
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to invoices page', async ({ page }) => {
    await page.goto('/');
    
    // Click on invoices navigation
    await page.getByRole('link', { name: /Invoices/i }).click();
    
    // Verify we're on invoices page
    await expect(page).toHaveURL('/invoices');
    await expect(page.getByRole('heading', { level: 1, name: /Invoice Management/i })).toBeVisible();
  });

  test('should navigate to kanban page', async ({ page }) => {
    await page.goto('/');
    
    // Click on kanban navigation
    await page.getByRole('link', { name: /Kanban Board/i }).click();
    
    // Verify we're on kanban page
    await expect(page).toHaveURL('/kanban');
    await expect(page.getByRole('heading', { level: 1, name: /Kanban Board/i })).toBeVisible();
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.goto('/');
    
    // Click on analytics navigation
    await page.getByRole('link', { name: /Analytics/i }).click();
    
    // Verify we're on analytics page
    await expect(page).toHaveURL('/analytics');
    await expect(page.getByRole('heading', { level: 1, name: /Analytics/i })).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/');
    
    // Click on settings navigation
    await page.getByRole('link', { name: /Settings/i }).click();
    
    // Verify we're on settings page
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { level: 1, name: /Settings/i })).toBeVisible();
  });

  test('should navigate to status page', async ({ page }) => {
    await page.goto('/');
    
    // Click on status navigation
    await page.getByRole('link', { name: /API Status/i }).click();
    
    // Verify we're on status page
    await expect(page).toHaveURL('/status');
    await expect(page.getByRole('heading', { level: 1, name: /API Status/i })).toBeVisible();
  });
});
