import { useEffect, useMemo, useRef, useState } from 'react';
import { createApi } from './api.js';
import { LANGUAGES, makeT } from './i18n/index.js';
import Wizard from './wizard/Wizard.jsx';
import LoginForm from './LoginForm.jsx';
import JobsList from './gateway/JobsList.jsx';

export default function App({ api: apiBase, lang: initialLang, assets, resume, emit }) {
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

  return (
    <div className={`bridge ${mode === 'simple' ? 'simple' : ''}`} lang={lang} role="region" aria-label={t('app.label')}>
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
