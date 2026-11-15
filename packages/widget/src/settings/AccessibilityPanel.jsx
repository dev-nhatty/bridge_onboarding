import { LANGUAGES } from '../i18n/index.js';

export default function AccessibilityPanel({ prefs, t, announcement, onChange, onReset, onClose }) {
  return (
    <section id="bridge-accessibility-panel" className="accessibility-panel" aria-label={t('settings.title')}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}>
      <div className="settings-grid">
        <label className="settings-control">
          <span>{t('prefs.language')}</span>
          <select value={prefs.lang} onChange={(e) => onChange({ lang: e.target.value })}>
            {LANGUAGES.map((language) => <option key={language.code} value={language.code} lang={language.code}>{language.label}</option>)}
          </select>
        </label>
        <label className="settings-check">
          <input type="checkbox" checked={prefs.mode === 'simple'} onChange={(e) => onChange({ mode: e.target.checked ? 'simple' : 'normal', ...(e.target.checked ? { autoRead: true } : {}) })} />
          <span>{t('settings.simple')}</span>
        </label>
        <fieldset className="settings-fieldset">
          <legend>{t('settings.textSize')}</legend>
          {[100, 125, 150].map((scale) => <label className="settings-check" key={scale}>
            <input type="radio" name="bridge-text-scale" value={scale} checked={prefs.textScale === scale} onChange={() => onChange({ textScale: scale })} />
            <span>{t(`settings.scale${scale}`)}</span>
          </label>)}
        </fieldset>
        <label className="settings-check"><input type="checkbox" checked={prefs.contrast === 'high'} onChange={(e) => onChange({ contrast: e.target.checked ? 'high' : 'normal' })} /><span>{t('settings.highContrast')}</span></label>
        <label className="settings-check"><input type="checkbox" checked={prefs.autoRead} onChange={(e) => onChange({ autoRead: e.target.checked })} /><span>{t('settings.autoRead')}</span></label>
        <label className="settings-check"><input type="checkbox" checked={prefs.reduceMotion} onChange={(e) => onChange({ reduceMotion: e.target.checked })} /><span>{t('settings.reduceMotion')}</span></label>
      </div>
      <div className="settings-actions"><button type="button" className="btn secondary" onClick={onReset}>{t('settings.reset')}</button></div>
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    </section>
  );
}
