# WCAG 2.2 AA Conformance Report – Accessible Onboarding Wizard

**Product:** Digital Bridge accessible login & registration wizard (Track 1)
**Version / commit:** _fill in_
**Date tested:** _fill in_
**Team:** _fill in_

## How we tested

| Method | Tool / version | Who | Result |
|---|---|---|---|
| Automated | axe-core (`npm run test:e2e`) | CI / team | _0 critical, 0 serious?_ |
| Keyboard only | Chrome | _name_ | |
| Screen reader (desktop) | NVDA _version_ + Firefox/Chrome | _co-designer_ | |
| Screen reader (mobile) | TalkBack _Android version_ | _co-designer_ | |
| Zoom 200% / reflow at 320px | Chrome | | |
| Sound off (no audio-only information) | | | |

Co-designer task: _"Register an account, then log in and open the job list, unaided."_ Result: _completed / not completed, time taken_.

## Criteria

Status: **Supports**, **Partially supports**, **Does not support**, **Not applicable**. Replace every `_todo_` with a real result and one line of evidence (a test, a screenshot, or a co-designer observation). The list below covers the criteria most relevant to a form widget. Before submitting, check the remaining WCAG 2.2 A/AA criteria against <https://www.w3.org/TR/WCAG22/> and add rows for any that apply.

| SC | Name | Status | Evidence / notes |
|---|---|---|---|
| 1.1.1 | Non-text content | _todo_ | Icons are `aria-hidden`; every control has a text name. |
| 1.3.1 | Info and relationships | _todo_ | Radio/checkbox groups use `role=radiogroup/group` labelled by the question heading; errors linked with `aria-describedby`. |
| 1.3.2 | Meaningful sequence | _todo_ | |
| 1.3.5 | Identify input purpose | _todo_ | `autocomplete` on name, username, new-password. |
| 1.4.1 | Use of colour | _todo_ | Errors have a ⚠ icon and text, not just red. |
| 1.4.3 | Contrast (minimum) | _todo_ | Palette in `styles.css` comments lists ratios; verify. |
| 1.4.4 | Resize text | _todo_ | |
| 1.4.10 | Reflow | _todo_ | Test at 320 CSS px / 400% zoom. |
| 1.4.11 | Non-text contrast | _todo_ | Input and option borders `#5c5c5c`. |
| 1.4.12 | Text spacing | _todo_ | |
| 1.4.13 | Content on hover or focus | _todo_ | No hover-only content. |
| 2.1.1 | Keyboard | _todo_ | `e2e/a11y.spec.js` completes registration with keyboard only. |
| 2.1.2 | No keyboard trap | _todo_ | |
| 2.2.1 | Timing adjustable | _todo_ | No time-outs anywhere in the wizard. |
| 2.4.3 | Focus order | _todo_ | Focus moves to the question heading on each step. |
| 2.4.6 | Headings and labels | _todo_ | |
| 2.4.7 | Focus visible | _todo_ | |
| 2.4.11 | Focus not obscured (minimum) | _todo_ | Check on a phone with the on-screen keyboard open. |
| 2.5.3 | Label in name | _todo_ | |
| 2.5.7 | Dragging movements | _todo_ | No dragging used. |
| 2.5.8 | Target size (minimum) | _todo_ | Controls ≥ 44px. |
| 3.1.1 | Language of page | _todo_ | Widget root carries `lang`. |
| 3.1.2 | Language of parts | _todo_ | Language switcher options carry their own `lang`. |
| 3.2.1 / 3.2.2 | On focus / on input | _todo_ | Nothing changes context until Next is pressed. |
| 3.2.6 | Consistent help | _todo_ | |
| 3.3.1 | Error identification | _todo_ | Plain text error next to the field; focus returns to it. |
| 3.3.2 | Labels or instructions | _todo_ | |
| 3.3.3 | Error suggestion | _todo_ | Errors say how to fix (e.g. example phone number). |
| 3.3.7 | Redundant entry | _todo_ | Answers are autosaved and restored on resume. |
| 3.3.8 | Accessible authentication (minimum) | _todo_ | Password field allows paste and password managers; no cognitive test. Show-password option. |
| 4.1.2 | Name, role, value | _todo_ | |
| 4.1.3 | Status messages | _todo_ | `role=status` live regions for saves and voice typing. |

## Known issues and limitations

_Be honest here. Judges value an accurate report more than a perfect one._

- _Example: Amharic read-aloud depends on recorded audio files; browsers on many phones have no Amharic voice._
- _Example: voice typing needs an internet connection and is not available in all browsers._

## Sign-off

Tested by: _names_   Co-designer: _name_   Date: _date_
