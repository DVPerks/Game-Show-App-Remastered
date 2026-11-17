import { isLetterKey, getLetterPositions, MAX_MISSES } from './gameRules.js';
import { getWordForRound } from './wordService.js';
import { fetchDefinition } from './definitionService.js';
import { createStreakTracker } from './streakStorage.js';
import { createHardModeTimer, HARD_MODE_SECONDS } from './hardModeTimer.js';
import { addWordToDisplay, checkLetter, clearWordDisplay } from '../components/wordDisplay.js';
import { resetLives, removeLife } from '../components/scoreboard.js';
import { resetKeyboard, getLetterButton, isKeyAvailable, markKeyChosen, focusGuessedKey } from '../components/keyboard.js';

function getStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}

/** Connect the game rules, async services, and accessible views. */
export function initializeGameController() {
  const overlay = document.querySelector('#overlay');
  const setupScreen = document.querySelector('#setup-screen');
  const loadingScreen = document.querySelector('#loading-screen');
  const resultScreen = document.querySelector('#result-screen');
  const setupForm = document.querySelector('#setup-form');
  const game = document.querySelector('#game-content');
  const keyboard = document.querySelector('#qwerty');
  const wordList = document.querySelector('#word ul');
  const scoreboard = document.querySelector('#scoreboard');
  const gameStatus = document.querySelector('#game-status');
  const hintText = document.querySelector('#definition p');
  const timer = document.querySelector('#timer');
  const timerText = document.querySelector('#timer-countdown');
  const timerProgress = document.querySelector('#timer-progress');
  const homeButton = document.querySelector('#game-home');
  const streaks = createStreakTracker(getStorage());

  let gameState = 'setup';
  let word = '';
  let difficulty = 'easy';
  let lifeIcon = 'Heart';
  let missed = 0;
  let roundController = null;
  let roundId = 0; // Ignore a response if the player has already left that round.
  const previousWords = { easy: '', medium: '', hard: '' };

  function updateTimerDisplay(seconds) {
    timerText.textContent = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
    timerProgress.value = seconds;
    timer.classList.toggle('timer--urgent', seconds <= 10);
  }

  const hardTimer = createHardModeTimer({
    onTick: updateTimerDisplay,
    onPenalty: (seconds) => {
      if (gameState !== 'playing' || difficulty !== 'hard') return;
      missed = removeLife(scoreboard, missed, lifeIcon);
      const livesLeft = MAX_MISSES - missed;
      gameStatus.textContent = `Five seconds elapsed: one life lost. ${livesLeft} ${livesLeft === 1 ? 'life' : 'lives'} remaining. ${seconds} seconds left.`;
      checkWin();
    },
    onExpire: () => {
      // Defensive fallback: the normal fifth penalty ends the game at 0 seconds.
      if (gameState === 'playing') finishGame('lost');
    },
  });

  function cancelPendingRequests() {
    hardTimer.stop();
    roundId += 1;
    roundController?.abort();
    roundController = null;
  }

  function showGame() {
    game.inert = false;
    game.removeAttribute('aria-hidden');
    overlay.hidden = true;
    keyboard.querySelector('button:not(:disabled)')?.focus();
  }

  function showOverlay(screen) {
    overlay.hidden = false;
    setupScreen.hidden = screen !== 'setup';
    loadingScreen.hidden = screen !== 'loading';
    resultScreen.hidden = screen !== 'result';

    // Move focus before making the game inert and hidden from screen readers.
    if (screen === 'setup') {
      overlay.classList.remove('win', 'lose');
      overlay.classList.add('start');
      overlay.setAttribute('aria-labelledby', 'game-title');
      overlay.setAttribute('aria-describedby', 'setup-intro');
      document.querySelector('#difficulty').focus();
    } else if (screen === 'loading') {
      overlay.classList.remove('win', 'lose');
      overlay.classList.add('start');
      overlay.setAttribute('aria-labelledby', 'loading-title');
      overlay.setAttribute('aria-describedby', 'loading-description');
      document.querySelector('#loading-title').focus();
    } else {
      overlay.setAttribute('aria-labelledby', 'result-title');
      overlay.setAttribute('aria-describedby', 'result-summary');
      resultScreen.querySelector('#result-title').focus();
    }
    game.inert = true;
    game.setAttribute('aria-hidden', 'true');
  }

  async function fetchAndShowDefinition(selectedWord, currentRound, signal) {
    const hint = await fetchDefinition(selectedWord, { signal });
    if (roundId !== currentRound || gameState !== 'playing' || signal.aborted) return;
    hintText.textContent = hint ?? 'No definition is available for this word. Keep guessing!';
  }

  /** Start a round only after a validated word (or safe offline fallback) arrives. */
  async function beginGame(keepSettings = false) {
    if (gameState === 'loading') return;
    if (!keepSettings) {
      difficulty = document.querySelector('#difficulty').value;
      lifeIcon = document.querySelector('#lifeicon').value;
    }

    cancelPendingRequests();
    const controller = new AbortController();
    roundController = controller;
    const currentRound = roundId;
    gameState = 'loading';
    showOverlay('loading');

    try {
      const selection = await getWordForRound(difficulty, previousWords[difficulty], {
        signal: controller.signal,
      });
      if (roundId !== currentRound || gameState !== 'loading' || controller.signal.aborted) return;

      word = selection.word;
      previousWords[difficulty] = word;
      missed = 0;
      gameState = 'playing';
      resetKeyboard(keyboard);
      resetLives(scoreboard, lifeIcon);
      addWordToDisplay([...word], wordList);
      hintText.textContent = 'Looking up a definition hint…';
      timer.hidden = difficulty !== 'hard';
      updateTimerDisplay(HARD_MODE_SECONDS);
      gameStatus.textContent = `${word.length}-letter ${difficulty} word ready. Guess using the on-screen or physical keyboard.`;
      showGame();
      // Start only once the game is visible; Easy and Medium never run a timer.
      if (difficulty === 'hard') hardTimer.start();

      // Fetch the optional hint independently: gameplay doesn't wait for Datamuse.
      void fetchAndShowDefinition(word, currentRound, controller.signal).catch(() => {
        // A cancelled or failed hint request should not affect an active round.
        if (roundId === currentRound && gameState === 'playing' && !controller.signal.aborted) {
          hintText.textContent = 'The definition hint could not be loaded. Keep guessing!';
        }
      });
    } catch (error) {
      if (controller.signal.aborted || roundId !== currentRound) return;
      // Unexpected errors should return to setup rather than leave a stuck dialog.
      gameState = 'setup';
      showOverlay('setup');
      const notice = document.querySelector('#setup-error');
      notice.hidden = false;
      notice.textContent = 'Unable to start a game. Please try again.';
      console.error('Unable to start game', error);
    }
  }

  function checkWin() {
    if (gameState !== 'playing') return;
    const total = wordList.querySelectorAll('li.letter').length;
    const revealed = wordList.querySelectorAll('li.letter.show').length;
    if (total > 0 && revealed === total) {
      finishGame('won');
    } else if (missed >= MAX_MISSES) {
      finishGame('lost');
    }
  }

  function handleInteraction(button) {
    if (gameState !== 'playing' || !isKeyAvailable(button) || !keyboard.contains(button)) return;

    const guess = button.textContent.trim().toLowerCase();
    if (!isLetterKey(guess)) return;
    const match = checkLetter(guess, wordList);
    markKeyChosen(button, match !== null);

    if (match === null) {
      missed = removeLife(scoreboard, missed, lifeIcon);
      gameStatus.textContent = `No ${guess.toUpperCase()}. ${MAX_MISSES - missed} ${MAX_MISSES - missed === 1 ? 'life' : 'lives'} remaining.`;
    } else {
      const positions = getLetterPositions(word, guess);
      const revealed = wordList.querySelectorAll('li.letter.show').length;
      gameStatus.textContent = `Correct! ${guess.toUpperCase()} appears at ${positions.length === 1 ? 'position' : 'positions'} ${positions.join(', ')}. ${revealed} of ${word.length} letters revealed.`;
    }

    checkWin();
    // Follow the actual guessed letter for both on-screen and physical inputs.
    // Used buttons remain script-focusable but cannot activate again.
    if (gameState === 'playing') focusGuessedKey(button);
  }

  function finishGame(outcome) {
    if (gameState !== 'playing') return;
    gameState = outcome;
    cancelPendingRequests(); // Prevent late hints from changing completed rounds.
    for (const button of keyboard.querySelectorAll('button')) button.disabled = true;

    const stats = streaks.recordResult(difficulty, outcome);
    const template = document.querySelector(`#${outcome === 'won' ? 'win' : 'lose'}-screen-template`);
    resultScreen.replaceChildren(template.content.cloneNode(true));
    resultScreen.querySelector('[data-result-word]').textContent = word.toUpperCase();
    resultScreen.querySelector('[data-streak="current"]').textContent = String(stats.streakAtResult);
    resultScreen.querySelector('[data-streak="best"]').textContent = String(stats.best);
    resultScreen.querySelector('.result-streaks').hidden = false;
    resultScreen.querySelector('[data-streak-difficulty]').textContent = difficulty;
    overlay.classList.remove('start', 'win', 'lose');
    overlay.classList.add(outcome === 'won' ? 'win' : 'lose');
    showOverlay('result');
  }

  function returnHome() {
    cancelPendingRequests();
    // Home ends this difficulty's win streak, while preserving its high score.
    streaks.resetCurrent(difficulty);
    gameState = 'setup';
    missed = 0;
    word = '';
    resetKeyboard(keyboard, false);
    resetLives(scoreboard, 'Heart');
    clearWordDisplay(wordList);
    gameStatus.textContent = 'Choose a difficulty to begin.';
    hintText.textContent = 'A definition hint appears here after you start a game.';
    timer.hidden = true;
    timer.classList.remove('timer--urgent');
    updateTimerDisplay(HARD_MODE_SECONDS);
    resultScreen.replaceChildren();
    showOverlay('setup');
  }

  // Modal dialog keyboard containment, including the async loading screen.
  overlay.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || overlay.hidden) return;
    const visibleScreen = [setupScreen, loadingScreen, resultScreen].find((screen) => !screen.hidden);
    const focusables = [...visibleScreen.querySelectorAll('button:not(:disabled), select:not(:disabled), input:not(:disabled), a[href]')];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !focusables.includes(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !focusables.includes(active))) {
      event.preventDefault();
      first.focus();
    }
  });

  setupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('#setup-error').hidden = true;
    void beginGame();
  });
  document.querySelector('#loading-cancel').addEventListener('click', returnHome);

  keyboard.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button && keyboard.contains(button)) handleInteraction(button);
  });

  document.addEventListener('keydown', (event) => {
    if (gameState !== 'playing' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!isLetterKey(event.key)) return;
    const target = event.target;
    if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const button = getLetterButton(keyboard, event.key.toLowerCase());
    if (!isKeyAvailable(button)) return;
    event.preventDefault();
    handleInteraction(button);
  });

  resultScreen.addEventListener('click', (event) => {
    if (event.target.closest('.btn_reset')) void beginGame(true);
    else if (event.target.closest('.btn_home')) returnHome();
  });
  homeButton.addEventListener('click', returnHome);

  resetKeyboard(keyboard, false);
  clearWordDisplay(wordList);
}
