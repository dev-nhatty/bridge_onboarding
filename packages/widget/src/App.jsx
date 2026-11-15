import { useEffect, useMemo, useRef, useState } from 'react';
import { createApi } from './api.js';
import { makeT } from './i18n/index.js';
import Wizard from './wizard/Wizard.jsx';
import LoginForm from './LoginForm.jsx';
import JobsList from './gateway/JobsList.jsx';
import AccessibilityPanel from './settings/AccessibilityPanel.jsx';
import { DEFAULT_PREFS, normalizePrefs } from './settings/prefs.js';
import { clearPrefs, hasSavedPrefs, loadPrefs, savePrefs } from './settings/storage.js';

export default function App({ api: apiBase, lang: initialLang, prefs: initialPrefs, prefill, bus, assets, resume, emit, modal = false, openSettings = false }) {
  const api = useMemo(() => createApi(apiBase), [apiBase]);
  const [prefs, setPrefs] = useState(() => normalizePrefs({ lang: initialLang, ...(loadPrefs() || {}), ...(initialPrefs || {}) }, initialLang));
  const [rememberPrefs, setRememberPrefs] = useState(() => hasSavedPrefs());
  const [panelOpen, setPanelOpen] = useState(Boolean(openSettings));
  const [announcement, setAnnouncement] = useState('');
  const [view, setView] = useState('register');
  const [session, setSession] = useState(null);
  const t = useMemo(() => makeT(prefs.lang, prefs.mode), [prefs.lang, prefs.mode]);
  const doneRef = useRef(null);
  const settingsButtonRef = useRef(null);

  useEffect(() => { if (view === 'done') doneRef.current?.focus(); }, [view]);

  useEffect(() => {
    if (!bus) return undefined;
    const onOpenSettings = () => setPanelOpen(true);
    const onHostUpdate = (event) => {
      const detail = event.detail || {};
      const hostLang = !rememberPrefs && ['en', 'am'].includes(detail.lang) ? { lang: detail.lang } : {};
      const next = normalizePrefs({ ...prefs, ...hostLang, ...(detail.prefs || {}) }, prefs.lang);
      setPrefs(next);
      if (rememberPrefs) savePrefs(next);
      emit('bridge:prefs', next);
    };
    bus.addEventListener('settings-open', onOpenSettings);
    bus.addEventListener('host-update', onHostUpdate);
    const onPrefs = (event) => {
      const next = normalizePrefs({ ...prefs, ...(event.detail || {}) }, prefs.lang);
      setPrefs(next);
      if (rememberPrefs) savePrefs(next);
      emit('bridge:prefs', next);
    };
    bus.addEventListener('prefs', onPrefs);
    return () => { bus.removeEventListener('prefs', onPrefs); bus.removeEventListener('settings-open', onOpenSettings); bus.removeEventListener('host-update', onHostUpdate); };
  }, [bus, prefs, emit, rememberPrefs]);

  function updatePrefs(patch) {
    const next = normalizePrefs({ ...prefs, ...patch }, prefs.lang);
    const changedKey = Object.keys(patch)[0];
    const labels = {
      lang: t('settings.languageChanged', { value: next.lang === 'am' ? 'አማርኛ' : 'English' }),
      mode: t(next.mode === 'simple' ? 'settings.simpleOn' : 'settings.simpleOff'),
      textScale: t(`settings.scale${next.textScale}`),
      contrast: t(next.contrast === 'high' ? 'settings.contrastOn' : 'settings.contrastOff'),
      autoRead: t(next.autoRead ? 'settings.autoReadOn' : 'settings.autoReadOff'),
      reduceMotion: t(next.reduceMotion ? 'settings.motionOn' : 'settings.motionOff'),
    };
    setPrefs(next);
    if (rememberPrefs) savePrefs(next);
    setAnnouncement(labels[changedKey] || t('settings.changed'));
    emit('bridge:prefs', next);
  }

  function mergeDraftPrefs(patch) {
    setPrefs((current) => { const next = normalizePrefs({ ...current, ...patch }, current.lang); if (rememberPrefs) savePrefs(next); return next; });
  }

  function toggleRemember(checked) {
    setRememberPrefs(checked);
    if (checked) savePrefs(prefs); else clearPrefs();
  }

  function resetPrefs() {
    const next = normalizePrefs({ ...DEFAULT_PREFS, reduceMotion: DEFAULT_PREFS.reduceMotion }, 'en');
    setPrefs(next);
    setRememberPrefs(false);
    clearPrefs();
    setAnnouncement(t('settings.resetDone'));
    emit('bridge:prefs', next);
  }

  function onSession(res, next) { setSession(res); setView(next); }

  function onLoginSuccess(res) {
    const support = Array.isArray(res?.user?.support) ? res.user.support : [];
    const patch = {};
    if (support.includes('screenReader') && prefs.autoRead === DEFAULT_PREFS.autoRead) patch.autoRead = true;
    if (support.includes('largeText') && prefs.textScale === DEFAULT_PREFS.textScale) patch.textScale = 150;
    if (Object.keys(patch).length) {
      const next = normalizePrefs({ ...prefs, ...patch }, prefs.lang);
      setPrefs(next);
      if (rememberPrefs) savePrefs(next);
      const messages = [];
      if (patch.autoRead) messages.push(t('settings.seedReadAloud'));
      if (patch.textScale) messages.push(t('settings.seedLargeText'));
      setAnnouncement(t('settings.seeded', { settings: messages.join(t('settings.seedAnd')) }));
      emit('bridge:prefs', next);
    }
    onSession(res, 'jobs');
  }


  const containerProps = {
    className: `bridge ${prefs.mode === 'simple' ? 'simple' : ''} ${modal ? 'modal-mode' : ''}`.trim(),
    lang: prefs.lang,
    'data-text-scale': prefs.textScale,
    'data-contrast': prefs.contrast,
    'data-reduce-motion': String(prefs.reduceMotion),
    ...(modal ? {} : { role: 'region', 'aria-label': t('app.label') }),
  };

  const settingsButton = (
    <button ref={settingsButtonRef} type="button" className="accessibility-toggle"
      style={{ width: 'auto', height: 'auto', minWidth: 44, minHeight: 44, flex: '0 0 auto', boxSizing: 'border-box' }}
      aria-label={t('settings.title')} aria-expanded={panelOpen} aria-controls="bridge-accessibility-panel"
      onClick={() => setPanelOpen((open) => !open)}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 2.94-.09-.02a1.7 1.7 0 0 0-1.72.65l-.05.08h-3.4l-.05-.08a1.7 1.7 0 0 0-1.72-.65l-.09.02-1.7-2.94.06-.06A1.7 1.7 0 0 0 9.7 15l-.09-.05v-3.4l.09-.05a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-2.94.09.02a1.7 1.7 0 0 0 1.72-.65l.05-.08h3.4l.05.08a1.7 1.7 0 0 0 1.72.65l.09-.02 1.7 2.94-.06.06A1.7 1.7 0 0 0 19.4 12l.09.05v2.9z" transform="translate(-2 -2) scale(1.15)" />
      </svg>
      <span className="accessibility-toggle-text">{t('settings.title')}</span>
    </button>
  );

  return (
    <div {...containerProps}>
      {modal ? <header className="modal-header">
        <div className="modal-header-row1">
          <div className="modal-brand">
            <svg className="modal-logo" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 19C3 11.5 8 6 12 6" stroke="#b5121b" strokeWidth="3" strokeLinecap="round" />
              <path d="M12 6C16 6 21 11.5 21 19" stroke="#2b6a3f" strokeWidth="3" strokeLinecap="round" />
              <path d="M6 19C6 14.5 9 11 12 11" stroke="#b5121b" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 11C15 11 18 14.5 18 19" stroke="#2b6a3f" strokeWidth="2" strokeLinecap="round" />
            </svg><span className="modal-title">{t('modal.title')}</span>
          </div>
        </div>
        <div className="modal-header-row2">
          {settingsButton}
          <button type="button" className="modal-close-btn" aria-label={t('modal.close')} onClick={() => emit('bridge:close')}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </header> : <div className="prefs">{settingsButton}</div>}

      {panelOpen && <AccessibilityPanel prefs={prefs} t={t} announcement={announcement}
        rememberPrefs={rememberPrefs} onRememberChange={toggleRemember} onChange={updatePrefs} onReset={resetPrefs}
        onClose={() => { setPanelOpen(false); settingsButtonRef.current?.focus(); }} />}

      {(view === 'register' || view === 'login') && <nav aria-label={t('tabs.label')} className="tabs">
        <button type="button" className="tab" aria-current={view === 'register' ? 'page' : undefined} onClick={() => setView('register')}>{t('tab.register')}</button>
        <button type="button" className="tab" aria-current={view === 'login' ? 'page' : undefined} onClick={() => setView('login')}>{t('tab.login')}</button>
      </nav>}

      {view === 'register' && <Wizard api={api} t={t} lang={prefs.lang} mode={prefs.mode} prefs={prefs} bus={bus} prefill={prefill}
        assets={assets} resumeToken={resume} emit={emit} modal={modal}
        onPrefs={mergeDraftPrefs} onRegistered={(res) => onSession(res, 'done')} />}
      {view === 'login' && <LoginForm api={api} t={t} emit={emit} onLoggedIn={onLoginSuccess} />}
      {view === 'done' && <section><h2 tabIndex={-1} ref={doneRef}>{t('done.title')}</h2><p>{t('done.body', { name: session.user.fullName })}</p><div className="actions"><button type="button" className="btn primary" onClick={() => setView('jobs')}>{t('done.jobs')}</button></div></section>}
      {view === 'jobs' && <JobsList api={api} t={t} session={session} />}
    </div>
  );
}
