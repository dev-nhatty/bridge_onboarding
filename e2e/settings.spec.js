import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openWidget(page) {
  await page.goto('/demo/');
  await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  return page.getByRole('dialog');
}
async function openSettings(page, dialog) {
  const button = dialog.getByRole('button', { name: /accessibility settings/i });
  await expect(button).toBeVisible();
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(dialog.getByRole('region', { name: /accessibility settings/i })).toBeVisible();
  return dialog.getByRole('region', { name: /accessibility settings/i });
}
async function noSeriousAxe(page) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.filter((v) => ['critical','serious'].includes(v.impact))).toEqual([]);
}

test('settings are available from step one, middle step, login, and done', async ({ page }) => {
  const dialog = await openWidget(page);
  await openSettings(page, dialog);
  await page.getByRole('button', { name: /accessibility settings/i }).press('Escape');
  await expect(dialog.getByRole('region', { name: /accessibility settings/i })).toHaveCount(0);
  await dialog.getByRole('textbox', { name: /full name/i }).fill('Abebe');
  await dialog.getByRole('button', { name: /next question/i }).click();
  await openSettings(page, dialog);
  await page.getByRole('button', { name: /accessibility settings/i }).press('Escape');
  await dialog.getByRole('button', { name: /^log in$/i }).click();
  await openSettings(page, dialog);
  await page.getByRole('button', { name: /accessibility settings/i }).press('Escape');
});

test('text size, language, contrast and Escape preserve form state and dialog', async ({ page }) => {
  const dialog = await openWidget(page);
  const name = dialog.getByRole('textbox', { name: /full name/i });
  await name.fill('Abebe Kebede');
  const heading = dialog.getByRole('heading', { name: /what is your full name/i });
  const before = await heading.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const panel = await openSettings(page, dialog);
  await panel.getByLabel(/large \(125%\)/i).check();
  const after = await heading.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(after).toBeGreaterThan(before);
  await panel.getByLabel(/^language$/i).selectOption('am');
  await expect(dialog.getByRole('textbox')).toHaveValue('Abebe Kebede');
  await expect(dialog.getByRole('heading', { level: 2 })).toContainText('ሙሉ ስምዎ');
  await panel.getByLabel(/high contrast/i).check();
  await expect(dialog.locator('.bridge')).toHaveAttribute('data-contrast', 'high');
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(dialog).toBeVisible();
});

test('settings remain available on the completed registration screen', async ({ page }) => {
  const dialog = await openWidget(page);
  await dialog.getByRole('textbox', { name: /full name/i }).fill('Abebe Kebede');
  await dialog.getByRole('button', { name: /next question/i }).click();
  await dialog.getByRole('textbox', { name: /phone number or email/i }).fill(`09${Date.now().toString().slice(-8)}`);
  await dialog.getByRole('button', { name: /next question/i }).click();
  await dialog.getByRole('radio', { name: /kebele id/i }).check();
  await dialog.getByRole('button', { name: /next question/i }).click();
  await dialog.getByRole('textbox', { name: /number on your id/i }).fill('KB-98765');
  await dialog.getByRole('button', { name: /next question/i }).click();
  await dialog.getByRole('button', { name: /next question/i }).click();
  await dialog.getByRole('button', { name: /next question/i }).click();
  await dialog.getByLabel(/choose a password/i).fill('a-long-password');
  await dialog.getByRole('button', { name: /create account/i }).click();
  await expect(dialog.getByRole('heading', { name: /you are registered/i })).toBeVisible();
  await openSettings(page, dialog);
});

test('panel has no critical or serious axe issues in normal and high contrast', async ({ page }) => {
  const dialog = await openWidget(page);
  const panel = await openSettings(page, dialog);
  await noSeriousAxe(page);
  await panel.getByLabel(/high contrast/i).check();
  await noSeriousAxe(page);
});

test('simple words enables automatic read aloud once, then can be disabled', async ({ page }) => {
  const dialog = await openWidget(page);
  const panel = await openSettings(page, dialog);
  await panel.getByLabel(/simple words/i).check();
  await expect(panel.getByLabel(/read questions aloud automatically/i)).toBeChecked();
  await panel.getByLabel(/read questions aloud automatically/i).uncheck();
  await expect(panel.getByLabel(/read questions aloud automatically/i)).not.toBeChecked();
});
