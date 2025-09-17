import { test, expect } from '@playwright/test';

test.describe('Detailed Issue Investigation', () => {
  test('investigate "247" in invoices tab and amount visibility', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for data to load

    // Screenshot for analysis
    await page.screenshot({ 
      path: 'screenshots/invoices-investigation.png', 
      fullPage: true 
    });

    // Look for "247" text in the page
    const pageContent = await page.textContent('body');
    console.log('=== CHECKING FOR "247" ===');
    if (pageContent?.includes('247')) {
      console.log('✅ Found "247" in page content');
      
      // Find all elements containing "247"
      const elementsWithText = await page.locator('text=247').all();
      console.log(`Found ${elementsWithText.length} elements containing "247"`);
      
      for (let i = 0; i < elementsWithText.length; i++) {
        const element = elementsWithText[i];
        const elementText = await element.textContent();
        const elementTag = await element.evaluate(el => el.tagName);
        const elementClass = await element.getAttribute('class');
        console.log(`Element ${i + 1}: ${elementTag} with class "${elementClass}" contains: "${elementText}"`);
      }
    } else {
      console.log('❌ "247" not found in page content');
    }

    // Check invoice amount visibility
    console.log('\n=== CHECKING INVOICE AMOUNTS ===');
    
    // Look for amount column header
    const amountHeader = page.locator('text=Amount');
    if (await amountHeader.isVisible()) {
      console.log('✅ Amount column header is visible');
    } else {
      console.log('❌ Amount column header not visible');
    }

    // Look for currency amounts in the table
    const amountCells = page.locator('[class*="amount"], text=/\\$[0-9]/, text=/AUD/, td:has-text("$")');
    const amountCount = await amountCells.count();
    console.log(`Found ${amountCount} potential amount cells`);

    if (amountCount > 0) {
      for (let i = 0; i < Math.min(5, amountCount); i++) {
        const cell = amountCells.nth(i);
        const cellText = await cell.textContent();
        const isVisible = await cell.isVisible();
        console.log(`Amount cell ${i + 1}: "${cellText}" - Visible: ${isVisible}`);
      }
    } else {
      console.log('❌ No amount cells found - investigating table structure');
      
      // Check table headers
      const tableHeaders = page.locator('th, [role="columnheader"]');
      const headerCount = await tableHeaders.count();
      console.log(`Found ${headerCount} table headers:`);
      
      for (let i = 0; i < headerCount; i++) {
        const header = tableHeaders.nth(i);
        const headerText = await header.textContent();
        console.log(`Header ${i + 1}: "${headerText}"`);
      }

      // Check table cells in first row
      const firstRowCells = page.locator('tbody tr:first-child td, [role="row"]:first-child [role="cell"]');
      const cellCount = await firstRowCells.count();
      console.log(`\nFirst row has ${cellCount} cells:`);
      
      for (let i = 0; i < cellCount; i++) {
        const cell = firstRowCells.nth(i);
        const cellText = await cell.textContent();
        const isVisible = await cell.isVisible();
        console.log(`Cell ${i + 1}: "${cellText}" - Visible: ${isVisible}`);
      }
    }

    // Check if there are any CSS issues hiding amounts
    const hiddenElements = page.locator('[style*="display: none"], [style*="visibility: hidden"], .sr-only');
    const hiddenCount = await hiddenElements.count();
    console.log(`\nFound ${hiddenCount} potentially hidden elements`);
  });

  test('verify filter functionality across all pages', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Dashboard' },
      { url: '/invoices', name: 'Invoices' },
      { url: '/kanban', name: 'Kanban' },
      { url: '/analytics', name: 'Analytics' },
      { url: '/settings', name: 'Settings' },
      { url: '/status', name: 'Status' },
    ];

    for (const pageInfo of pages) {
      console.log(`\n=== CHECKING FILTERS ON ${pageInfo.name.toUpperCase()} PAGE ===`);
      
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for filter buttons or inputs
      const filterElements = page.locator('button:has-text("Filter"), input[placeholder*="filter" i], input[placeholder*="search" i], [aria-label*="filter" i], [data-testid*="filter"]');
      const filterCount = await filterElements.count();
      
      console.log(`Found ${filterCount} filter elements`);

      if (filterCount > 0) {
        for (let i = 0; i < filterCount; i++) {
          const filter = filterElements.nth(i);
          const filterText = await filter.textContent();
          const filterPlaceholder = await filter.getAttribute('placeholder');
          const filterAriaLabel = await filter.getAttribute('aria-label');
          const tagName = await filter.evaluate(el => el.tagName);
          
          console.log(`Filter ${i + 1}: ${tagName} - Text: "${filterText}" - Placeholder: "${filterPlaceholder}" - ARIA: "${filterAriaLabel}"`);
          
          // Test if filter is clickable/functional
          if (tagName === 'BUTTON') {
            try {
              await filter.click({ timeout: 2000 });
              console.log(`  ✅ Filter button is clickable`);
              await page.keyboard.press('Escape'); // Close any popover
            } catch (error) {
              console.log(`  ❌ Filter button not clickable: ${error}`);
            }
          }
        }
      } else {
        console.log(`❌ No filter functionality found on ${pageInfo.name} page`);
      }
    }
  });

  test('verify export functionality across all pages', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Dashboard' },
      { url: '/invoices', name: 'Invoices' },
      { url: '/kanban', name: 'Kanban' },
      { url: '/analytics', name: 'Analytics' },
      { url: '/settings', name: 'Settings' },
      { url: '/status', name: 'Status' },
    ];

    for (const pageInfo of pages) {
      console.log(`\n=== CHECKING EXPORT ON ${pageInfo.name.toUpperCase()} PAGE ===`);
      
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Look for export buttons
      const exportElements = page.locator('button:has-text("Export"), button:has-text("Download"), [aria-label*="export" i], [data-testid*="export"], button:has([class*="download"])');
      const exportCount = await exportElements.count();
      
      console.log(`Found ${exportCount} export elements`);

      if (exportCount > 0) {
        for (let i = 0; i < exportCount; i++) {
          const exportBtn = exportElements.nth(i);
          const exportText = await exportBtn.textContent();
          const exportAriaLabel = await exportBtn.getAttribute('aria-label');
          const isVisible = await exportBtn.isVisible();
          const isEnabled = await exportBtn.isEnabled();
          
          console.log(`Export ${i + 1}: "${exportText}" - ARIA: "${exportAriaLabel}" - Visible: ${isVisible} - Enabled: ${isEnabled}`);
          
          // Test if export is clickable
          if (isVisible && isEnabled) {
            try {
              // Don't actually click to avoid downloads, just verify it's clickable
              const boundingBox = await exportBtn.boundingBox();
              if (boundingBox) {
                console.log(`  ✅ Export button is ready for interaction`);
              }
            } catch (error) {
              console.log(`  ❌ Export button not interactive: ${error}`);
            }
          }
        }
      } else {
        console.log(`❌ No export functionality found on ${pageInfo.name} page`);
      }
    }
  });

  test('check navigation indicators and active states', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForLoadState('networkidle');

    console.log('\n=== CHECKING NAVIGATION INDICATORS ===');
    
    // Check for navigation badges or indicators
    const navItems = page.locator('nav a, nav button');
    const navCount = await navItems.count();
    
    console.log(`Found ${navCount} navigation items`);
    
    for (let i = 0; i < navCount; i++) {
      const navItem = navItems.nth(i);
      const navText = await navItem.textContent();
      const hasIndicator = await navItem.locator('[class*="badge"], [class*="indicator"], text=/[0-9]+/').count() > 0;
      
      console.log(`Nav ${i + 1}: "${navText?.trim()}" - Has indicator: ${hasIndicator}`);
      
      if (hasIndicator) {
        const indicators = navItem.locator('[class*="badge"], [class*="indicator"], text=/[0-9]+/');
        const indicatorCount = await indicators.count();
        for (let j = 0; j < indicatorCount; j++) {
          const indicator = indicators.nth(j);
          const indicatorText = await indicator.textContent();
          console.log(`  Indicator ${j + 1}: "${indicatorText}"`);
        }
      }
    }
  });
});