import { test, expect } from '@playwright/test';

test.describe('SO-Grid Demo - Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display page title', async ({ page }) => {
        await expect(page).toHaveTitle('SO-Grid Demo');
    });

    test('should display sidebar with menu items', async ({ page }) => {
        await expect(page.locator('.sidebar-header h1')).toHaveText('SO-Grid Demo');
        await expect(page.locator('.menu-item')).toHaveCount(3);
    });

    test('should navigate to Order Demo by default', async ({ page }) => {
        const orderButton = page.locator('button.menu-item', { hasText: 'Order Demo' });
        await expect(orderButton).toHaveClass(/active/);
    });

    test('should navigate to Client-Side Grid', async ({ page }) => {
        const clientButton = page.locator('button.menu-item', { hasText: 'Client-Side Grid' });
        await clientButton.click();
        await expect(clientButton).toHaveClass(/active/);
    });

    test('should navigate to Server-Side Grid', async ({ page }) => {
        const serverButton = page.locator('button.menu-item', { hasText: 'Server-Side Grid' });
        await serverButton.click();
        await expect(serverButton).toHaveClass(/active/);
    });
});
