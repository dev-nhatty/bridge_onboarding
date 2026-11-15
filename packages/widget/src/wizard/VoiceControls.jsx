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
      <button type="button" className="btn-voice" onClick={() => speech.speak(stepId, questionText)}>
        <svg className="voice-icon-speaker" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
        <span>{t('readAloud')}</span>
      </button>

      {canDictate && speech.canListen && (
        <button
          type="button"
          className="btn-voice"
          aria-pressed={listening}
          onClick={dictate}
        >
          <svg className="voice-icon-mic" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
          </svg>
          <span>{listening ? t('voice.stop') : t('speak')}</span>
        </button>
      )}

      {canDictate && !speech.canListen && <p className="hint">{t('voice.unsupported')}</p>}

      <p className="hint voice-msg" role="status" aria-live="polite">
        {interim ? `${t('listening')} ${interim}` : message}
      </p>
    </div>
  );
}
