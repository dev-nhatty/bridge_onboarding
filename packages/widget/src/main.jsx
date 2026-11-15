import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import css from './styles.css?inline';

// Must be read synchronously, while the script is executing.
const script = document.currentScript;

/**
 * Mount the plug-in into any element.
 * options: { api, lang, assets, resume, prefs, prefill }
 *   api     base URL of the REST API, default "/api"
 *   lang    "en" | "am"
 *   assets  origin that serves /audio/<lang>/<step>.mp3, default: where this script came from
 *   resume  a resume token (also read from ?resume= in the page URL)
 *   prefs   initial accessibility preferences
 *   prefill initial fullName/contact answers
 */
function mount(el, options = {}) {
  // Shadow DOM keeps host CSS out and our CSS in. Screen readers and axe-core read through it.
  const shadow = el.shadowRoot || el.attachShadow({ mode: 'open' });
  shadow.replaceChildren();
  const style = document.createElement('style');
  style.textContent = css;
  const container = document.createElement('div');
  shadow.append(style, container);

  const emit = (name, detail = {}) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  const resume = options.resume ?? new URLSearchParams(window.location.search).get('resume') ?? undefined;
  const bus = new EventTarget();

  const root = createRoot(container);
  root.render(
    <App
      api={options.api ?? '/api'}
      lang={options.lang ?? 'en'}
      assets={options.assets ?? ''}
      resume={resume}
      prefs={options.prefs}
      prefill={options.prefill}
      bus={bus}
      emit={emit}
      modal={Boolean(options.modal)}
    />,
  );
  queueMicrotask(() => emit('bridge:ready'));

  const focus = () => {
    const heading = shadow.querySelector('h2[tabindex="-1"]');
    heading?.focus();
  };

  if (options.modal) {
    setTimeout(focus, 0);
  }

  return {
    unmount: () => root.unmount(),
    focus,
    update: (values = {}) => {
      if (values.prefs) bus.dispatchEvent(new CustomEvent('prefs', { detail: values.prefs }));
      if (values.prefill) bus.dispatchEvent(new CustomEvent('prefill', { detail: values.prefill }));
    },
  };
}

window.DigitalBridge = { mount };

// Level 1 install: <script src=".../bridge-onboarding.js" data-target="#signup" data-api="/api">
if (script?.dataset.target) {
  const run = () => {
    const el = document.querySelector(script.dataset.target);
    if (!el) return console.error(`[bridge] target ${script.dataset.target} not found`);
    mount(el, {
      api: script.dataset.api,
      lang: script.dataset.lang,
      assets: script.dataset.assets || new URL(script.src, window.location.href).origin,
      resume: script.dataset.resume,
    });
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run) : run();
}
