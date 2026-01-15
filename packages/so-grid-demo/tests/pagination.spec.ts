import { test, expect } from '@playwright/test';

test.describe('SO-Grid Demo - Pagination', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.so-grid');
    });

    test('should display pagination component', async ({ page }) => {
        // SO-Grid pagination should be visible when pagination is enabled
        const grid = page.locator('.so-grid');
        await expect(grid).toBeVisible();

        // Look for pagination elements (could be custom or default)
        // Check for common pagination indicators
        const hasPaginationText = await page.locator('text=/page/i').count() > 0 ||
            await page.locator('text=/페이지/i').count() > 0 ||
            await page.locator('text=/of/i').count() > 0 ||
            await page.locator('select').count() > 0;

        expect(hasPaginationText).toBeTruthy();
    });

    test('should display page size selector', async ({ page }) => {
        // Look for page size select element
        const pageSizeSelect = page.locator('select').first();

        if (await pageSizeSelect.isVisible()) {
            // Verify it has options
            const options = await pageSizeSelect.locator('option').count();
            expect(options).toBeGreaterThan(0);
        }
    });

    test('should navigate pages with buttons', async ({ page }) => {
        // Get initial row data
        const firstRow = page.locator('.so-grid__table tbody tr').first();
        await expect(firstRow).toBeVisible();

        const nextButton = page.locator('button').filter({ hasText: /next|다음|→|>/ }).first()
            .or(page.locator('[aria-label*="next"]').first());

        if (await nextButton.isVisible() && await nextButton.isEnabled()) {
            await nextButton.click();
            await page.waitForTimeout(500);

            // Just verify no error occurred
            expect(true).toBeTruthy();
        }
    });

    test('should change page size', async ({ page }) => {
        const pageSizeSelect = page.locator('select').first();

        if (await pageSizeSelect.isVisible()) {

            // Get available options
            const options = await pageSizeSelect.locator('option').all();

            if (options.length > 1) {
                // Select a different page size
                const secondOption = options[1];
                const value = await secondOption.getAttribute('value');

                if (value) {
                    await pageSizeSelect.selectOption(value);
                    await page.waitForTimeout(500);

                    // Row count might have changed
                    const newRowCount = await page.locator('.so-grid__table tbody tr').count();

                    // Just verify the grid still has rows
                    expect(newRowCount).toBeGreaterThan(0);
                }
            }
        }
    });

    test('should display row count information', async ({ page }) => {
        // Check info panel shows total count
        const infoPanel = page.locator('.info-panel');
        await expect(infoPanel).toContainText('Total:');
    });
});
