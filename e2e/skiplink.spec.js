import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('first Tab reaches the skip wizard button and focus returns after closing', async ({ page }) => {
  await page.goto('/demo/');
  const skip = page.locator('#skip-wizard');
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  const before = await page.evaluate(() => ({
    scrollY: window.scrollY,
    height: document.documentElement.scrollHeight,
  }));
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused().catch(async () => {
    await expect(dialog.locator(':focus')).toHaveCount(1);
  });
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(skip).toBeFocused();
  const after = await page.evaluate(() => ({
    scrollY: window.scrollY,
    height: document.documentElement.scrollHeight,
  }));
  expect(after).toEqual(before);
});

test('Alt+Shift+A opens from page content and from inside a text input', async ({ page }) => {
  await page.goto('/demo/');
  await page.keyboard.press('Alt+Shift+A');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');

  const input = page.getByRole('textbox', { name: /full name/i });
  await input.focus();
  await page.keyboard.press('Alt+Shift+A');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(input).toBeFocused();
});

test('shortcut does nothing while dialog is open and produces no console errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/demo/');
  await page.keyboard.press('Alt+Shift+A');
  const dialogsBefore = await page.locator('dialog[open]').count();
  await page.keyboard.press('Alt+Shift+A');
  expect(await page.locator('dialog[open]').count()).toBe(dialogsBefore);
  expect(errors).toEqual([]);
});

test('skip button focus does not change document layout or scroll position', async ({ page }) => {
  await page.goto('/demo/');
  const before = await page.evaluate(() => ({
    scrollY: window.scrollY,
    height: document.documentElement.scrollHeight,
  }));
  await page.keyboard.press('Tab');
  const after = await page.evaluate(() => ({
    scrollY: window.scrollY,
    height: document.documentElement.scrollHeight,
  }));
  expect(after).toEqual(before);
});

test('axe reports no critical or serious issues with skip button focused', async ({ page }) => {
  await page.goto('/demo/');
  await page.keyboard.press('Tab');
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations.filter((violation) =>
    ['critical', 'serious'].includes(violation.impact)
  )).toEqual([]);
});
