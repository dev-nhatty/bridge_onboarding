import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:3100' },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3100/api/health',
    reuseExistingServer: !process.env.CI,
    env: { PORT: '3100', DB_PATH: ':memory:', JWT_SECRET: 'e2e-secret' },
  },
});
