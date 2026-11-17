/** Reset all letters for a new round (or make the keyboard inert at home). */
export function resetKeyboard(keyboard, enabled = true) {
  for (const button of keyboard.querySelectorAll('button')) {
    button.disabled = !enabled;
    button.classList.remove('chosen');
    button.removeAttribute('data-result');
    button.removeAttribute('aria-disabled');
    button.tabIndex = 0;
    button.setAttribute('aria-label', `Guess ${button.textContent.trim().toUpperCase()}`);
  }
}

export function getLetterButton(keyboard, letter) {
  return [...keyboard.querySelectorAll('button')]
    .find((button) => button.textContent.trim().toLowerCase() === letter);
}

/** Used keys must not accept another guess, but must remain programmatically focusable. */
export function isKeyAvailable(button) {
  return !!button && !button.disabled && button.getAttribute('aria-disabled') !== 'true';
}

/** aria-disabled, unlike native disabled, lets keyboard focus follow a typed letter. */
export function markKeyChosen(button, correct) {
  button.classList.add('chosen');
  button.dataset.result = correct ? 'correct' : 'incorrect';
  button.setAttribute('aria-disabled', 'true');
  button.tabIndex = -1; // Skip used keys while tabbing, but allow .focus() after a guess.
  button.setAttribute('aria-label', `${button.textContent.trim().toUpperCase()}, ${correct ? 'correct' : 'incorrect'} guess, already used`);
}

export function focusGuessedKey(button) {
  button.focus({ preventScroll: true });
}
