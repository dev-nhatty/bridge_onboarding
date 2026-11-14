import { useCallback, useEffect, useMemo, useRef } from 'react';

const BCP47 = { en: 'en-US', am: 'am-ET' };

/**
 * Read-aloud and voice typing.
 *
 * speak(stepId, text): first tries a recorded file  <assets>/audio/<lang>/<stepId>.mp3
 *   (reliable on any phone, works offline once cached), then falls back to the browser voice.
 *   Many Android phones have NO Amharic browser voice, so record the question audio.
 * listen(...): browser speech recognition (Chrome/Android). Needs internet.
 */
export function useSpeech({ lang, assets = '' }) {
  const audioRef = useRef(null);
  const recRef = useRef(null);

  const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const browserVoice = useCallback(
    (text) => {
      if (!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = BCP47[lang] ?? 'en-US';
      window.speechSynthesis.speak(u);
    },
    [lang],
  );

  const speak = useCallback(
    (stepId, text) => {
      stop();
      let fell = false;
      const fallback = () => {
        if (fell) return;
        fell = true;
        browserVoice(text);
      };
      const audio = new Audio(`${assets}/audio/${lang}/${stepId}.mp3`);
      audioRef.current = audio;
      audio.addEventListener('error', fallback);
      audio.play().catch(fallback); // rejects when the file is missing OR autoplay is blocked
    },
    [assets, lang, stop, browserVoice],
  );

  const listen = useCallback(
    ({ onText, onEnd, onError }) => {
      if (!Recognition) return onError?.('unsupported');
      const rec = new Recognition();
      recRef.current = rec;
      rec.lang = BCP47[lang] ?? 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => onText?.(e.results[0][0].transcript);
      rec.onerror = (e) => onError?.(e.error);
      rec.onend = () => onEnd?.();
      rec.start();
    },
    [Recognition, lang],
  );

  const cancelListen = useCallback(() => recRef.current?.abort(), []);
  useEffect(() => () => { stop(); recRef.current?.abort(); }, [stop]);

  return useMemo(
    () => ({ speak, stop, listen, cancelListen, canListen: Boolean(Recognition) }),
    [speak, stop, listen, cancelListen, Recognition],
  );
}
