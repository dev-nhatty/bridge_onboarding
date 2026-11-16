# Digital Bridge – Accessible Login & Registration Wizard

A drop-in sign-up and login component for training platforms and job boards (Track 1, *Accessible onboarding*).
One question per screen, voice input and read-aloud, other ID routes, private support needs, save-and-resume, a low-literacy "simple words" mode, and a small career gateway.

## Quick start (about 5 minutes)

```bash
npm install
npm run build          # builds packages/widget/dist/bridge-onboarding.js
npm start              # API + demo host on http://localhost:3000
```

Open <http://localhost:3000/demo/> to see the widget on a plain HTML page. API docs: <http://localhost:3000/api/docs>.

With Docker: `docker compose up --build` (same URLs).

### Developing

```bash
npm run dev:server     # API on :3000, restarts on change
npm run dev:widget     # Vite dev page with hot reload (calls the API on :3000)
npm test               # server tests + widget unit tests
npm run test:e2e       # keyboard-only walk-through + axe-core (first run: npx playwright install chromium)
```

## Install on another site

**Level 1 – one script tag**

```html
<div id="signup"></div>
<script src="https://YOUR-HOST/widget/bridge-onboarding.js"
        data-target="#signup"
        data-api="https://YOUR-HOST/api"
        data-lang="en"></script>
```

| Attribute | Meaning | Default |
|---|---|---|
| `data-target` | CSS selector of the element to fill | required |
| `data-api` | base URL of the REST API | `/api` |
| `data-lang` | `en` or `am` | `en` |
| `data-assets` | where `/audio/<lang>/<step>.mp3` is served | origin of the script |
| `data-resume` | resume token (also read from `?resume=` in the page URL) | none |

Or from JavaScript: `window.DigitalBridge.mount(element, { api, lang, assets, resume })`.

**Events** (DOM `CustomEvent`s on the target element, so the host can create its own session):

| Event | `detail` |
|---|---|
| `bridge:ready` | – |
| `bridge:registered` | `{ userId, fullName, token }` |
| `bridge:login` | `{ userId, fullName, token }` |

**Level 2 – REST API.** OpenAPI spec at `/api/openapi.json` (also `packages/server/src/openapi.json`). Browsable at `/api/docs`.
Set `CORS_ORIGINS` (comma-separated) to the host sites allowed to call the API.

**Level 3 – open standards.** Not done yet. Ideas: LTI 1.3 launch, `schema.org/JobPosting` for `/api/jobs`.


## Detecting needs and launching the wizard

### Accessibility preferences

The widget normalizes this preference object:

```js
{
  lang: 'en' | 'am',
  mode: 'normal' | 'simple',
  textScale: 100 | 125 | 150,
  contrast: 'normal' | 'high',
  autoRead: boolean,
  reduceMotion: boolean
}
```

Defaults are English, normal wording, 100% text, normal contrast, read-aloud off, and the current system reduced-motion preference. `DigitalBridge.mount(element, options)` accepts:

| Option | Meaning |
|---|---|
| `api` | API base URL; defaults to `/api`. |
| `lang` | Initial language, `en` or `am`; defaults to `en`. |
| `assets` | Base path for `/audio/<lang>/<step>.mp3`; direct JavaScript mounts default to an empty string. The script-tag installer defaults this to the script's origin. |
| `resume` | Draft resume token; if omitted, the widget also checks the page's `?resume=` parameter. |
| `modal` | Whether the widget is rendered in modal mode; defaults to `false`. |
| `prefs` | Partial initial accessibility preferences, normalized to the allowed values above. |
| `prefill` | Optional `{ fullName, contact }` strings. Each is trimmed and limited to 120 characters; no password is accepted. |

The returned handle has `unmount()`, `focus()`, and `update(values)`. `update` can apply `lang`, `prefs`, and `prefill`; the demo host also uses `openSettings` to open the settings panel. Widget lifecycle and preference events are dispatched on the mount element; `bridge:offer` is dispatched on the target passed to `suggest` (the document by default). These events bubble and are composed.

| Event | `detail` |
|---|---|
| `bridge:ready` | `{}` |
| `bridge:registered` | `{ userId, fullName, token }` |
| `bridge:login` | `{ userId, fullName, token }` |
| `bridge:close` | `{}` |
| `bridge:prefs` | The complete normalized preference object shown above. |
| `bridge:offer` | `{ reasons: [{ id, strength }] }`, where `strength` is `strong` or `weak`. |

### Browser hints and the offer policy

Call `DigitalBridge.suggest(target = document)` to inspect local browser signals and, when appropriate, dispatch `bridge:offer`. It returns `{ reasons, offer }`. The detector reads browser language (`navigator.languages` / `navigator.language`), data-saving and effective-network information (`navigator.connection`), the `prefers-reduced-data`, `prefers-contrast`, `forced-colors`, and `prefers-reduced-motion` media queries, and the computed font size of a temporary hidden probe.

The current reason IDs and strengths are:

- **Strong:** `lang-am`, `save-data`.
- **Weak:** `high-contrast`, `forced-colors`, `reduced-motion`, `slow-network`, `large-font`.

