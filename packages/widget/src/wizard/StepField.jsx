import { useRef, useState } from 'react';
import VoiceControls from './VoiceControls.jsx';
import enDict from '../i18n/locales/en.json';
import amDict from '../i18n/locales/am.json';

function renderTipContent(text, lang) {
  if (!text) return null;
  if (lang === 'en' && text.includes('ፊደል')) {
    const parts = text.split(/(ፊደል)/g);
    return parts.map((part, i) => (part === 'ፊደል' ? <span key={i} lang="am">{part}</span> : part));
  }
  return text;
}

// Renders ONE question: heading, hint, control, error. The heading is the accessible name of the
// control (aria-labelledby) and receives focus when the step changes.
export default function StepField({ step, value, error, t, lang = 'en', mode = 'normal', speech, headingRef, fieldRef, index, total, onChange }) {
  const [showPw, setShowPw] = useState(false);
  const localFieldRef = useRef(null);

  const setRef = (el) => {
    localFieldRef.current = el;
    if (typeof fieldRef === 'function') fieldRef(el);
    else if (fieldRef) fieldRef.current = el;
  };

  const hid = `h-${step.id}`;
  const hintId = `hint-${step.id}`;
  const errId = `err-${step.id}`;
  const hasHint = t.has(`hint.${step.id}`);
  const describedBy = [hasHint ? hintId : null, error ? errId : null].filter(Boolean).join(' ') || undefined;
  const question = t(`q.${step.id}`);

  const secLang = lang === 'am' ? 'en' : 'am';
  const secDict = lang === 'am' ? enDict : amDict;
  const secKey = mode === 'simple' && secDict[`simple.q.${step.id}`] ? `simple.q.${step.id}` : `q.${step.id}`;
  const secQuestion = secDict[secKey] || secDict[`q.${step.id}`];

  const common = {
    id: `f-${step.id}`,
    ref: setRef,
    'aria-labelledby': hid,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    autoComplete: step.autocomplete,
  };

  const hasValue = value !== undefined && value !== '' && value !== null;
  const hasPh = t.has(`ph.${step.id}`);
  const placeholder = hasPh ? t(`ph.${step.id}`) : undefined;
  const hasTip = t.has(`tip.${step.id}`);
  const tipText = hasTip ? t(`tip.${step.id}`) : null;

  let control;
  if (step.type === 'text') {
    control = (
      <div className="input-wrap">
        <input
          type="text"
          {...common}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
        {hasValue && (
          <button
            type="button"
            className="btn-clear"
            aria-label={t('clearAnswer')}
            onClick={() => {
              onChange('');
              localFieldRef.current?.focus();
            }}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        )}
      </div>
    );
  } else if (step.type === 'textarea') {
    control = (
      <div className="input-wrap textarea-wrap">
        <textarea
          rows={4}
          {...common}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
        {hasValue && (
          <button
            type="button"
            className="btn-clear"
            aria-label={t('clearAnswer')}
            onClick={() => {
              onChange('');
              localFieldRef.current?.focus();
            }}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        )}
      </div>
    );
  } else if (step.type === 'password') {
    control = (
      <>
        <input type={showPw ? 'text' : 'password'} {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        <label className="check">
          <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />
          <span>{t('showPassword')}</span>
        </label>
      </>
    );
  } else if (step.type === 'choice') {
    control = (
      <div role="radiogroup" aria-labelledby={hid} aria-describedby={describedBy} aria-invalid={error ? true : undefined} className="options">
        {step.options.map((o, i) => (
          <label key={o} className="option">
            <input type="radio" name={step.id} value={o} checked={value === o} ref={i === 0 ? setRef : undefined} onChange={() => onChange(o)} />
            <span>{t(`opt.${o}`)}</span>
          </label>
        ))}
      </div>
    );
  } else if (step.type === 'multi') {
    const chosen = value ?? [];
    const toggle = (o) => onChange(chosen.includes(o) ? chosen.filter((x) => x !== o) : [...chosen, o]);
    control = (
      <div role="group" aria-labelledby={hid} aria-describedby={describedBy} className="options">
        {step.options.map((o, i) => (
          <label key={o} className="option">
            <input type="checkbox" value={o} checked={chosen.includes(o)} ref={i === 0 ? setRef : undefined} onChange={() => toggle(o)} />
            <span>{t(`opt.${o}`)}</span>
          </label>
        ))}
      </div>
    );
  }

  const canDictate = step.type === 'text' || step.type === 'textarea'; // never dictate passwords

  return (
    <div className={`step type-${step.type}`}>
      <div className="qhead">
        <h2 id={hid} tabIndex={-1} ref={headingRef}>
          <span className="sr-only">{t('progress', { n: index + 1, total })}. </span>
          {question}
        </h2>
      </div>
      {secQuestion && (
        <p lang={secLang} className="secondary-q">
          {secQuestion}
        </p>
      )}
      <VoiceControls
        t={t}
        speech={speech}
        stepId={step.id}
        questionText={question}
        canDictate={canDictate}
        onText={onChange}
      />
      {hasHint && <p id={hintId} className="hint">{t(`hint.${step.id}`)}</p>}
      {control}
      {hasTip && (
        <p className="tip-line" {...(lang === 'am' ? { lang: 'am' } : {})}>
          {renderTipContent(tipText, lang)}
        </p>
      )}
      {error && (
        <p id={errId} className="error">
          <span aria-hidden="true">⚠ </span>
          {t(error)}
        </p>
      )}
    </div>
  );
}
