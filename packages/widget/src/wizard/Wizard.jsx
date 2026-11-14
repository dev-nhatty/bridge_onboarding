import { useEffect, useReducer, useRef } from 'react';
import { reducer, initialState } from './reducer.js';
import { visibleSteps, savableAnswers } from './steps.js';
import { validateStep } from './validate.js';
import StepField from './StepField.jsx';
import { useSpeech } from '../hooks/useSpeech.js';

const ERROR_KEYS = { exists: 'err.exists', invalid_contact: 'err.contact' };

export default function Wizard({ api, t, lang, mode, assets, resumeToken, onPrefs, emit, onRegistered }) {
  const [s, dispatch] = useReducer(reducer, initialState);
  const speech = useSpeech({ lang, assets });
  const headingRef = useRef(null);
  const fieldRef = useRef(null);
  const firstRender = useRef(true);

  const vis = visibleSteps(s.answers);
  const index = Math.min(s.index, vis.length - 1);
  const step = vis[index];
  const isLast = index === vis.length - 1;

  // Resume from an SMS link (?resume=<token>)
  useEffect(() => {
    if (!resumeToken) return;
    api
      .getDraft(resumeToken)
      .then((d) => {
        dispatch({ type: 'loaded', token: resumeToken, answers: d.answers, index: d.stepIndex });
        onPrefs?.({ lang: d.lang, mode: d.mode });
      })
      .catch(() => dispatch({ type: 'notice', notice: { kind: 'error', key: 'err.resumeFailed' } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeToken]);

  // When the step changes, move focus to the question so screen-reader users hear it.
  // (Skipped on first render so the widget never steals focus from the host page.)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    if (mode === 'simple') speech.speak(step.id, t(`q.${step.id}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  // When an error appears, return focus to the field it belongs to.
  useEffect(() => {
    if (s.errorKey) fieldRef.current?.focus();
  }, [s.errorKey]);

  // Autosave after every question. A failed save never blocks the learner.
  async function save(answers, stepIndex) {
    try {
      let token = s.token;
      if (!token) {
        ({ token } = await api.createDraft({ lang, mode }));
        dispatch({ type: 'token', token });
      }
      await api.saveDraft(token, { answers: savableAnswers(answers), stepIndex, lang, mode });
      dispatch({ type: 'notice', notice: { kind: 'ok', key: 'saved' } });
      return token;
    } catch {
      dispatch({ type: 'notice', notice: { kind: 'error', key: 'err.saveFailed' } });
      return s.token;
    }
  }

  async function submit() {
    dispatch({ type: 'status', status: 'submitting' });
    try {
      const token = await save(s.answers, index);
      if (!token) throw new Error('no draft');
      const res = await api.submit(token, s.answers.password);
      emit('bridge:registered', { userId: res.user.id, fullName: res.user.fullName, token: res.token });
      onRegistered(res);
    } catch (e) {
      dispatch({ type: 'error', key: ERROR_KEYS[e.code] ?? 'err.generic' });
      dispatch({ type: 'status', status: 'idle' });
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const key = validateStep(step, s.answers[step.field]);
    if (key) return dispatch({ type: 'error', key });
    if (isLast) return submit();
    await save(s.answers, index + 1);
    dispatch({ type: 'go', index: index + 1 });
  }

  async function sendLink() {
    try {
      await api.sendLink(s.token);
      dispatch({ type: 'notice', notice: { kind: 'ok', key: 'resume.sent' } });
    } catch {
      dispatch({ type: 'notice', notice: { kind: 'error', key: 'err.generic' } });
    }
  }

  const pct = Math.round(((index + 1) / vis.length) * 100);

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="progress" aria-hidden="true">
        <span className="progress-text">{t('progress', { n: index + 1, total: vis.length })}</span>
        <span className="progress-bar"><span style={{ width: `${pct}%` }} /></span>
      </div>

      <StepField
        key={step.id}
        step={step}
        value={s.answers[step.field]}
        error={s.errorKey}
        t={t}
        speech={speech}
        headingRef={headingRef}
        fieldRef={fieldRef}
        index={index}
        total={vis.length}
        onChange={(value) => dispatch({ type: 'answer', field: step.field, value })}
      />

      <div className="actions">
        {index > 0 && (
          <button type="button" className="btn secondary" onClick={() => dispatch({ type: 'go', index: index - 1 })}>
            {t('back')}
          </button>
        )}
        <button type="submit" className="btn primary" disabled={s.status === 'submitting'}>
          {isLast ? t('finish') : t('next')}
        </button>
      </div>

      {s.token && s.answers.contact && (
        <button type="button" className="link" onClick={sendLink}>{t('resume.send')}</button>
      )}

      <p className={`status ${s.notice?.kind ?? ''}`} role="status">
        {s.notice ? t(s.notice.key) : ''}
      </p>
    </form>
  );
}
