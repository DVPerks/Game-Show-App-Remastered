# Quality assurance checklist

## Verified in this release

- [x] Node tests for gameplay rules, API parsing/fallback, request cancellation, definitions, streak persistence, timer events, and keyboard used-key semantics.
- [x] Simulated browser tests for mouse/physical guesses, focus on the guessed key, repeat-guess prevention, win/loss results, home/replay, and per-difficulty streaks.
- [x] Controlled-clock tests for Hard mode's 25 seconds, every-five-second life penalty, combined penalties, and timer cleanup.
- [x] Browser layout checked at 320, 375, 768 and 1280 CSS pixels, plus reduced-motion behavior.
- [x] Manual color-token calculations for three themes (see `contrast-report.md`).

## Local release checks

- [ ] Run `npm install`, `npm test`, and `npm run build` in the repository.
- [ ] Confirm actual Random Word and Datamuse API responses, including a missing definition.
- [ ] Reload the site and confirm theme and best streak persist.
- [ ] Use DevTools offline mode; confirm the local fallback starts a playable round.
- [ ] Test keyboard shortcuts, Tab/Shift+Tab, dialog focus, and used-letter behavior with **NVDA/VoiceOver** (and without a screen reader).
- [ ] Test 200–400% browser zoom, 320px reflow, narrow-landscape mobile and text enlargement.
- [ ] In Classic, Dark and Neon themes, open each setup dropdown (Difficulty, Life icons, Theme), hover or arrow through every option, and check that the highlighted text remains readable. Native popup appearance can vary by browser and operating system.
- [ ] Try Chrome, Firefox and Safari (where available) and touch devices.
- [ ] Run an automated checker such as axe or Lighthouse and review any reported issues manually.
- [ ] Evaluate the Hard time-limit behavior against WCAG 2.2 criterion 2.2.1; untimed alternative difficulties exist but do not alone prove conformity.

## Useful interaction scenarios

1. Type a letter with the physical keyboard and verify focus moves to **that** virtual key, not Q. The key should show its result and not accept another guess.
2. After focusing a used key, Tab should go to the next still-available control.
3. Choose a repeated letter (for example, both `a`s in `banana`) and confirm all occurrences appear.
4. Win twice, then lose: the result should display the streak of 2, and the next round should start a new run while the best score remains 2.
5. In Hard mode, test wrong guesses just before an automatic life loss, then Home, replay, and winning early. No timer should continue after leaving the round.
6. Confirm no horizontal page overflow at small viewport widths, including the 9-letter word layout.
