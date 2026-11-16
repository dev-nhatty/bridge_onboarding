import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const notice = (page) => page.locator('#registration-struggle-notice');
const register = (page) => page.locator('#host-reg-form');

test('empty form announces an empty status region at load and offers after the same field fails twice', async ({ page }) => {
  await page.goto('/demo/');
  await expect(notice(page)).toHaveCount(1);
  await expect(notice(page)).toBeEmpty();
  await register(page).getByRole('button', { name: /complete registration/i }).click();
  await expect(notice(page)).toBeEmpty();
  await register(page).getByRole('button', { name: /complete registration/i }).click();
  await expect(notice(page)).toContainText('Having trouble? Continue step by step, and we will keep what you have typed.');
  await expect(notice(page).getByRole('button', { name: 'Continue in the wizard' })).toBeVisible();
  await expect(notice(page).getByRole('button', { name: 'Dismiss' })).toBeVisible();
});

test('three failed submissions with different first-invalid fields trigger the offer', async ({ page }) => {
  await page.goto('/demo/');
  const form = register(page);
  await page.locator('#host-name').fill('Abebe Kebede');
  await form.getByRole('button', { name: /complete registration/i }).click();
  await expect(notice(page)).toBeEmpty();
  await page.locator('#host-email').fill('abebe@example.com');
  await page.locator('#host-password').fill('short');
  await form.getByRole('button', { name: /complete registration/i }).click();
  await expect(notice(page)).toBeEmpty();
  await page.locator('#host-password').fill('a-long-password');
  await form.getByRole('button', { name: /complete registration/i }).click();
  await expect(notice(page)).toContainText('Having trouble?');
});

test('required field focus for 45 seconds without input triggers the offer', async ({ page }) => {
  await page.clock.install();
  await page.goto('/demo/');
  await page.locator('#host-name').focus();
  await page.clock.fastForward(46000);
  await expect(notice(page)).toContainText('Having trouble?');
});

test('typing before 45 seconds clears the required-field focus timer', async ({ page }) => {
  await page.clock.install();
  await page.goto('/demo/');
  await page.locator('#host-name').focus();
  await page.clock.fastForward(44000);
  await page.locator('#host-name').fill('Abebe');
  await page.clock.fastForward(3000);
  await expect(notice(page)).toBeEmpty();
});

test('blurring a required field clears the focus timer', async ({ page }) => {
  await page.clock.install();
  await page.goto('/demo/');
  await page.locator('#host-name').focus();
  await page.clock.fastForward(30000);
  await page.locator('#host-email').focus();
  await page.clock.fastForward(20000);
  await expect(notice(page)).toBeEmpty();
});

test('continue carries name and email but never password into the wizard', async ({ page }) => {
  await page.goto('/demo/');
  await page.locator('#host-name').fill('Abebe Kebede');
  await page.locator('#host-email').fill('abebe@example.com');
  await page.locator('#host-password').fill('SuperSecretPassword!');
  await register(page).getByRole('button', { name: /complete registration/i }).click();
  await register(page).getByRole('button', { name: /complete registration/i }).click();
  await notice(page).getByRole('button', { name: 'Continue in the wizard' }).click();
  await expect(notice(page)).toBeEmpty();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: /full name/i })).toHaveValue('Abebe Kebede');
  await dialog.getByRole('button', { name: /next question/i }).click();
  await expect(dialog.getByRole('textbox')).toHaveValue('abebe@example.com');
  const shadowText = await page.locator('#signup').evaluate((el) => el.shadowRoot?.textContent || '');
  const shadowValues = await page.locator('#signup').evaluate((el) =>
    Array.from(el.shadowRoot?.querySelectorAll('input,textarea') || []).map((input) => input.value).join('|')
  );
  expect(shadowText).not.toContain('SuperSecretPassword!');
  expect(shadowValues).not.toContain('SuperSecretPassword!');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await register(page).getByRole('button', { name: /complete registration/i }).click();
  await register(page).getByRole('button', { name: /complete registration/i }).click();
  await expect(notice(page)).toBeEmpty();
});

test('Amharic instruction language opens the wizard in Amharic', async ({ page }) => {
  await page.goto('/demo/');
  await page.locator('#host-lang').selectOption('am');
  await page.locator('#host-name').fill('Abebe Kebede');
  await page.locator('#host-email').fill('abebe@example.com');
  await register(page).getByRole('button', { name: /complete registration/i }).click();
  await register(page).getByRole('button', { name: /complete registration/i }).click();
  await notice(page).getByRole('button', { name: 'Continue in the wizard' }).click();
  await expect(page.locator('#wizard-dialog .bridge')).toHaveAttribute('lang', 'am');
});

test('dismiss is permanent for the page view and the notice is axe-clean', async ({ page }) => {
  await page.goto('/demo/');
  const form = register(page);
  await form.getByRole('button', { name: /complete registration/i }).click();
  await form.getByRole('button', { name: /complete registration/i }).click();
  await notice(page).getByRole('button', { name: 'Dismiss' }).click();
  await expect(notice(page)).toBeEmpty();
  await form.getByRole('button', { name: /complete registration/i }).click();
  await form.getByRole('button', { name: /complete registration/i }).click();
  await expect(notice(page)).toBeEmpty();

  await page.reload();
  await page.locator('#host-name').fill('Abebe');
  await page.locator('#host-email').fill('abebe@example.com');
  await page.locator('#host-password').fill('a-long-password');
  await page.locator('#host-terms').check();
  await page.locator('#host-name').fill('');
  await register(page).getByRole('button', { name: /complete registration/i }).click();
  await register(page).getByRole('button', { name: /complete registration/i }).click();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  expect(results.violations.filter((v) => ['critical','serious'].includes(v.impact))).toEqual([]);
});
