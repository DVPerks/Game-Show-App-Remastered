# Phase 3 QA checklist

This phase uses public APIs; test from `npm run dev` using browser Developer Tools. Do not depend solely on automated tests.

## Baseline

- [ ] `npm test` succeeds (19 tests), and `npm run build` generates a working site.
- [ ] Start Easy, Medium, and Hard; lengths are respectively 3, 6, and 9, letters only.
- [ ] On a working network, inspect the **Network** tab: Random Word API requests contain `length=3/6/9&diff=1` and Datamuse requests include `md=d`.
- [ ] The loading dialog appears while fetching. Start controls cannot be used to submit duplicate requests.
- [ ] After starting, a definition eventually appears, or an appropriate no-definition message appears. The definition should not expose the answer.
- [ ] Correct/repeated letters, keyboard clicks, physical keys, remaining lives, and win/loss work as before.
- [ ] Hard is **untimed** during Phase 3; the 25-second countdown comes in Phase 4.

## Streak persistence

- [ ] Win once on Easy: result shows Streak 1 and Best streak 1. Play again and win: 2/2.
- [ ] Play again and lose: results still show the completed **Streak 2**, while `currentStreak_easy` in storage is now `0`; Best streak remains 2.
- [ ] Try again after that loss: the next run starts at 0; winning then shows Streak 1 and Best streak 2.
- [ ] Win, then select Home: `currentStreak_easy` becomes `0`, while `bestStreak_easy` remains intact.
- [ ] Begin Medium and return Home before finishing: its active streak resets to 0, not its high score.
- [ ] Check Application > Local Storage for `currentStreak_easy`, `bestStreak_easy`, etc.
- [ ] Reload the page and finish another round: stats continue from saved values; colors/theme persist too.
- [ ] Streak counters remain independent between Easy, Medium and Hard.

## Failure paths

- [ ] Once the app has loaded, simulate the Random Word API failing (DevTools request blocking or offline mode). Starting a game still chooses a built-in word and announces the fallback.
- [ ] Simulate Datamuse failing: the word game remains playable, and a neutral hint message appears.
- [ ] Try cancelling while the loading dialog is open (you can throttle the network). Setup returns without a late game appearing.
- [ ] Navigate Home before a hint arrives. A late result must not alter a later round.
- [ ] Disable storage in the browser: gameplay and streaks still work within that page (they won't persist across reload).

## Accessibility / responsive checks

- [ ] Use Tab / Shift+Tab on setup, loading and results. Focus remains within the active dialog, and opening/closing screens places focus usefully.
- [ ] Test physical keyboard guesses, used-button labels, and announcements for lives, hint and win/loss with NVDA/VoiceOver.
- [ ] Test Classic/Dark/Neon focus and contrast, 320px mobile, 200% zoom, 400% reflow, and reduced-motion mode.
- [ ] Check Chrome, Firefox and Safari where available. Inspect the console for uncaught errors.
