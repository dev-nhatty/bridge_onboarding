# WCAG 2.2 AA Conformance Report – Accessible Onboarding Wizard

**Product:** Digital Bridge accessible login & registration wizard (Track 1)
**Version / commit:** _fill in_
**Date tested:** _fill in_
**Team:** _fill in_

## How we tested

| Method | Tool / version | Who | Result |
|---|---|---|---|
| Automated | axe-core (`npm run test:e2e`) | This implementation session | Not run; dependencies are not installed in the supplied project. |
| Keyboard only | Chrome | Not run in this session | Not tested. |
| Screen reader (desktop) | NVDA + Firefox/Chrome | Co-designer session pending | Not tested. |
| Screen reader (mobile) | TalkBack + Android | Co-designer session pending | Not tested. |
| Zoom 200% / reflow at 320px | Chrome | Not run in this session | Not tested. |
| Sound off (no audio-only information) | Browser | Not run in this session | Not tested. |

Co-designer task: _"Register an account, then log in and open the job list, unaided."_ Result: **Not tested in this delivery**; no co-designer observation has been recorded.

## Criteria

Status: **Supports**, **Partially supports**, **Does not support**, **Not applicable**, or **Not tested**. Replace each **Not tested** only when a real test, screenshot, or co-designer observation is available. The list below covers the criteria most relevant to a form widget. Before submitting, check the remaining WCAG 2.2 A/AA criteria against <https://www.w3.org/TR/WCAG22/> and add rows for any that apply.

| SC | Name | Status | Evidence / notes |
|---|---|---|---|
| 1.1.1 | Non-text content | Not tested | Icons are `aria-hidden`; every control has a text name. No test or co-designer evidence is recorded in this delivery. |
| 1.3.1 | Info and relationships | Not tested | Radio/checkbox groups use `role=radiogroup/group` labelled by the question heading; errors linked with `aria-describedby`. No test or co-designer evidence is recorded in this delivery. |
| 1.3.2 | Meaningful sequence | Not tested | No test or co-designer evidence is recorded in this delivery. |
| 1.3.5 | Identify input purpose | Not tested | `autocomplete` on name, username, new-password. No test or co-designer evidence is recorded in this delivery. |
| 1.4.1 | Use of colour | Not tested | Errors have a ⚠ icon and text, not just red. No test or co-designer evidence is recorded in this delivery. |
| 1.4.3 | Contrast (minimum) | Not tested | High-contrast preference is implemented; no measured contrast audit or co-designer observation is recorded. |
| 1.4.4 | Resize text | Not tested | The settings panel offers 100%, 125%, and 150% text sizes; `e2e/settings.spec.js` checks a size change, but the suite has not been run. |
| 1.4.10 | Reflow | Not tested | `e2e/chooser.spec.js` checks the chooser at 320px and `e2e/offer.spec.js` checks the host page at 320px; settings-panel reflow and 400% zoom have no recorded result, and tests were not run. |
| 1.4.11 | Non-text contrast | Not tested | High-contrast styling exists, but component-boundary and focus-indicator contrast have not been measured. |
| 1.4.12 | Text spacing | Not tested | No test or co-designer evidence is recorded in this delivery. |
| 1.4.13 | Content on hover or focus | Not tested | No hover-only content. No test or co-designer evidence is recorded in this delivery. |
| 2.1.1 | Keyboard | Not tested | `e2e/a11y.spec.js` completes registration with keyboard only. No test or co-designer evidence is recorded in this delivery. |
| 2.1.2 | No keyboard trap | Not tested | No test or co-designer evidence is recorded in this delivery. |
| 2.1.4 | Character key shortcuts | Not tested | The host handles `Alt+Shift+A` and ignores Ctrl/Meta; `e2e/skiplink.spec.js` covers the shortcut but has not been run. |
| 2.2.1 | Timing adjustable | Not tested | No time-outs anywhere in the wizard. No test or co-designer evidence is recorded in this delivery. |
| 2.2.2 | Pause, stop, hide | Not tested | Reduced-motion preferences are applied to the widget and host animations; no manual or automated pause/stop/hide result is recorded. |
| 2.4.1 | Bypass blocks | Not tested | `#skip-wizard` is the first body control and `e2e/skiplink.spec.js` checks first-Tab access; the suite has not been run. |
| 2.4.3 | Focus order | Not tested | Focus moves to the question heading on each step. No test or co-designer evidence is recorded in this delivery. |
| 2.4.6 | Headings and labels | Not tested | No test or co-designer evidence is recorded in this delivery. |
| 2.4.7 | Focus visible | Not tested | No test or co-designer evidence is recorded in this delivery. |
| 2.4.11 | Focus not obscured (minimum) | Not tested | Check on a phone with the on-screen keyboard open. No test or co-designer evidence is recorded in this delivery. |
| 2.5.3 | Label in name | Not tested | No test or co-designer evidence is recorded in this delivery. |
| 2.5.7 | Dragging movements | Not tested | No dragging used. No test or co-designer evidence is recorded in this delivery. |
| 2.5.8 | Target size (minimum) | Not tested | Controls ≥ 44px. No test or co-designer evidence is recorded in this delivery. |
| 3.1.1 | Language of page | Not tested | Widget root carries `lang`. No test or co-designer evidence is recorded in this delivery. |
| 3.1.2 | Language of parts | Not tested | Language switcher options carry their own `lang`. No test or co-designer evidence is recorded in this delivery. |
| 3.2.1 | On focus | Not tested | No focus handler opens the wizard; URL `lang` alone is not an auto-open trigger, but this criterion has no recorded manual result. |
| 3.2.2 | On input | Not tested | Nothing changes context until Next is pressed. No test or co-designer evidence is recorded in this delivery. |
| 3.2.6 | Consistent help | Not tested | No test or co-designer evidence is recorded in this delivery. |
| 3.3.1 | Error identification | Not tested | Plain text error next to the field; focus returns to it. No test or co-designer evidence is recorded in this delivery. |
| 3.3.2 | Labels or instructions | Not tested | No test or co-designer evidence is recorded in this delivery. |
| 3.3.3 | Error suggestion | Not tested | Errors say how to fix (e.g. example phone number). No test or co-designer evidence is recorded in this delivery. |
| 3.3.7 | Redundant entry | Not tested | Answers are autosaved and restored on resume. No test or co-designer evidence is recorded in this delivery. |
| 3.3.8 | Accessible authentication (minimum) | Not tested | Password field allows paste and password managers; no cognitive test. Show-password option. No test or co-designer evidence is recorded in this delivery. |
| 4.1.2 | Name, role, value | Not tested | No test or co-designer evidence is recorded in this delivery. |
| 4.1.3 | Status messages | Not tested | Settings announcements use `role=status`; the offer banner is deliberately a `role=region`, not a live region, so its announcement behavior is not established. E2E tests were not run. |

