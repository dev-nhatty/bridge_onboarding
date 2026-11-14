import { openDb } from './db.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 3000);
const db = openDb(process.env.DB_PATH || 'data/bridge.db');
const app = createApp(db, {
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  corsOrigins: process.env.CORS_ORIGINS || '*',
});

app.listen(port, () => {
  console.log(`Digital Bridge onboarding on http://localhost:${port}`);
  console.log(`  demo host : http://localhost:${port}/demo/`);
  console.log(`  API docs  : http://localhost:${port}/api/docs`);
});
