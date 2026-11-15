import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function noSeriousAxe(page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.filter((v) => ['critical', 'serious'].includes(v.impact))).toEqual([]);
}

test('URL assist and language launch the wizard and are removed from history', async ({ page }) => {
  await page.goto('/demo/?assist=simple&lang=am');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.bridge')).toHaveClass(/simple/);
  await expect(dialog.locator('.bridge')).toHaveAttribute('lang', 'am');
  await expect(dialog.getByRole('heading', { level: 2 })).toContainText('ሙሉ ስም');
  await expect.poll(() => page.evaluate(() => location.search)).toBe('');
});

test('invalid assist and language alone do not open the dialog', async ({ page }) => {
  await page.goto('/demo/?assist=bogus');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goto('/demo/?lang=am');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('reopening and changing language preserve typed answers', async ({ page }) => {
  await page.goto('/demo/');
  const dialog = page.getByRole('dialog');
  await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  await dialog.getByRole('textbox', { name: /full name/i }).fill('Abebe Kebede');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  await expect(dialog.getByRole('textbox', { name: /full name/i })).toHaveValue('Abebe Kebede');
  await page.evaluate(() => window.__bridgeDemo.openWizard({ lang: 'am' }));
  await expect(dialog.getByRole('textbox')).toHaveValue('Abebe Kebede');
  await expect(dialog.locator('.bridge')).toHaveAttribute('lang', 'am');
});

test('prefill fills allowed fields without advancing or overwriting typed answers', async ({ page }) => {
  await page.goto('/demo/');
  await page.evaluate(() => window.__bridgeDemo.openWizard({
    prefill: { fullName: '  Abebe Bikila  ', contact: '0911223344', password: 'secret' },
  }));
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('textbox', { name: /full name/i })).toHaveValue('Abebe Bikila');
  await expect(dialog.getByRole('heading', { level: 2 })).toContainText(/full name/i);
  await expect(dialog.locator('input[type="password"]')).toHaveCount(0);
  await dialog.getByRole('textbox', { name: /full name/i }).fill('Typed Name');
  await page.evaluate(() => window.__bridgeDemo.openWizard({
    prefill: { fullName: 'Replacement', contact: '0999999999' },
  }));
  await expect(dialog.getByRole('textbox', { name: /full name/i })).toHaveValue('Typed Name');
  await dialog.getByRole('button', { name: /next question/i }).click();
  await expect(dialog.getByRole('textbox')).toHaveValue('0911223344');
});

test('entry flow has no critical or serious axe violations closed and open', async ({ page }) => {
  await page.goto('/demo/');
  await noSeriousAxe(page);
  await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  await noSeriousAxe(page);
});