## Additional evidence and limits for the requested criteria

The following statuses are deliberately **Not tested**: source code and test assertions are not evidence that the tests passed. `npm test` and `npm run test:e2e` were not run for this delivery, and no new co-designer observations were supplied. The e2e files mentioned in the evidence column are planned checks only.

## README claims not verifiable from source inspection

- The exact external processing destination for audio used by the browser's Web Speech Recognition implementation (for example, whether a particular Chrome version sends audio to Google) cannot be established from this application code. The app calls the browser API; the browser/provider controls its processing.
- The general statement that many Android phones lack an Amharic speech voice cannot be verified for every device, OS version, browser, or installed voice pack from this repository. The claim that recorded prompts are a reliable substitute also needs device testing; the supplied audio folders contain only `.gitkeep` placeholders.
- Whether Amharic strings have received native-speaker review is a human review status and cannot be determined from source code.
- A successful co-designer task on NVDA, TalkBack, keyboard-only operation, or 200% zoom cannot be claimed until those sessions are observed and logged.
- The README's "Quick start (about 5 minutes)" estimate and Docker claim (same URLs) have not been timed or exercised in this delivery.
- The README's aspirational install-time checklist ("a stranger can install it ... in under an hour") is not a measured result.

The earlier broad privacy wording has been narrowed in the README: local needs-detection signals and reason codes do not leave the browser, while browser speech-recognition processing remains under the browser/provider's control.

## Known issues and limitations

_Be honest here. Judges value an accurate report more than a perfect one._

- _Example: Amharic read-aloud depends on recorded audio files; browsers on many phones have no Amharic voice._
- _Example: voice typing needs an internet connection and is not available in all browsers._

## Sign-off

Tested by: _names_   Co-designer: _name_   Date: _date_
