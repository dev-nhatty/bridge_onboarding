import { useState } from 'react';

// "Read the question aloud" on every step; "Speak your answer" on free-text steps.
// Dictated text goes INTO the field so the learner can review and edit it (never auto-submitted).
export default function VoiceControls({ t, speech, stepId, questionText, canDictate, onText }) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');

  function dictate() {
    if (listening) return speech.cancelListen();
    setListening(true);
    setMessage(t('listening'));
    speech.listen({
      onText: (text) => {
        onText(text);
        setMessage(t('voice.heard', { text }));
      },
      onError: (code) => setMessage(code === 'unsupported' ? t('voice.unsupported') : t('voice.error')),
      onEnd: () => setListening(false),
    });
  }

  return (
    <div className="voice">
      <button type="button" className="btn ghost" onClick={() => speech.speak(stepId, questionText)}>
        <span aria-hidden="true">🔊 </span>
        {t('readAloud')}
      </button>
      {canDictate && speech.canListen && (
        <button type="button" className="btn ghost" aria-pressed={listening} onClick={dictate}>
          <span aria-hidden="true">🎤 </span>
          {t('speak')}
        </button>
      )}
      {canDictate && !speech.canListen && <p className="hint">{t('voice.unsupported')}</p>}
      <p className="hint voice-msg" role="status">{message}</p>
    </div>
  );
}
