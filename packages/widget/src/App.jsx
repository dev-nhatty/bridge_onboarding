import { useEffect, useMemo, useRef, useState } from 'react';
import { createApi } from './api.js';
import { LANGUAGES, makeT } from './i18n/index.js';
import Wizard from './wizard/Wizard.jsx';
import LoginForm from './LoginForm.jsx';
import JobsList from './gateway/JobsList.jsx';

export default function App({ api: apiBase, lang: initialLang, assets, resume, emit, modal = false }) {
  const api = useMemo(() => createApi(apiBase), [apiBase]);
  const [lang, setLang] = useState(initialLang);
  const [mode, setMode] = useState('normal'); // normal | simple (low-literacy path)
  const [view, setView] = useState('register'); // register | login | done | jobs
  const [session, setSession] = useState(null);
  const t = useMemo(() => makeT(lang, mode), [lang, mode]);
  const doneRef = useRef(null);

  useEffect(() => {
    if (view === 'done') doneRef.current?.focus();
  }, [view]);

  function onSession(res, next) {
    setSession(res);
    setView(next);
  }

  const containerProps = modal
    ? { className: `bridge ${mode === 'simple' ? 'simple' : ''} modal-mode`, lang }
    : { className: `bridge ${mode === 'simple' ? 'simple' : ''}`, lang, role: 'region', 'aria-label': t('app.label') };

  return (
    <div {...containerProps}>
      {modal && (
        <header className="modal-header">
          <div className="modal-header-row1">
            <div className="modal-brand">
              <svg className="modal-logo" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 19C3 11.5 8 6 12 6" stroke="#b5121b" strokeWidth="3" strokeLinecap="round" />
                <path d="M12 6C16 6 21 11.5 21 19" stroke="#2b6a3f" strokeWidth="3" strokeLinecap="round" />
                <path d="M6 19C6 14.5 9 11 12 11" stroke="#b5121b" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 11C15 11 18 14.5 18 19" stroke="#2b6a3f" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="modal-title">{t('modal.title')}</span>
            </div>
          </div>
          <div className="modal-header-row2">
            <div className="modal-controls">
              <label className="modal-lang-label">
                <span className="modal-pref-text">{t('prefs.language')}</span>
                <select className="modal-lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} lang={l.code}>{l.label}</option>
                  ))}
                </select>
              </label>
              <label className="modal-check-label">
                <input
                  type="checkbox"
                  className="modal-check-input"
                  checked={mode === 'simple'}
                  onChange={(e) => setMode(e.target.checked ? 'simple' : 'normal')}
                />
                <span className="modal-check-text">{t('prefs.simple')}</span>
              </label>
            </div>
            <button
              type="button"
              className="modal-close-btn"
              aria-label={t('modal.close')}
              onClick={() => emit('bridge:close')}
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>
      )}

      {!modal && (
        <div className="prefs">
          <label className="inline">
            <span>{t('prefs.language')}</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} lang={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={mode === 'simple'} onChange={(e) => setMode(e.target.checked ? 'simple' : 'normal')} />
            <span>{t('prefs.simple')}</span>
          </label>
        </div>
      )}

      {(view === 'register' || view === 'login') && (
        <nav aria-label={t('tabs.label')} className="tabs">
          <button type="button" className="tab" aria-current={view === 'register' ? 'page' : undefined} onClick={() => setView('register')}>
            {t('tab.register')}
          </button>
          <button type="button" className="tab" aria-current={view === 'login' ? 'page' : undefined} onClick={() => setView('login')}>
            {t('tab.login')}
          </button>
        </nav>
      )}

      {view === 'register' && (
        <Wizard
          api={api}
          t={t}
          lang={lang}
          mode={mode}
          assets={assets}
          resumeToken={resume}
          emit={emit}
          modal={modal}
          onPrefs={(p) => { if (p.lang) setLang(p.lang); if (p.mode) setMode(p.mode); }}
          onRegistered={(res) => onSession(res, 'done')}
        />
      )}

      {view === 'login' && <LoginForm api={api} t={t} emit={emit} onLoggedIn={(res) => onSession(res, 'jobs')} />}

      {view === 'done' && (
        <section>
          <h2 tabIndex={-1} ref={doneRef}>{t('done.title')}</h2>
          <p>{t('done.body', { name: session.user.fullName })}</p>
          <div className="actions">
            <button type="button" className="btn primary" onClick={() => setView('jobs')}>{t('done.jobs')}</button>
          </div>
        </section>
      )}

      {view === 'jobs' && <JobsList api={api} t={t} session={session} />}
    </div>
  );
}
