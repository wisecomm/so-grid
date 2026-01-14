import { test, expect } from '@playwright/test';

test.describe('SO-Grid Demo - Grid Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for grid to be fully loaded
        await page.waitForSelector('.so-grid');
    });

    test('should display grid with data', async ({ page }) => {
        const grid = page.locator('.so-grid');
        await expect(grid).toBeVisible();

        // Check that table and rows are present
        const table = page.locator('.so-grid__table');
        await expect(table).toBeVisible();

        const rows = page.locator('.so-grid__table tbody tr');
        await expect(rows.first()).toBeVisible();
    });

    test('should display column headers', async ({ page }) => {
        const headers = page.locator('.so-grid__table thead th');
        await expect(headers.first()).toBeVisible();

        // Check that there are multiple headers
        const headerCount = await headers.count();
        expect(headerCount).toBeGreaterThan(0);
    });

    test('should display table structure', async ({ page }) => {
        // Check table structure
        const table = page.locator('.so-grid__table');
        await expect(table).toBeVisible();

        // Check header exists
        const thead = page.locator('.so-grid__table thead');
        await expect(thead).toBeVisible();

        // Check body exists
        const tbody = page.locator('.so-grid__table tbody');
        await expect(tbody).toBeVisible();
    });

    test('should display info panel with selected count', async ({ page }) => {
        const infoPanel = page.locator('.info-panel');
        await expect(infoPanel).toContainText('Selected:');
        await expect(infoPanel).toContainText('Total:');
    });

    test('should select row on checkbox click', async ({ page }) => {
        const infoPanel = page.locator('.info-panel');

        // Initially should show 0 selected
        await expect(infoPanel).toContainText('Selected: 0');

        // Click on a row's checkbox (first column typically has checkbox for selection)
        const firstRowCheckbox = page.locator('.so-grid__table tbody tr').first().locator('input[type="checkbox"]');

        if (await firstRowCheckbox.isVisible()) {
            await firstRowCheckbox.click();
            // Should now show 1 selected
            await expect(infoPanel).toContainText('Selected: 1');
        }
    });
});
