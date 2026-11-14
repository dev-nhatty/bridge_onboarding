import test from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db.js';
import { createApp } from '../src/app.js';

let server, base;
test.before(async () => {
  const app = createApp(openDb(':memory:'), { jwtSecret: 'test', corsOrigins: '*' });
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://localhost:${server.address().port}/api`;
});
test.after(() => server.close());

const call = async (path, method = 'GET', body, token) => {
  const res = await fetch(base + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

test('full flow: draft -> autosave -> resume -> submit -> login', async () => {
  const { body: d } = await call('/drafts', 'POST', { lang: 'en' });
  assert.match(d.token, /^[a-f0-9]{32}$/);

  const answers = { fullName: 'Abebe Kebede', contact: '+251 911 223344', idRoute: 'kebele', idNumber: 'KB-1', support: ['screenReader'] };
  assert.equal((await call(`/drafts/${d.token}`, 'PATCH', { answers, stepIndex: 5 })).status, 200);

  const resumed = await call(`/drafts/${d.token}`);
  assert.equal(resumed.body.stepIndex, 5);
  assert.equal(resumed.body.answers.fullName, 'Abebe Kebede');

  const sub = await call(`/drafts/${d.token}/submit`, 'POST', { password: 'a-long-password' });
  assert.equal(sub.status, 201);
  assert.deepEqual(sub.body.user.support, ['screenReader']);

  // draft is gone after submit (data minimisation)
  assert.equal((await call(`/drafts/${d.token}`)).status, 404);

  // phone formats are normalised, so 0911223344 matches +251 911 223344
  const login = await call('/auth/login', 'POST', { identifier: '0911223344', password: 'a-long-password' });
  assert.equal(login.status, 200);
  assert.equal((await call('/auth/login', 'POST', { identifier: '0911223344', password: 'wrong-password' })).status, 401);
});

test('a password can never be saved in a draft', async () => {
  const { body: d } = await call('/drafts', 'POST', {});
  const res = await call(`/drafts/${d.token}`, 'PATCH', { answers: { fullName: 'X', password: 'secret123' } });
  assert.equal(res.status, 400);
});

test('referral route needs no ID number; duplicate contact is a 409', async () => {
  const mk = async () => {
    const { body: d } = await call('/drafts', 'POST', {});
    await call(`/drafts/${d.token}`, 'PATCH', { answers: { fullName: 'Selam', contact: 'selam@example.com', idRoute: 'referral' } });
    return call(`/drafts/${d.token}/submit`, 'POST', { password: 'another-password' });
  };
  assert.equal((await mk()).status, 201);
  const dup = await mk();
  assert.equal(dup.status, 409);
  assert.equal(dup.body.error.code, 'exists');
});

test('jobs support filter keeps only jobs offering ALL needed supports', async () => {
  const all = (await call('/jobs')).body.jobs;
  const signLang = (await call('/jobs?support=signLanguage')).body.jobs;
  assert.ok(signLang.length > 0 && signLang.length < all.length);
  assert.ok(signLang.every((j) => j.accommodations.includes('signLanguage')));
});

test('apply needs a login', async () => {
  assert.equal((await call('/jobs/1/apply', 'POST', {})).status, 401);
});
