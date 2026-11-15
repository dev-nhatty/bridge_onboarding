export const DEFAULT_PREFS = Object.freeze({
  lang: 'en',
  mode: 'normal',
  textScale: 100,
  contrast: 'normal',
  autoRead: false,
  reduceMotion: typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false,
});

export function normalizePrefs(partial = {}, fallbackLang = 'en') {
  const source = partial && typeof partial === 'object' ? partial : {};
  const defaults = { ...DEFAULT_PREFS, lang: fallbackLang === 'am' ? 'am' : 'en' };
  const requestedScale = Number(source.textScale);
  const validScale = source.textScale !== undefined && source.textScale !== null && Number.isFinite(requestedScale)
    ? [100, 125, 150].reduce((best, scale) => Math.abs(scale - requestedScale) < Math.abs(best - requestedScale) ? scale : best, 100)
    : defaults.textScale;
  return {
    lang: source.lang === 'am' || source.lang === 'en' ? source.lang : defaults.lang,
    mode: source.mode === 'simple' || source.mode === 'normal' ? source.mode : defaults.mode,
    textScale: validScale,
    contrast: source.contrast === 'high' || source.contrast === 'normal' ? source.contrast : defaults.contrast,
    autoRead: typeof source.autoRead === 'boolean' ? source.autoRead : (source.mode === 'simple' ? true : defaults.autoRead),
    reduceMotion: typeof source.reduceMotion === 'boolean' ? source.reduceMotion : defaults.reduceMotion,
  };
}
