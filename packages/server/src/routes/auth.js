import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { HttpError, wrap } from '../errors.js';
import { parseContact } from '../contact.js';
import { signToken, userPayload } from '../auth.js';
import { loginSchema } from '../validation.js';

// A hash to compare against when the user does not exist, so timing does not reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export function authRouter(db, { jwtSecret }) {
  const r = Router();
  r.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

  r.post(
    '/login',
    wrap(async (req, res) => {
      const { identifier, password } = loginSchema.parse(req.body);
      const c = parseContact(identifier);
      const user = c
        ? db.prepare('SELECT * FROM users WHERE (email IS NOT NULL AND email = ?) OR (phone IS NOT NULL AND phone = ?)').get(c.email, c.phone)
        : null;
      const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
      if (!user || !ok) throw new HttpError(401, 'bad_login', 'Phone/email or password is not right.');
      res.json({ token: signToken(jwtSecret, user.id), user: userPayload(db, user.id) });
    }),
  );

  // TODO (stretch): POST /login-link for passwordless "send me a sign-in link".

  return r;
}
