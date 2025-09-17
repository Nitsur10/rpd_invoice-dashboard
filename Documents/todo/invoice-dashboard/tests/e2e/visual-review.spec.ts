import { test, expect, Page } from '@playwright/test';
import path from 'path';

test.describe('Visual Application Review', () => {
  const pages = [
    { name: 'dashboard', url: '/', title: 'Dashboard' },
    { name: 'invoices', url: '/invoices', title: 'Invoices' },
    { name: 'kanban', url: '/kanban', title: 'Kanban Board' },
    { name: 'analytics', url: '/analytics', title: 'Analytics' },
    { name: 'settings', url: '/settings', title: 'Settings' },
    { name: 'status', url: '/status', title: 'Status' },
  ];

  async function capturePageScreenshots(page: Page, pageName: string) {
    // Desktop screenshot
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ 
      path: `screenshots/${pageName}-desktop.png`, 
      fullPage: true 
    });

    // Tablet screenshot
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ 
      path: `screenshots/${pageName}-tablet.png`, 
      fullPage: true 
    });

    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: `screenshots/${pageName}-mobile.png`, 
      fullPage: true 
    });
  }

  test('Capture all pages for visual review', async ({ page }) => {
    // Create screenshots directory
    await page.evaluate(() => {
      // Create screenshots directory in the browser context if needed
    });

    for (const pageInfo of pages) {
      console.log(`Capturing ${pageInfo.title} page...`);
      
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // Wait for any dynamic content to load
      await page.waitForTimeout(2000);
      
      // Capture screenshots at different viewport sizes
      await capturePageScreenshots(page, pageInfo.name);
      
      // Check for any console errors
      const logs: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          logs.push(`Console Error on ${pageInfo.title}: ${msg.text()}`);
        }
      });
    }
  });

  test('Analyze UI components and accessibility', async ({ page }) => {
    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // Check for accessibility violations
      const accessibilityResults = await page.evaluate(() => {
        const issues: string[] = [];
        
        // Check for missing alt text
        const images = document.querySelectorAll('img:not([alt])');
        if (images.length > 0) {
          issues.push(`${images.length} images missing alt text`);
        }
        
        // Check for heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
          issues.push('No heading structure found');
        }
        
        // Check for form labels
        const inputs = document.querySelectorAll('input:not([aria-label]):not([id])');
        if (inputs.length > 0) {
          issues.push(`${inputs.length} inputs without proper labels`);
        }
        
        return issues;
      });
      
      if (accessibilityResults.length > 0) {
        console.log(`Accessibility issues on ${pageInfo.title}:`, accessibilityResults);
      }
      
      // Analyze layout and spacing
      const layoutAnalysis = await page.evaluate(() => {
        const analysis = {
          hasNavigation: !!document.querySelector('nav'),
          hasHeader: !!document.querySelector('header'),
          hasMain: !!document.querySelector('main'),
          hasFooter: !!document.querySelector('footer'),
          cardCount: document.querySelectorAll('[class*="card"]').length,
          buttonCount: document.querySelectorAll('button').length,
          linkCount: document.querySelectorAll('a').length,
        };
        return analysis;
      });
      
      console.log(`Layout analysis for ${pageInfo.title}:`, layoutAnalysis);
    }
  });

  test('Performance and loading analysis', async ({ page }) => {
    for (const pageInfo of pages) {
      const startTime = Date.now();
      
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Check for large images or assets
      const resourceAnalysis = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const largeImages = images.filter(img => {
          return img.naturalWidth > 2000 || img.naturalHeight > 2000;
        });
        
        return {
          totalImages: images.length,
          largeImages: largeImages.length,
          hasLazyLoading: images.some(img => img.loading === 'lazy'),
        };
      });
      
      console.log(`${pageInfo.title} - Load time: ${loadTime}ms, Resources:`, resourceAnalysis);
    }
  });
});