An offer is made when at least one strong reason or at least two weak reasons are present. The demo host calls `DigitalBridge.suggest(document)` once on `DOMContentLoaded`. The script-tag installer can also opt in with `data-suggest`. Detection does not run automatically in the widget unless the host calls it or uses that attribute.

The offer banner does not state a reason. Dismissing it stores only `bridge.offer.dismissed` in `sessionStorage` for that tab. Accessibility preferences are saved to `localStorage` under `bridge.prefs.v1` only after the learner opts in with **Remember settings**.

### Host-page entry points

The demo page provides the **Open the accessible step-by-step registration** skip button as the first keyboard stop. `Alt+Shift+A` is also available; it requires Alt and Shift, ignores Ctrl/Meta combinations, and does nothing while the dialog is already open.

The inline **How can we help you?** chooser offers read-aloud, simple wording, larger/high-contrast text, and Amharic presets. The standard Register form also offers the wizard after the same field fails on two separate submissions, after three failed submissions overall, or after a required field stays focused for 45 seconds without input. That notice observes only the Register form. Continuing carries only the trimmed name and email (or phone if email is empty) into the wizard; it never carries a password, track, or covenant checkbox.

A URL opens the wizard only when `assist` is one of `simple`, `voice`, `large`, or `1`, or when `resume` is a 32-character hexadecimal token. `assist=simple` enables simple wording and read-aloud; `assist=voice` enables read-aloud; `assist=large` selects 150% text and high contrast; `assist=1` adds no preset. A valid `lang=en` or `lang=am` selects the language but does not open the wizard by itself. The host removes `assist`, `lang`, and `resume` from the URL after opening.

## How it works

```
packages/
  widget/      React + Vite → one file, runs in a Shadow DOM (host CSS cannot break it)
    src/wizard/steps.js        ← the questions, as data. Add a question here.
    src/i18n/locales/*.json    ← all text (English, Amharic)
    src/hooks/useSpeech.js     ← read-aloud + voice typing
  server/      Express + SQLite (better-sqlite3), zod validation, JWT, OpenAPI
  demo-host/   plain HTML page that pretends to be Savanna
e2e/           Playwright + axe-core, keyboard only
docs/          WCAG conformance report + co-designer log (both required for submission)
```

Flow: the wizard creates a **draft** on the first Next, autosaves after every question, and only the final step
sends the password (`POST /drafts/:token/submit`). The password is never stored in a draft; the server rejects it.
After the account exists the draft is emptied.

### Privacy choices (say these to the judges)
- Passwords are hashed (bcrypt). Drafts can never contain a password (server-side `.strict()` schema + a unit test).
- "Support I need" lives in its own table, with no medical proof asked for. The jobs filter runs per request and the server does not record it.
- "Refer me through a partner" needs no ID at all.
- Phone/email is one question, because many learners have only one of them.

Needs detection runs locally and inspects browser language, data-saving/network hints, the reduced-data/high-contrast/forced-colors/reduced-motion media queries, and the computed font size of a temporary hidden probe. These signals and reason codes do not leave the browser or go to the Bridge server. No disability is inferred or stored, and the offer banner never states a reason. The only storage keys used by these features are `bridge.prefs.v1` in `localStorage` (written only after the learner opts in) and `bridge.offer.dismissed` in `sessionStorage` (written after dismissing the offer). Struggle counters and standard-form values remain in page memory; only the trimmed name and contact can be prefilled into the wizard. Optional voice typing uses the browser's Web Speech Recognition API; any audio processing by the browser/provider is outside this application's control. Keyboard typing remains available when speech recognition is unsupported.

## Known gaps (do these next, in this order)

1. **Test with your co-designer on their own phone, now.** Log what they hit in `docs/co-designer-log.md`.
2. **Record the question audio** (`packages/server/public/audio/<lang>/<stepId>.mp3`: `fullName, contact, idRoute, idNumber, support, supportNote, password`). Many Android phones have no Amharic browser voice, so recordings are the reliable path. The widget uses the file first, then falls back to the browser voice.
3. **Amharic review.** `am.json` is a first draft written without a native-speaker review. Have an Amharic speaker (your interpreter or co-designer) correct it.
4. **Voice for choice steps.** Mic only fills text fields today. Add "say the option name" for radio/checkbox steps.
5. **Review screen** before creating the account (read all answers back, with Edit links).
6. **Real SMS** in `POST /drafts/:token/send-link` (currently printed to the server log).
7. **Career gateway**: voice answers on the application question, and a UI for the employer form (`POST /api/jobs` exists, no UI yet, and it needs an employer login).
8. **Partner registration with consent** (extra credit).
9. **Encrypt `id_number`** at rest, and add draft expiry (e.g. delete drafts after 30 days).
10. Ethiopian-calendar date field, if you add any dates.
11. The "Question 3 of 6" total grows to 7 when a learner picks an ID that needs a number. Fine for now; consider hiding the total.

## Submission checklist (Sunday 16:30)
- [ ] code, README, `docker compose up` works from a clean clone
- [ ] `docs/WCAG-2.2-AA-conformance-report.md` filled in with real results
- [ ] `npm run test:e2e` passes (zero critical/serious axe issues)
- [ ] your co-designer completed the main task unaided with NVDA, TalkBack, keyboard only, 200% zoom, sound off
- [ ] a stranger can install it from this README in under an hour (ask a neighbouring team to try)
