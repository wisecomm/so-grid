import { test, expect } from '@playwright/test';

test.describe('SO-Grid Demo - Cell Editing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.so-grid');
    });

    test('should start editing on double click and update value', async ({ page }) => {
        // Find the index of the "Style" column
        const headerIndex = await page.locator('.so-grid__table thead th').evaluateAll((headers) =>
            headers.findIndex(h => h.textContent?.trim() === 'Style')
        );
        expect(headerIndex).toBeGreaterThan(-1);

        // Targeted cell in the first row
        const firstRowCells = page.locator('.so-grid__table tbody tr').first().locator('td');
        const styleCell = firstRowCells.nth(headerIndex);

        // Initial check - get current text
        await expect(styleCell).toBeVisible();
        const initialValue = await styleCell.textContent();

        // Double click to edit
        await styleCell.dblclick();

        // Expect the select editor to appear
        const select = styleCell.locator('select');
        await expect(select).toBeVisible();

        // Select a new value
        // We know 'Bold', 'Italic', 'Underline', 'Modern' are likely options.
        // Let's pick a value different from initial.
        const newValue = (initialValue?.includes('Bold')) ? 'Modern' : 'Bold';
        await select.selectOption(newValue);

        // Press Enter to confirm
        await select.press('Enter');

        // Check if the cell text updated
        await expect(styleCell).toContainText(newValue);
    });
});
