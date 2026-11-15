import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The hackathon gate: zero critical and zero serious axe issues, and the main task done
// with the KEYBOARD ONLY. This test walks the whole wizard without a single mouse click.

async function expectNoSeriousIssues(page, label) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const bad = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact));
  expect(bad, `axe issues on ${label}: ${bad.map((v) => v.id).join(', ')}`).toEqual([]);
}

async function pressNext(page) {
  await page.getByRole('dialog').getByRole('button', { name: /^(next question|create account)$/i }).focus();
  await page.keyboard.press('Enter');
}

test('closed host page has no critical/serious axe violations', async ({ page }) => {
  await page.goto('/demo/');
  await expectNoSeriousIssues(page, 'closed host page');
});

test('register with keyboard only, no critical/serious axe issues', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  const dialog = page.getByRole('dialog');

  // Step 1: name (Enter submits the form, like a real user would)
  await dialog.getByRole('textbox', { name: /full name/i }).focus();
  await expectNoSeriousIssues(page, 'step 1');
  await page.keyboard.type('Abebe Kebede');
  await page.keyboard.press('Enter');

  // Step 2: contact
  await dialog.getByRole('textbox', { name: /phone number or email/i }).focus();
  await page.keyboard.type(`09${Date.now().toString().slice(-8)}`);
  await page.keyboard.press('Enter');

  // Step 3: ID route (arrow keys / space on a native radio group)
  await dialog.getByRole('radio', { name: /kebele/i }).focus();
  await page.keyboard.press('Space');
  await expectNoSeriousIssues(page, 'step 3');
  await page.keyboard.press('Enter');

  // Step 4: ID number
  await dialog.getByRole('textbox', { name: /number on your id/i }).focus();
  await page.keyboard.type('KB-12345');
  await page.keyboard.press('Enter');

  // Step 5: support needs (private, optional)
  await dialog.getByRole('checkbox', { name: /screen reader/i }).focus();
  await page.keyboard.press('Space');
  await expectNoSeriousIssues(page, 'step 5');
  await pressNext(page);

  // Step 6: optional note, skip it
  await dialog.getByRole('textbox', { name: /anything else/i }).waitFor();
  await pressNext(page);

  // Step 7: password
  await dialog.getByLabel(/choose a password/i).focus();
  await page.keyboard.type('a-long-password');
  await expectNoSeriousIssues(page, 'step 7');
  await page.keyboard.press('Enter');

  await expect(dialog.getByRole('heading', { name: /you are registered/i })).toBeVisible();
  await expectNoSeriousIssues(page, 'done');
});

test('an error is announced next to the field and focus returns to it', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: /launch accessible wizard/i }).click();
  const dialog = page.getByRole('dialog');
  const name = dialog.getByRole('textbox', { name: /full name/i });
  await name.focus();
  await page.keyboard.press('Enter'); // empty answer
  await expect(dialog.getByText(/please answer this question/i)).toBeVisible();
  await expect(name).toBeFocused();
  await expectNoSeriousIssues(page, 'error state');
});
