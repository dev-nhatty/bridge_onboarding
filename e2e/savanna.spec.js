import { test, expect } from '@playwright/test';

test('Savanna landing page links to the existing onboarding widget', async ({ page }) => {
  await page.goto('/savanna/');

  await expect(page.getByRole('heading', { name: 'Savanna static pages' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register or sign in' })).toHaveAttribute(
    'href',
    'onboarding.html',
  );
});

test('Savanna onboarding page mounts the existing widget and serves its API', async ({ page }) => {
  await page.goto('/savanna/onboarding.html');

  await expect(page.getByRole('heading', { name: 'Accessible learner registration' })).toBeVisible();
  await page.waitForFunction(() => {
    const host = document.querySelector('#signup');
    return Boolean(host?.shadowRoot?.querySelector('.bridge'));
  });

  const health = await page.request.get('/api/health');
  expect(health.ok()).toBeTruthy();
  await expect(page.locator('#signup')).toBeVisible();
});

test('original Savanna learner pages and shared assets remain available', async ({ request }) => {
  const pages = [
    '/savanna/pages/homepage-v1-paced.html',
    '/savanna/pages/homepage-v1-self-paced.html',
    '/savanna/pages/concept-with-navigation.html',
    '/savanna/assets/css/application_alx.css',
    '/savanna/assets/js/static-page.js',
  ];

  for (const path of pages) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should be served`).toBeTruthy();
  }
});
