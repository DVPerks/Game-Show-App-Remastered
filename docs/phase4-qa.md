# Phase 4 QA checklist — Timed Hard mode and letter animations

Phase 4 builds on the existing Phase 3.1 word service, hint service, themed setup, and streak tracking. Run this from the Vite dev server, not by opening the HTML file directly.

## Local setup

```bash
npm install
npm test
npm run dev
npm run build
```

- [ ] `npm test` passes 26 tests.
- [ ] `npm run build` succeeds and `npm run preview` shows the game without console errors.
- [ ] Use DevTools Network to verify live Random Word API and Datamuse responses; those requests were **mocked** in the automated browser tests.

## Timer behavior (Hard only)

- [ ] Setup describes Easy and Medium as untimed; neither displays the timer or schedules time penalties.
- [ ] Hard setup describes a 25-second timer. The countdown appears at **25 seconds** only after the word is ready, not while the loading dialog is fetching it.
- [ ] At 21 seconds remaining, all five lives still remain if you have not guessed incorrectly.
- [ ] At 20 seconds remaining, exactly one life is lost. Repeat at 15, 10, 5, and 0 if still playing.
- [ ] The native progress bar and numerical countdown update together; at <=10 seconds, the countdown is underlined as a secondary urgency cue.
- [ ] Incorrect guesses deduct lives as usual in addition to timer deductions; guessing an already chosen letter cannot double-charge a life.
- [ ] When the fifth life is deducted, the **Game over** result appears once. All timing stops immediately; no more lives or results change afterward.
- [ ] Finish the word before the deadline. The win screen appears once and the timer stops.
- [ ] Press **Play again** or **Try again**. The next Hard game starts over at 25 seconds with five lives and a new word, without an extra/old timer running.
- [ ] Return Home while the Hard timer is active. Timer stops and hides. Starting Easy/Medium afterward never starts the Hard timer.
- [ ] Test several Hard rounds in a row to confirm elapsed time never carries over.

## Accessibility and responsive behavior

- [ ] All modes can be operated by on-screen buttons and physical A–Z keys.
- [ ] The countdown text is visible and labelled; the bar is supplemental and never conveys remaining time by color alone.
- [ ] Use NVDA/VoiceOver to verify a five-second penalty announces remaining lives via the game status region. Seconds should **not** be announced continuously.
- [ ] Try reduced-motion OS settings and ensure letter reveals do not animate noticeably. With motion enabled, revealed tiles briefly lift/scale once.
- [ ] Test Classic, Dark, and Neon themes and confirm focus remains visible.
- [ ] Check at 320, 375, 768 and 1280px widths, plus 200% zoom and 400% reflow; verify no horizontal overflow.
- [ ] Test actual Chrome, Firefox, and Safari if possible, including switching tabs during a countdown. Browser background scheduling may throttle timer ticks; investigate if precise wall-clock timing becomes a requirement.
- [ ] WCAG 2.2 AA has **not** been fully certified. In particular, revisit whether the Hard-only time challenge is an essential-timing exception under WCAG 2.2 SC 2.2.1 and document the final decision for submission.

## Automated checks executed in this coding workspace

- 26 Node unit tests passed, including 5 isolated timer tests for 25-second countdown, five-second penalties, stop on finish, replay reset, and invalid settings.
- A Chromium browser harness with mocked fetch and controlled intervals passed Hard/Easy/Medium, combined wrong guesses/time, time-only loss, win stoppage, replay, Home, streak snapshot, focus, reduced motion, and responsive checks at 320–1280px.
- The browser preview styles are a direct assembly of SCSS declarations, not a Vite/Sass production build. Dependencies were unavailable for a Vite production compile in this workspace; run the local build before committing.
