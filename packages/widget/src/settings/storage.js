import { normalizePrefs } from './prefs.js';

const STORAGE_KEY = 'bridge.prefs.v1';

function storage() {
  try { return typeof window !== 'undefined' ? window.localStorage : null; }
  catch { return null; }
}

/** Load only saved accessibility preferences from this browser; no form or account data is read. */
export function loadPrefs() {
  try {
    const store = storage();
    if (!store) return null;
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.prefs || typeof parsed.prefs !== 'object') return null;
    return normalizePrefs(parsed.prefs);
  } catch {
    return null;
  }
}

/** Save only the normalized accessibility preference fields in this browser; nothing is transmitted. */
export function savePrefs(prefs) {
  try {
    const store = storage();
    if (!store) return false;
    const normalized = normalizePrefs(prefs);
    store.setItem(STORAGE_KEY, JSON.stringify({ prefs: normalized, savedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}

/** Remove the local accessibility preference record; no other browser data is touched. */
export function clearPrefs() {
  try {
    const store = storage();
    if (!store) return false;
    store.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Report whether this browser has an opted-in preference record without exposing its contents. */
export function hasSavedPrefs() {
  try { return Boolean(storage()?.getItem(STORAGE_KEY)); }
  catch { return false; }
}
