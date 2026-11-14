import jwt from 'jsonwebtoken';
import { HttpError } from './errors.js';

export const signToken = (secret, userId) => jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });

// Bearer token in the Authorization header (not a cookie) so the widget works on any host origin.
export function requireAuth(secret) {
  return (req, _res, next) => {
    const h = req.get('authorization') || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    try {
      req.userId = Number(jwt.verify(token, secret).sub);
      next();
    } catch {
      next(new HttpError(401, 'unauthorized', 'Please log in first.'));
    }
  };
}

export function userPayload(db, userId) {
  const u = db.prepare('SELECT id, full_name FROM users WHERE id = ?').get(userId);
  const s = db.prepare('SELECT needs FROM support_needs WHERE user_id = ?').get(userId);
  return { id: u.id, fullName: u.full_name, support: s ? JSON.parse(s.needs) : [] };
}
