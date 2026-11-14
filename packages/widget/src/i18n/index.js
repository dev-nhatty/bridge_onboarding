import en from './locales/en.json';
import am from './locales/am.json';

const dictionaries = { en, am };
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ' },
];

// t('q.fullName')  -> the question text
// In "simple" mode, t() first looks for 'simple.<key>' (shorter words), then falls back to '<key>'.
// Missing Amharic strings fall back to English, so a half-translated file never shows blank text.
export function makeT(lang, mode) {
  const d = dictionaries[lang] ?? en;
  const lookup = (key) => (mode === 'simple' ? d['simple.' + key] ?? en['simple.' + key] : undefined) ?? d[key] ?? en[key];
  const t = (key, vars) => {
    let s = lookup(key) ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
    return s;
  };
  t.has = (key) => lookup(key) !== undefined;
  return t;
}
