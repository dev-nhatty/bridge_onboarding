import { test, expect } from '@playwright/test';

test('Savanna landing page sends registration to the demo onboarding page', async ({ page }) => {
  await page.goto('/savanna/');

  await expect(page.getByRole('heading', { name: 'Savanna static pages' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register or sign in' })).toHaveAttribute(
    'href',
    '/demo/',
  );
});

test('legacy Savanna onboarding URL redirects to the demo page', async ({ request }) => {
  const response = await request.get('/savanna/onboarding.html', { maxRedirects: 0 });

  expect(response.status()).toBe(302);
  expect(response.headers().location).toBe('/demo/');
});

test('demo onboarding page mounts the existing widget and serves its API', async ({ page }) => {
  await page.goto('/demo/');

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
