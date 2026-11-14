import { useCallback, useEffect, useMemo, useRef } from 'react';

const SPEECH_LOCALES = {
  en: 'en-US',
  am: 'am-ET',
};

/**
 * Browser speech helpers.
 *
 * Voice typing uses the browser's Web Speech Recognition implementation.
 * The browser itself owns microphone access and displays its permission prompt.
 * This does not record or upload audio to the Bridge server.
 *
 * Important: Web Speech Recognition is not implemented by every browser.
 * In particular, Firefox may not expose SpeechRecognition at all. In that
 * case we report "unsupported" instead of opening a microphone that cannot
 * produce a transcript.
 */
export function useSpeech({ lang, assets = '' }) {
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  const Recognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined;

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const browserVoice = useCallback(
    (text) => {
      if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LOCALES[lang] ?? lang ?? 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [lang],
  );

  const speak = useCallback(
    (stepId, text) => {
      stop();

      let usedFallback = false;
      const fallback = () => {
        if (usedFallback) return;
        usedFallback = true;
        browserVoice(text);
      };

      const audio = new Audio(`${assets}/audio/${lang}/${stepId}.mp3`);
      audioRef.current = audio;
      audio.addEventListener('error', fallback, { once: true });
      audio.play().catch(fallback);
    },
    [assets, lang, stop, browserVoice],
  );

  const listen = useCallback(
    ({ onText, onInterim, onStart, onEnd, onError } = {}) => {
      if (!Recognition) {
        onError?.('unsupported');
        onEnd?.();
        return false;
      }

      // Avoid starting two recognition sessions at the same time.
      if (recognitionRef.current) return false;

      let recognition;
      try {
        recognition = new Recognition();
      } catch {
        onError?.('start-failed');
        onEnd?.();
        return false;
      }

      recognitionRef.current = recognition;

      let finalTranscript = '';
      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
        }
        onInterim?.('');
        onEnd?.();
      };

      recognition.lang = SPEECH_LOCALES[lang] ?? lang ?? 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => onStart?.();

      recognition.onresult = (event) => {
        let interimTranscript = '';

        // resultIndex identifies the first result changed by this event.
        // Read every changed result instead of assuming the transcript is
        // always located at results[0].
        const firstChanged = Number.isInteger(event.resultIndex) ? event.resultIndex : 0;
        for (let i = firstChanged; i < event.results.length; i += 1) {
          const result = event.results[i];
          const transcript = result?.[0]?.transcript ?? '';
          if (result.isFinal) {
            finalTranscript += `${transcript} `;
          } else {
            interimTranscript += transcript;
          }
        }

        onInterim?.(interimTranscript.trim());

        const completedText = finalTranscript.trim();
        if (completedText) onText?.(completedText);
      };

      recognition.onerror = (event) => {
        // "aborted" is expected when the user presses Stop.
        if (event.error !== 'aborted') onError?.(event.error || 'unknown');
      };

      recognition.onnomatch = () => onError?.('no-speech');
      recognition.onend = finish;

      try {
        recognition.start();
        return true;
      } catch (error) {
        if (recognitionRef.current === recognition) recognitionRef.current = null;
        onError?.(error?.name === 'NotAllowedError' ? 'not-allowed' : 'start-failed');
        onEnd?.();
        return false;
      }
    },
    [Recognition, lang],
  );

  const cancelListen = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    // Clear the reference before aborting so a late onend event cannot
    // interfere with a newly started session.
    recognitionRef.current = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onnomatch = null;
    recognition.onend = null;

    try {
      recognition.abort();
    } catch {
      // The recognition session may already have ended.
    }
  }, []);

  useEffect(
    () => () => {
      stop();
      cancelListen();
    },
    [stop, cancelListen],
  );

  return useMemo(
    () => ({
      speak,
      stop,
      listen,
      cancelListen,
      canListen: Boolean(Recognition),
    }),
    [speak, stop, listen, cancelListen, Recognition],
  );
}
