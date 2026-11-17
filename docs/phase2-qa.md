# Phase 2 validation and manual QA

## Automated checks (completed in this environment)

- `node --test tests/*.test.js`: 6 passing tests.
- Isolated Chromium interaction harness executed the original application JavaScript (ES-module imports flattened only for the harness) with an approximated, concatenated stylesheet. Verified:
  - Easy/Medium/Hard word lengths (3/6/9), enabled keyboard, inaccessible background while overlay open.
  - Correct letter display, live feedback, guessed-key lockout, and repeated-letter handling.
  - Incorrect guess deducts exactly one life; guessing the same incorrect letter again does not deduct another.
  - Five misses produce loss; guessing the answer produces win; results display the word.
  - Reset/replay uses the same selected difficulty and icon, restores all lives and key availability, and avoids an immediate repeated word.
  - Home from results and in-progress game restores setup and leaves the game inert.
  - Result headings receive focus. Tab/Shift+Tab wrap inside the setup and results dialogs.
  - No horizontal overflow with a hard word at viewport widths 320px, 375px, 768px, and 1280px; also checked setup at 320px and 375px.
- Checked that every game controller import resolves and the JavaScript parses.

**Limitations:** The harness is not a real Vite/Sass production build. Local npm package install was prevented by unavailable DNS for the registry. Images were not rendered in the harness because direct browser navigation/network requests were restricted. Run the application and inspect the real PNGs on your local machine.

## Manual verification for the project author

1. Run `npm install`, `npm test`, `npm run dev`, and `npm run build`; fix any compilation errors.
2. Use each of the four life-icon sets, checking that live/lost images render and the last miss swaps exactly the fifth image.
3. Test Easy/Medium/Hard with both keyboard and pointer. Confirm letter keys, repeated guesses, and arrow/number/control keys behave as expected.
4. Win by revealing all unique letters; lose with five wrong guesses; use both buttons on both results screens. Check keyboard focus and status announcements.
5. Inspect Classic, Dark and Neon themes, including both results backgrounds, focus rings and selected-key markers.
6. At 320px / 375px and with 200% browser zoom, confirm the keyboard and nine-letter word do not clip or cause unwanted sideways scrolling.
7. Test in Chrome plus Firefox or Edge, and optionally Safari. Manually check with NVDA (Windows) or VoiceOver (macOS/iOS).
8. Verify that screen readers cannot read unrevealed answer letters; they should hear hidden positions in the word list's accessible name and specific guessed-letter feedback.
9. Verify the modal prevents focus from leaving the visible dialog and the game remains inaccessible when setup or results is displayed.
10. Note that Phase 3's API hints/streaks and Phase 4's Hard timer are intentionally absent; do not mark them complete.

## Results background contrast

Measured the defined `--overlay-text` against `--win-bg` and `--lose-bg` with the WCAG relative-luminance formula. Each pairing is above 4.5:1.

| Theme | Win background | Lose background |
|---|---:|---:|
| Classic | 7.46:1 | 7.49:1 |
| Dark | 9.33:1 | 9.21:1 |
| Neon | 7.69:1 | 8.34:1 |

These are color-token pair calculations, not a full WCAG audit or a screen-reader certification.
