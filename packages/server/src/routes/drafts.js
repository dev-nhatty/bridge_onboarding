import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { HttpError, wrap } from '../errors.js';
import { parseContact } from '../contact.js';
import { signToken, userPayload } from '../auth.js';
import { answersSchema, createDraftSchema, patchDraftSchema, submitSchema } from '../validation.js';

const now = () => new Date().toISOString();

export function draftsRouter(db, { jwtSecret }) {
  const r = Router();
  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false });
  r.use(limiter);

  const find = db.prepare('SELECT * FROM drafts WHERE token = ? AND submitted_at IS NULL');
  function load(req) {
    if (!/^[a-f0-9]{32}$/.test(req.params.token)) throw new HttpError(404, 'not_found', 'We could not find that draft.');
    const d = find.get(req.params.token);
    if (!d) throw new HttpError(404, 'not_found', 'We could not find that draft.');
    return d;
  }

  // Create a draft. The returned token is also the "resume" token.
  r.post('/', (req, res) => {
    const { lang = 'en', mode = 'normal' } = createDraftSchema.parse(req.body ?? {});
    const token = crypto.randomBytes(16).toString('hex');
    db.prepare('INSERT INTO drafts (token, lang, mode, created_at, updated_at) VALUES (?,?,?,?,?)').run(token, lang, mode, now(), now());
    res.status(201).json({ token });
  });

  r.get('/:token', (req, res) => {
    const d = load(req);
    res.json({ answers: JSON.parse(d.answers), stepIndex: d.step_index, lang: d.lang, mode: d.mode });
  });

  // Autosave. The client sends the full set of non-sensitive answers each time (replace, not merge),
  // so answers hidden by a changed route do not linger.
  r.patch('/:token', (req, res) => {
    const d = load(req);
    const body = patchDraftSchema.parse(req.body);
    db.prepare('UPDATE drafts SET answers = ?, step_index = ?, lang = ?, mode = ?, updated_at = ? WHERE token = ?').run(
      JSON.stringify(body.answers),
      body.stepIndex ?? d.step_index,
      body.lang ?? d.lang,
      body.mode ?? d.mode,
      now(),
      d.token,
    );
    res.json({ ok: true });
  });

  // "Send me a link to continue later". For the hackathon the SMS is printed to the server log.
  // TODO: plug in a real SMS/email provider (e.g. Africa's Talking) behind this function.
  r.post('/:token/send-link', (req, res) => {
    const d = load(req);
    const { contact } = JSON.parse(d.answers);
    if (!contact) throw new HttpError(400, 'no_contact', 'Please answer the phone/email question first.');
    const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
    console.log(`[mock SMS] to ${contact}: continue your registration at ${origin}/demo/?resume=${d.token}`);
    res.json({ sent: true });
  });

  r.post(
    '/:token/submit',
    wrap(async (req, res) => {
      const d = load(req);
      const { password } = submitSchema.parse(req.body);
      const a = answersSchema.parse(JSON.parse(d.answers));

      const missing = ['fullName', 'contact', 'idRoute'].filter((k) => !a[k]);
      if (a.idRoute && a.idRoute !== 'referral' && !a.idNumber) missing.push('idNumber');
      if (missing.length) throw new HttpError(400, 'incomplete', `Missing answers: ${missing.join(', ')}.`);

      const contact = parseContact(a.contact);
      if (!contact) throw new HttpError(400, 'invalid_contact', 'Please enter a valid phone number or email.');

      const clash = db.prepare('SELECT 1 FROM users WHERE (email IS NOT NULL AND email = ?) OR (phone IS NOT NULL AND phone = ?)').get(contact.email, contact.phone);
      if (clash) throw new HttpError(409, 'exists', 'An account with this phone or email already exists.');

      const hash = await bcrypt.hash(password, 10);
      const userId = db.transaction(() => {
        const { lastInsertRowid } = db
          .prepare('INSERT INTO users (full_name, email, phone, password_hash, id_route, id_number, created_at) VALUES (?,?,?,?,?,?,?)')
          .run(a.fullName, contact.email, contact.phone, hash, a.idRoute, a.idRoute === 'referral' ? null : a.idNumber, now());
        db.prepare('INSERT INTO support_needs (user_id, needs, note) VALUES (?,?,?)').run(lastInsertRowid, JSON.stringify(a.support ?? []), a.supportNote ?? null);
        // Data minimisation: once the account exists, the draft keeps nothing.
        db.prepare("UPDATE drafts SET submitted_at = ?, answers = '{}' WHERE token = ?").run(now(), d.token);
        return Number(lastInsertRowid);
      })();

      res.status(201).json({ token: signToken(jwtSecret, userId), user: userPayload(db, userId) });
    }),
  );

  return r;
}
