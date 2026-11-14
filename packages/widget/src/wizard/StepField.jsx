import { useState } from 'react';
import VoiceControls from './VoiceControls.jsx';

// Renders ONE question: heading, hint, control, error. The heading is the accessible name of the
// control (aria-labelledby) and receives focus when the step changes.
export default function StepField({ step, value, error, t, speech, headingRef, fieldRef, index, total, onChange }) {
  const [showPw, setShowPw] = useState(false);
  const hid = `h-${step.id}`;
  const hintId = `hint-${step.id}`;
  const errId = `err-${step.id}`;
  const hasHint = t.has(`hint.${step.id}`);
  const describedBy = [hasHint ? hintId : null, error ? errId : null].filter(Boolean).join(' ') || undefined;
  const question = t(`q.${step.id}`);

  const common = {
    id: `f-${step.id}`,
    ref: fieldRef,
    'aria-labelledby': hid,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    autoComplete: step.autocomplete,
  };

  let control;
  if (step.type === 'text') {
    control = <input type="text" {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  } else if (step.type === 'textarea') {
    control = <textarea rows={4} {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
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
            <input type="radio" name={step.id} value={o} checked={value === o} ref={i === 0 ? fieldRef : undefined} onChange={() => onChange(o)} />
            <span className="oicon" aria-hidden="true">{step.icons?.[o]}</span>
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
            <input type="checkbox" value={o} checked={chosen.includes(o)} ref={i === 0 ? fieldRef : undefined} onChange={() => toggle(o)} />
            <span className="oicon" aria-hidden="true">{step.icons?.[o]}</span>
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
        <span className="qicon" aria-hidden="true">{step.icon}</span>
        <h2 id={hid} tabIndex={-1} ref={headingRef}>
          <span className="sr-only">{t('progress', { n: index + 1, total })}. </span>
          {question}
        </h2>
      </div>
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
      {error && (
        <p id={errId} className="error">
          <span aria-hidden="true">⚠ </span>
          {t(error)}
        </p>
      )}
    </div>
  );
}
