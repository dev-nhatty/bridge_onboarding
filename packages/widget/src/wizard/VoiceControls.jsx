import { useEffect, useRef, useState } from 'react';

const VOICE_ERROR_KEYS = {
  unsupported: 'voice.unsupported',
  'not-allowed': 'voice.permission',
  'service-not-allowed': 'voice.permission',
  'audio-capture': 'voice.audio',
  'no-speech': 'voice.noSpeech',
  network: 'voice.network',
  'language-not-supported': 'voice.language',
  'start-failed': 'voice.error',
  unknown: 'voice.error',
};

// "Read the question aloud" on every step; "Speak your answer" on free-text
// steps. Final dictation is written into the existing controlled form field.
export default function VoiceControls({ t, speech, stepId, questionText, canDictate, onText }) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const [interim, setInterim] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      speech.cancelListen();
    };
  }, [speech]);

  function dictate() {
    if (listening) {
      speech.cancelListen();
      setListening(false);
      setInterim('');
      setMessage(t('voice.stopped'));
      return;
    }

    setMessage(t('listening'));
    setInterim('');
    setListening(true);

    const started = speech.listen({
      onStart: () => {
        if (mountedRef.current) setMessage(t('listening'));
      },
      onText: (text) => {
        if (!mountedRef.current || !text) return;
        // StepField passes the reducer-backed onChange callback here, so the
        // recognized words become the value of the actual form input.
        onText(text);
        setMessage(t('voice.heard', { text }));
        setInterim('');
      },
      onInterim: (text) => {
        if (mountedRef.current) setInterim(text);
      },
      onError: (code) => {
        if (!mountedRef.current) return;
        const key = VOICE_ERROR_KEYS[code] ?? 'voice.error';
        setMessage(t(key));
      },
      onEnd: () => {
        if (!mountedRef.current) return;
        setListening(false);
        setInterim('');
      },
    });

    if (!started) setListening(false);
  }

  return (
    <div className="voice">
      <button type="button" className="btn ghost" onClick={() => speech.speak(stepId, questionText)}>
        <span aria-hidden="true">🔊 </span>
        {t('readAloud')}
      </button>

      {canDictate && speech.canListen && (
        <button
          type="button"
          className="btn ghost"
          aria-pressed={listening}
          onClick={dictate}
        >
          <span aria-hidden="true">🎤 </span>
          {listening ? t('voice.stop') : t('speak')}
        </button>
      )}

      {canDictate && !speech.canListen && <p className="hint">{t('voice.unsupported')}</p>}

      <p className="hint voice-msg" role="status" aria-live="polite">
        {interim ? `${t('listening')} ${interim}` : message}
      </p>
    </div>
  );
}
