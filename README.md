# Wheel of Success

A responsive word-guessing game made with vanilla JavaScript, modern Sass, and Vite. Choose a difficulty, guess letters using the on-screen or physical keyboard, and try to build a new winning streak.

## Play the game

1. Choose a difficulty: **Easy** has a 3-letter word, **Medium** a 6-letter word, and **Hard** a 9-letter word.
2. Choose a life icon and one of three color themes (Classic, Dark, or Neon).
3. Guess letters with your mouse, touch screen, or physical A–Z keys. Each incorrect guess costs one of your five lives. Repeated letters are revealed together.
4. Win by revealing the entire word. Lose after five missed lives. From the results, start another round or return to setup.

**Hard mode** is intentionally challenging: you have 25 seconds, and every five seconds costs an additional life, on top of incorrect guesses. Easy and Medium have no timer.

The results show your **Streak** (the number of consecutive wins reached in the completed run) and **Best streak** for the current difficulty. Playing again after a win continues your streak. A loss or returning home resets the active streak, not the best score.

## Run locally

You'll need a Node.js version supported by the Vite version listed in `package.json` (Vite 8 requires Node 20.19+ or 22.12+).

```bash
npm install
npm run dev
```

Open the URL printed in the terminal. To check the automated tests and production build:

```bash
npm test
npm run build
npm run preview
```

Open the served site, not `index.html` through `file://`, because Vite processes the SCSS and JavaScript modules. Do not commit `node_modules` or `dist` to Git.

The Vite configuration uses relative asset paths so the generated site can be hosted from a repository subdirectory, such as GitHub Pages.

## Features

- Random words selected by difficulty with the [Random Word API](https://random-word-api.herokuapp.com/).
- Definition hints fetched asynchronously from [Datamuse](https://www.datamuse.com/api/). Missing hints never block play.
- Built-in word fallback if the word API fails, times out, or returns an unsuitable word. The game remains usable without the service.
- Mouse, touch, and physical-keyboard input; previously guessed keys show a correct/incorrect indicator and cannot be counted twice.
- Per-difficulty current and best streaks stored locally, and a saved theme preference. Storage-denied browsers can still play.
- Hard-mode countdown with life penalties every five seconds.
- Responsive word tiles and controls, keyboard focus indicators, screen-reader status updates, and reduced-motion-aware letter reveals.

## How it works

`index.html` provides the setup dialog, game display, and win/loss templates. `js/app.js` initializes the theme and application. `js/game/` contains the game controller, rules, word and definition services, timer, and streak storage. `js/components/` contains small DOM-focused modules for the word, keyboard, and lives. `scss/` contains the base, layout, theme, and component stylesheets using Sass modules. `tests/` contains automated Node tests.

The game selects a word before enabling controls and fetches the optional definition separately. Pending requests are cancelled or ignored when the player changes rounds. The countdown only runs during an active Hard round.

No API keys or production npm dependencies are required. Vite and Sass are development/build dependencies; audit any package advisories before updating them.

## Accessibility and testing

The game includes descriptive form controls, high-contrast themes, live guess feedback, keyboard-operable dialogs, visible focus, and screen-reader-safe masked letters. Used letter buttons are `aria-disabled` and removed from sequential Tab navigation, but may still receive programmatic focus so physical typing highlights the corresponding letter. JavaScript prevents them from being activated twice.

The theme palette was checked against the WCAG AA text and interface-component contrast thresholds. The game has also been checked in an automated Chromium browser flow at 320px, 375px, 768px and 1280px and with reduced-motion enabled. See [QA checklist](docs/quality-assurance.md) and [accessibility notes](docs/accessibility-review.md). These checks are **not** a claim of full WCAG 2.2 AA conformance; complete manual screen-reader, browser, zoom, and timing review is still important.

## Project credits

Game concept and assignment requirements: Treehouse Game Show App. This implementation uses vanilla JavaScript and an independently organized SCSS architecture.

Development assistance: ChatGPT contributed architecture suggestions, implementation code, and testing scaffolding. The project owner is responsible for reviewing the code, running local checks, and verifying the finished experience.
