/** Rules that do not depend on the browser DOM. */
export const MAX_MISSES = 5;

export const WORD_LENGTHS = Object.freeze({ easy: 3, medium: 6, hard: 9 });

export function isLetterKey(key) {
  return /^[a-z]$/i.test(key);
}

/** Return 1-based positions so feedback is useful without seeing the tiles. */
export function getLetterPositions(word, letter) {
  return [...word].flatMap((character, index) =>
    character === letter.toLowerCase() ? [index + 1] : []
  );
}

export function isWordSolved(word, guessedLetters) {
  return [...word].every((character) => guessedLetters.has(character));
}
