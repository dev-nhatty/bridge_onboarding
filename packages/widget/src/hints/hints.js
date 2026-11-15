/**
 * Inspect browser language, data-saving/network hints, display preferences and a temporary
 * hidden font-size probe. Only these local browser signals are read; nothing is stored or sent.
 */
export function detectHints(env = {}) {
  const reasons = [];
  const nav = env.navigator ?? (typeof navigator !== 'undefined' ? navigator : undefined);
  const matchMedia = env.matchMedia ?? (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : undefined);
  const doc = env.document ?? (typeof document !== 'undefined' ? document : undefined);
  const getStyle = env.getComputedStyle ?? (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function' ? window.getComputedStyle.bind(window) : undefined);
  const add = (id, strength) => reasons.push({ id, strength });
  try {
    const languages = Array.isArray(nav?.languages) ? nav.languages : [];
    if ([...languages, nav?.language].some((language) => typeof language === 'string' && /^am/i.test(language))) add('lang-am', 'strong');
  } catch { /* unavailable browser signal */ }
  try {
    if (nav?.connection?.saveData === true) add('save-data', 'strong');
    else if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-data: reduce)')?.matches) add('save-data', 'strong');
  } catch { /* unavailable browser signal */ }
  const weakMedia = [
    ['high-contrast', '(prefers-contrast: more)'],
    ['forced-colors', '(forced-colors: active)'],
    ['reduced-motion', '(prefers-reduced-motion: reduce)'],
  ];
  for (const [id, query] of weakMedia) {
    try { if (typeof matchMedia === 'function' && matchMedia(query)?.matches) add(id, 'weak'); } catch { /* ignore unsupported media query */ }
  }
  try {
    if (['slow-2g', '2g', '3g'].includes(nav?.connection?.effectiveType)) add('slow-network', 'weak');
  } catch { /* unavailable browser signal */ }
  try {
    if (doc?.body && typeof getStyle === 'function' && typeof doc.createElement === 'function') {
      const probe = doc.createElement('span');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'font-size: medium; position: absolute; visibility: hidden; pointer-events: none;';
      doc.body.appendChild(probe);
      let size = 0;
      try { size = Number.parseFloat(getStyle(probe).fontSize) || 0; }
      finally { probe.remove(); }
      if (size >= 20) add('large-font', 'weak');
    }
  } catch { /* probe is optional and always removed when appended */ }
  return reasons;
}

/** Decide whether the local hints justify an offer; no user data is transmitted or persisted. */
export function shouldOffer(reasons = []) {
  if (!Array.isArray(reasons)) return false;
  return reasons.some((reason) => reason?.strength === 'strong') || reasons.filter((reason) => reason?.strength === 'weak').length >= 2;
}

/** Emit only the reasons array as a bubbling, composed bridge:offer event; no other data is exposed. */
export function dispatchOffer(target, reasons) {
  if (!target?.dispatchEvent) return false;
  target.dispatchEvent(new CustomEvent('bridge:offer', {
    detail: { reasons }, bubbles: true, composed: true,
  }));
  return true;
}
