import { Router } from 'express';
import { HttpError } from '../errors.js';
import { requireAuth } from '../auth.js';
import { SUPPORT, applySchema, jobSchema } from '../validation.js';

const toJob = (r) => ({ id: r.id, title: r.title, company: r.company, location: r.location, accommodations: JSON.parse(r.accommodations) });

export function jobsRouter(db, { jwtSecret }) {
  const r = Router();

  // GET /api/jobs?support=screenReader,captions
  // The private "support I need" filter: only jobs whose employer offers ALL of the listed supports.
  // The server never stores which filter a learner used.
  r.get('/', (req, res) => {
    const want = String(req.query.support ?? '').split(',').filter(Boolean).filter((s) => SUPPORT.includes(s));
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY id').all().map(toJob);
    res.json({ jobs: want.length ? jobs.filter((j) => want.every((w) => j.accommodations.includes(w))) : jobs });
  });

  // Employer form: which accommodations does this job offer?
  // TODO: protect with an employer login before real use.
  r.post('/', (req, res) => {
    const j = jobSchema.parse(req.body);
    const { lastInsertRowid } = db
      .prepare('INSERT INTO jobs (title, company, location, accommodations) VALUES (?,?,?,?)')
      .run(j.title, j.company, j.location ?? null, JSON.stringify(j.accommodations));
    res.status(201).json({ id: Number(lastInsertRowid) });
  });

  r.post('/:id/apply', requireAuth(jwtSecret), (req, res) => {
    const job = db.prepare('SELECT id FROM jobs WHERE id = ?').get(Number(req.params.id));
    if (!job) throw new HttpError(404, 'not_found', 'That job was not found.');
    const { answer } = applySchema.parse(req.body ?? {});
    db.prepare('INSERT INTO applications (job_id, user_id, answer, created_at) VALUES (?,?,?,?)').run(job.id, req.userId, answer ?? null, new Date().toISOString());
    res.status(201).json({ ok: true });
  });

  return r;
}
