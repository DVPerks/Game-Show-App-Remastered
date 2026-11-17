import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resetKeyboard,
  getLetterButton,
  isKeyAvailable,
  markKeyChosen,
  focusGuessedKey,
} from '../js/components/keyboard.js';

function createButton(letter) {
  const attributes = new Map();
  const classes = new Set();
  return {
    textContent: letter,
    disabled: false,
    tabIndex: 0,
    dataset: {},
    classList: {
      add: (value) => classes.add(value),
      remove: (value) => classes.delete(value),
      contains: (value) => classes.has(value),
    },
    setAttribute: (name, value) => attributes.set(name, String(value)),
    getAttribute: (name) => attributes.get(name) ?? null,
    removeAttribute: (name) => attributes.delete(name),
    focus: (options) => { thisFocus.options = options; },
  };
}

const thisFocus = { options: null };

test('a chosen key remains focusable but cannot be guessed a second time', () => {
  const button = createButton('a');
  assert.equal(isKeyAvailable(button), true);
  markKeyChosen(button, true);
  assert.equal(button.disabled, false);
  assert.equal(button.getAttribute('aria-disabled'), 'true');
  assert.equal(button.tabIndex, -1);
  assert.equal(button.classList.contains('chosen'), true);
  assert.equal(button.getAttribute('aria-label'), 'A, correct guess, already used');
  assert.equal(isKeyAvailable(button), false);

  focusGuessedKey(button);
  assert.deepEqual(thisFocus.options, { preventScroll: true });
});

test('keyboard reset removes old results and restores a usable key', () => {
  const a = createButton('a');
  const b = createButton('b');
  const keyboard = { querySelectorAll: () => [a, b] };
  markKeyChosen(a, false);
  resetKeyboard(keyboard);
  assert.equal(isKeyAvailable(a), true);
  assert.equal(a.getAttribute('aria-disabled'), null);
  assert.equal(a.getAttribute('data-result'), null);
  assert.equal(a.tabIndex, 0);
  assert.equal(a.getAttribute('aria-label'), 'Guess A');
  assert.equal(a.classList.contains('chosen'), false);
  assert.equal(getLetterButton(keyboard, 'b'), b);
  resetKeyboard(keyboard, false);
  assert.equal(isKeyAvailable(a), false);
  assert.equal(isKeyAvailable(b), false);
});

test('a focused used key cannot be guessed again even if clicked', () => {
  const key = createButton('c');
  markKeyChosen(key, false);
  assert.equal(isKeyAvailable(key), false);
  assert.equal(key.getAttribute('aria-label'), 'C, incorrect guess, already used');
});
