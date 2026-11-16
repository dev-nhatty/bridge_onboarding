import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expandChooser(page) {
  await page.goto('/demo/');
  const summary = page.locator('.help-chooser > summary');
  await expect(page.locator('.help-chooser')).not.toHaveAttribute('open', '');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.help-chooser')).toHaveAttribute('open', '');
}

async function activateCard(page, name) {
  const card = page.getByRole('button', { name: new RegExp(name, 'i') });
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  return card;
}

async function openSettings(page) {
  await page.getByRole('dialog').getByRole('button', { name: /accessibility settings/i }).click();
  return page.getByRole('dialog').getByRole('region', { name: /accessibility settings/i });
}

test('chooser is collapsed by default and keyboard reaches all four cards in order', async ({ page }) => {
  await page.goto('/demo/');
  const details = page.locator('.help-chooser');
  await expect(details).not.toHaveAttribute('open', '');
  const summary = details.locator('summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  for (const label of ['Read to me', 'Simple words', 'Bigger and clearer', 'አማርኛ']) {
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toContainText(label);
  }
});

test('Read to me preset enables automatic read-aloud and Escape restores focus', async ({ page }) => {
  await expandChooser(page);
  const card = await activateCard(page, 'Read to me');
  const settings = await openSettings(page);
  await expect(settings.getByLabel(/read questions aloud automatically/i)).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(card).toBeFocused();
});

test('Simple words preset enables simple mode and read-aloud', async ({ page }) => {
  await expandChooser(page);
  const card = await activateCard(page, 'Simple words');
  const settings = await openSettings(page);
  await expect(settings.getByLabel(/simple words/i)).toBeChecked();
  await expect(settings.getByLabel(/read questions aloud automatically/i)).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(card).toBeFocused();
});

test('Bigger and clearer preset enables extra-large text and high contrast', async ({ page }) => {
  await expandChooser(page);
  const card = await activateCard(page, 'Bigger and clearer');
  const settings = await openSettings(page);
  await expect(settings.getByLabel(/extra large/i)).toBeChecked();
  await expect(settings.getByLabel(/high contrast/i)).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(card).toBeFocused();
});

test('Amharic preset opens the first question in Amharic', async ({ page }) => {
  await expandChooser(page);
  const card = await activateCard(page, 'አማርኛ');
  await expect(page.locator('#wizard-dialog .bridge')).toHaveAttribute('lang', 'am');
  await expect(page.getByRole('dialog').getByRole('heading', { level: 2 })).toContainText('ሙሉ ስም');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(card).toBeFocused();
});

test('chooser is one column and does not overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await expandChooser(page);
  const layout = await page.locator('.help-chooser-grid').evaluate((el) => ({
    columns: getComputedStyle(el).gridTemplateColumns.split(' ').length,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(layout.columns).toBe(1);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
});

test('expanded chooser has no critical or serious axe violations', async ({ page }) => {
  await expandChooser(page);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  expect(results.violations.filter((v) => ['critical','serious'].includes(v.impact))).toEqual([]);
});
