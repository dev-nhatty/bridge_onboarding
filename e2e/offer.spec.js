import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('forced-colors plus reduced-motion shows a quiet offer; actions work and dismissal is tab-scoped', async ({ page, context }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto('/demo/');
  const offer = page.getByRole('region', { name: /registration help/i });
  await expect(offer).toBeVisible();
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await page.setViewportSize({ width: 320, height: 720 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  expect(axe.violations.filter((v) => ['critical','serious'].includes(v.impact))).toEqual([]);
  await offer.getByRole('button', { name: /try the guided form/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#wizard-dialog .bridge')).toHaveAttribute('data-reduce-motion', 'true');
  await page.getByRole('dialog').getByRole('button', { name: /close/i }).click();
  await page.reload();
  await expect(page.getByRole('region', { name: /registration help/i })).toBeVisible();
  await page.getByRole('region', { name: /registration help/i }).getByRole('button', { name: /no thanks/i }).click();
  await expect(page.getByRole('region', { name: /registration help/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /launch accessible wizard/i })).toBeFocused();
  await page.reload();
  await expect(page.getByRole('region', { name: /registration help/i })).toHaveCount(0);
  const newTab = await context.newPage();
  await newTab.goto('/demo/');
  await expect(newTab.getByRole('region', { name: /registration help/i })).toBeVisible();
});

test('reduced-motion alone does not show an offer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'none' });
  await page.goto('/demo/');
  await expect(page.getByRole('region', { name: /registration help/i })).toHaveCount(0);
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('Amharic browser language marks the Amharic banner run', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'am-ET' });
    Object.defineProperty(navigator, 'languages', { configurable: true, value: ['am-ET', 'en'] });
  });
  await page.goto('/demo/');
  const offer = page.locator('.registration-help');
  await expect(offer).toBeVisible();
  await expect(offer).toHaveAttribute('lang', 'am');
  await expect(offer).toContainText('የተመራውን ቅጽ ይሞክሩ');
});

test('outside accessibility control opens settings from the host page', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: /open accessibility settings/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('region', { name: /accessibility settings/i })).toBeVisible();
});
