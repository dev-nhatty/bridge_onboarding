import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import { ZodError } from 'zod';
import { HttpError } from './errors.js';
import { draftsRouter } from './routes/drafts.js';
import { authRouter } from './routes/auth.js';
import { jobsRouter } from './routes/jobs.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const openapi = JSON.parse(readFileSync(path.join(here, 'openapi.json'), 'utf8'));

export function createApp(db, { jwtSecret, corsOrigins = '*' }) {
  const app = express();
  app.disable('x-powered-by');

  const origins = corsOrigins === '*' ? '*' : corsOrigins.split(',').map((s) => s.trim());
  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/openapi.json', (_req, res) => res.json(openapi));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));

  app.use('/api/drafts', draftsRouter(db, { jwtSecret }));
  app.use('/api/auth', authRouter(db, { jwtSecret }));
  app.use('/api/jobs', jobsRouter(db, { jwtSecret }));

  // Static files: the built widget, recorded question audio, and the demo host page.
  app.use('/widget', express.static(path.join(here, '../../widget/dist')));
  app.use('/audio', express.static(path.join(here, '../public/audio')));
  app.use('/demo', express.static(path.join(here, '../../demo-host')));
  app.get('/', (_req, res) => res.redirect('/demo/'));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: { code: 'invalid', message: 'Some answers are not valid.', issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
      });
    }
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    }
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: { code: 'bad_json', message: 'Request body is not valid JSON.' } });
    }
    console.error(err);
    res.status(500).json({ error: { code: 'server', message: 'Something went wrong on our side.' } });
  });

  return app;
}
