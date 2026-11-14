# Savanna integration

This directory contains the Savanna static-page starter files plus the Digital Bridge
onboarding host page.

## Routes

When served by the Bridge Express server:

- `/savanna/` — Savanna landing page with a new registration entry point.
- `/savanna/onboarding.html` — accessible registration/login page hosting the existing widget.
- `/savanna/pages/homepage-v1-paced.html` — original paced learner page.
- `/savanna/pages/homepage-v1-self-paced.html` — original self-paced learner page.
- `/savanna/pages/concept-with-navigation.html` — original concept page.
- `/widget/bridge-onboarding.js` — existing built widget bundle.
- `/api` — existing Bridge API routes (for example `/api/health`).

The Savanna `pages/` and `assets/` folders retain their original relative structure.
The original pages and shared assets are copied from the supplied Savanna starter ZIP.
The original Savanna landing page is modified only to add the registration card.

## Widget integration

`onboarding.html` uses the existing script-based integration:

```html
<div id="signup"></div>
<script
  src="/widget/bridge-onboarding.js"
  data-target="#signup"
  data-api="/api"
  data-lang="en">
</script>
```

The widget continues to own its React UI and styles inside Shadow DOM. It does not
depend on Savanna's CSS or JavaScript. The language selector and simple-language option
are provided by the existing widget.

For a separate website, use the integration instructions in the repository's root README
and point `data-api` and the widget script URL to the deployed Bridge server.

## Run locally

From the repository root:

```bash
npm install
npm run build
npm start
```

Then open:

- <http://localhost:3000/savanna/>
- <http://localhost:3000/savanna/onboarding.html>
- <http://localhost:3000/demo/>
- <http://localhost:3000/api/health>

With Docker:

```bash
docker compose up --build
```

## Notes

- The Savanna starter is a frozen static-page reference, not the full Savanna application.
  Its learner-page links and features remain as documented by the upstream starter.
- The original learner pages contain root-relative favicon references
  (`/favicon_alx.ico` and `/apple-touch-icon_alx.png`) that are not included in the
  supplied starter ZIP. These references are left unchanged in this incremental patch.
- This integration does not claim WCAG conformance for the complete frozen Savanna pages.
  The onboarding widget and host page must be tested as part of the complete learner journey.
