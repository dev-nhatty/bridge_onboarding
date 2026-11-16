# Co-designer log

Co-designers hold 30 of the 100 points, and the panel includes two of them. This log is your evidence.
Add a row every time your co-designer tests (their own phone, their own screen reader, their own settings).

**Co-designer:** _name (and how they like to be credited)_
**Device / assistive tech:** _e.g. Android 12 + TalkBack, NVDA on laptop, switch access…_

| Time | What they tried | What happened (their words) | What we changed |
|---|---|---|---|
| Sat 10:00 | Meet, ask what they need | | |
| Sat 13:00 | First test: wizard steps 1–3 | | |
| | | | |

## Final test (Sunday, at the gate)

Task: register, log in, open jobs, **unaided**, with NVDA, TalkBack, keyboard only, 200% zoom, sound off.

| Setup | Completed unaided? | Notes |
|---|---|---|
| NVDA | | |
| TalkBack | | |
| Keyboard only | | |
| 200% zoom | | |
| Sound off | | |

Co-designer score / quote: _…_


## New features – co-designer test script

Run the steps with NVDA on a desktop browser, TalkBack on an Android device, keyboard only, and at 200% zoom. Record what actually happens in the **Observed** column; do not fill it from expectations. Use a test account and a private test browser profile.

| Step | Try this | Expected result | Observed |
|---|---|---|---|
| a. Skip button | Load the demo page, press Tab once, then press Enter. | The first Tab focuses **Open the accessible step-by-step registration**; Enter opens the wizard. Focus returns to the skip button after closing the dialog. | |
| b. Accessibility settings on every screen | Open the wizard. Check settings on the first question, a middle question, the login screen, and the completed-registration screen. | The Accessibility settings control is available on each screen and opens the settings panel without discarding the current screen or answers. | |
| c. Change text size and contrast mid-registration | Enter a name, move to the next question, open settings, choose a larger text size and high contrast, then close settings. | Text size and contrast update immediately; the wizard stays on the same question and the previously entered name remains. | |
| d. Offer banner and dismissal | When the host page displays the registration-help banner, read it with the screen reader, activate **No thanks**, and reload the same tab. | The banner gives a neutral offer without stating a reason. Dismissal hides it for the rest of that tab session; a separate tab can show it again. | |
| e. Inline chooser | Expand **Not sure what you need? Choose how we can help**. Try each of the four cards using keyboard activation. | The four choices open the wizard with the advertised read-aloud, simple wording, larger/high-contrast, or Amharic preset. At 200% zoom and narrow width, the chooser remains usable without horizontal scrolling. | |
| f. Remember settings on this device | Open Accessibility settings, select **Remember settings**, change a preference, reload the page, and reopen settings. | The selected accessibility preferences are restored on this device. The shared-computer warning is understood; unchecking Remember settings clears the saved preference record. | |

