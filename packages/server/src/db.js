import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS drafts (
  token        TEXT PRIMARY KEY,
  answers      TEXT NOT NULL DEFAULT '{}',   -- never contains the password
  step_index   INTEGER NOT NULL DEFAULT 0,
  lang         TEXT NOT NULL DEFAULT 'en',
  mode         TEXT NOT NULL DEFAULT 'normal',
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  submitted_at TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  id_route      TEXT NOT NULL,   -- kebele | refugee | other | referral
  id_number     TEXT,            -- TODO: encrypt at rest before real use
  created_at    TEXT NOT NULL
);

-- Kept in its own table on purpose: support needs are private and are never joined
-- into responses unless the learner asks for it (job filter) or the host needs it with consent.
CREATE TABLE IF NOT EXISTS support_needs (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  needs   TEXT NOT NULL DEFAULT '[]',
  note    TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  company        TEXT NOT NULL,
  location       TEXT,
  accommodations TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS applications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id     INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answer     TEXT,
  created_at TEXT NOT NULL
);
`;

const SEED_JOBS = [
  ['Customer support agent', 'Example Telecom', 'Addis Ababa', ['screenReader', 'captions', 'extraTime', 'largeText']],
  ['Data entry clerk', 'Example Logistics', 'Addis Ababa', ['screenReader', 'largeText', 'extraTime']],
  ['Junior web tester', 'Example Labs', 'Remote', ['screenReader', 'captions', 'signLanguage', 'extraTime', 'largeText']],
  ['Amharic-English translator', 'Example Media', 'Hawassa', ['captions', 'signLanguage', 'extraTime']],
];

export function openDb(file = ':memory:') {
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM jobs').get();
  if (n === 0) {
    const ins = db.prepare('INSERT INTO jobs (title, company, location, accommodations) VALUES (?,?,?,?)');
    for (const [t, c, l, a] of SEED_JOBS) ins.run(t, c, l, JSON.stringify(a));
  }
  return db;
}
