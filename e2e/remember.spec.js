import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('remember preferences opts in, survives reload, and can be cleared', async ({ page }) => {
  await page.goto('/demo/'); await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: /accessibility settings/i })).toBeVisible();
  const toggleBox = await dialog.getByRole('button', { name: /accessibility settings/i }).boundingBox();
  expect(toggleBox.width).toBeGreaterThan(0); expect(toggleBox.height).toBeGreaterThan(0);
  await dialog.getByRole('button', { name: /accessibility settings/i }).click();
  const remember = dialog.getByLabel(/remember settings on this device/i);
  await expect(remember).not.toBeChecked();
  await expect(dialog.getByText(/do not tick this on a shared computer/i)).toBeVisible();
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  expect(axe.violations.filter((v) => ['critical','serious'].includes(v.impact))).toEqual([]);
  await remember.check(); await dialog.getByLabel(/large \(125%\)/i).check();
  await page.reload(); await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  await dialog.getByRole('button', { name: /accessibility settings/i }).click();
  await expect(page.getByLabel(/remember settings on this device/i)).toBeChecked();
  await expect(page.locator('#wizard-dialog .bridge')).toHaveAttribute('data-text-scale', '125');
  await page.getByLabel(/remember settings on this device/i).uncheck();
  await page.reload(); await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  await dialog.getByRole('button', { name: /accessibility settings/i }).click();
  await expect(page.getByLabel(/remember settings on this device/i)).not.toBeChecked();
});

test('login support seeds only default preferences after successful login', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'test-token', user: { id: 'u1', fullName: 'Test User', support: ['screenReader', 'largeText'] } }) }));
  await page.goto('/demo/'); await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  const dialog = page.getByRole('dialog'); await dialog.getByRole('button', { name: /^log in$/i }).click();
  await dialog.getByLabel(/phone number or email/i).fill('test@example.com'); await dialog.getByLabel(/password/i).fill('password123');
  await dialog.getByRole('button', { name: /^log in$/i }).click();
  await dialog.getByRole('button', { name: /accessibility settings/i }).click();
  await expect(dialog.getByLabel(/read questions aloud automatically/i)).toBeChecked();
  await expect(dialog.locator('.bridge')).toHaveAttribute('data-text-scale', '150');
  await expect(dialog.getByRole('status')).toContainText(/because you asked for them when you registered/i);
});


test('blocked local storage does not break settings or create page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  });
  await page.goto('/demo/');
  await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  await page.getByRole('dialog').getByRole('button', { name: /accessibility settings/i }).click();
  await page.getByLabel(/remember settings on this device/i).check();
  await page.getByLabel(/remember settings on this device/i).uncheck();
  expect(errors).toEqual([]);
});

test('empty support data does not announce preference seeding', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'test-token', user: { id: 'u2', fullName: 'Test User', support: [] } }) }));
  await page.goto('/demo/'); await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  const dialog = page.getByRole('dialog'); await dialog.getByRole('button', { name: /^log in$/i }).click();
  await dialog.getByLabel(/phone number or email/i).fill('test@example.com'); await dialog.getByLabel(/password/i).fill('password123');
  await dialog.getByRole('button', { name: /^log in$/i }).click();
  await dialog.getByRole('button', { name: /accessibility settings/i }).click();
  await expect(dialog.getByRole('status')).toHaveText('');
});
