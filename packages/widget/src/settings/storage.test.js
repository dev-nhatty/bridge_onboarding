import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearPrefs, hasSavedPrefs, loadPrefs, savePrefs } from './storage.js';

const KEY = 'bridge.prefs.v1';
afterEach(() => { vi.unstubAllGlobals(); });
function memoryStorage() {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key), data };
}

describe('preference storage', () => {
  it('round trips only normalized preferences and savedAt', () => {
    const localStorage = memoryStorage(); vi.stubGlobal('window', { localStorage });
    expect(savePrefs({ lang: 'am', textScale: 150, autoRead: true, fullName: 'private' })).toBe(true);
    const record = JSON.parse(localStorage.getItem(KEY));
    expect(Object.keys(record).sort()).toEqual(['prefs', 'savedAt']);
    expect(record.prefs.fullName).toBeUndefined();
    expect(loadPrefs()).toMatchObject({ lang: 'am', textScale: 150, autoRead: true });
    expect(hasSavedPrefs()).toBe(true);
    clearPrefs(); expect(hasSavedPrefs()).toBe(false);
  });
  it('ignores corrupt and unknown data safely', () => {
    const localStorage = memoryStorage(); vi.stubGlobal('window', { localStorage });
    localStorage.setItem(KEY, '{bad'); expect(loadPrefs()).toBeNull();
    localStorage.setItem(KEY, JSON.stringify({ prefs: { mode: 'simple', unknown: 'secret' } }));
    expect(loadPrefs()).toMatchObject({ mode: 'simple', autoRead: true });
    expect(loadPrefs().unknown).toBeUndefined();
  });
  it('handles blocked storage without throwing', () => {
    vi.stubGlobal('window', { get localStorage() { throw new Error('blocked'); } });
    expect(loadPrefs()).toBeNull(); expect(savePrefs({})).toBe(false);
    expect(clearPrefs()).toBe(false); expect(hasSavedPrefs()).toBe(false);
  });
});
