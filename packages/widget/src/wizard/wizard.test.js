import { describe, it, expect } from 'vitest';
import { steps, visibleSteps, savableAnswers } from './steps.js';
import { validateStep } from './validate.js';
import { isValidContact } from '../lib/contact.js';

const step = (id) => steps.find((s) => s.id === id);

describe('visibleSteps', () => {
  it('skips the ID number when the learner asks to be referred', () => {
    expect(visibleSteps({ idRoute: 'referral' }).map((s) => s.id)).not.toContain('idNumber');
    expect(visibleSteps({ idRoute: 'refugee' }).map((s) => s.id)).toContain('idNumber');
  });
});

describe('validateStep', () => {
  it('asks for required answers in plain words', () => {
    expect(validateStep(step('fullName'), '  ')).toBe('err.required');
    expect(validateStep(step('fullName'), 'Abebe')).toBeNull();
  });
  it('lets optional steps be skipped', () => {
    expect(validateStep(step('support'), [])).toBeNull();
    expect(validateStep(step('supportNote'), '')).toBeNull();
  });
  it('checks phone/email and password length', () => {
    expect(validateStep(step('contact'), 'hello')).toBe('err.contact');
    expect(validateStep(step('contact'), '0911 22 33 44')).toBeNull();
    expect(validateStep(step('password'), 'short')).toBe('err.passwordShort');
  });
});

describe('isValidContact', () => {
  it.each(['0911223344', '+251911223344', '911223344', 'a@b.co'])('accepts %s', (v) => expect(isValidContact(v)).toBe(true));
  it.each(['', '123', 'a@b', 'abc'])('rejects %s', (v) => expect(isValidContact(v)).toBe(false));
});

describe('savableAnswers', () => {
  it('never includes the password or hidden steps', () => {
    const saved = savableAnswers({ fullName: 'A', password: 'secret-pass', idRoute: 'referral', idNumber: 'stale' });
    expect(saved).toEqual({ fullName: 'A', idRoute: 'referral' });
  });
});
