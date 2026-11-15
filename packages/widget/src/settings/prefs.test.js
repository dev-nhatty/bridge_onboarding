import { describe, expect, it } from 'vitest';
import { DEFAULT_PREFS, normalizePrefs } from './prefs.js';

describe('normalizePrefs', () => {
  it('supplies complete defaults and fallback language', () => {
    expect(normalizePrefs({}, 'am')).toEqual({ ...DEFAULT_PREFS, lang: 'am' });
  });
  it('drops unknown keys and replaces invalid values', () => {
    expect(normalizePrefs({ lang: 'fr', mode: 'tiny', textScale: 'huge', contrast: 'blue', autoRead: 1, reduceMotion: 'yes', extra: true }))
      .toEqual(DEFAULT_PREFS);
  });
  it('accepts only supported text scales', () => {
    expect(normalizePrefs({ textScale: '150' }).textScale).toBe(150);
    expect(normalizePrefs({ textScale: 125 }).textScale).toBe(125);
  });
  it('preserves explicit simple mode and auto-read independently', () => {
    expect(normalizePrefs({ mode: 'simple', autoRead: false }).autoRead).toBe(false);
  });
});
