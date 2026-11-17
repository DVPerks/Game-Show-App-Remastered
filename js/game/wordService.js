import { WORD_LENGTHS } from './gameRules.js';
import { requestJson } from './apiClient.js';

// Offline reserve: each difficulty has at least ten valid words.
// Used if the Random Word API cannot supply a valid, different answer.
const wordsByDifficulty = Object.freeze({
  easy: ['cat', 'dog', 'sun', 'map', 'fox', 'pen', 'hat', 'bus', 'cup', 'owl', 'bee', 'jam', 'key'],
  medium: ['planet', 'garden', 'silver', 'rocket', 'banana', 'bridge', 'camera', 'forest', 'winter', 'summer', 'pencil', 'cookie', 'rabbit', 'castle', 'flower', 'orange'],
  hard: ['blueberry', 'pineapple', 'butterfly', 'chocolate', 'adventure', 'wonderful', 'sunflower', 'crocodile', 'classroom', 'fireplace', 'important', 'beautiful', 'breakfast', 'hamburger', 'newspaper', 'telescope'],
});

export function isValidWord(word, difficulty) {
  return Object.hasOwn(WORD_LENGTHS, difficulty)
    && typeof word === 'string'
    && /^[a-z]+$/i.test(word)
    && word.length === WORD_LENGTHS[difficulty];
}

/** Local fallback; also makes the game testable without an external service. */
export function getRandomWord(difficulty, previousWord = '', random = Math.random) {
  if (!Object.hasOwn(WORD_LENGTHS, difficulty)) {
    throw new RangeError(`Unknown difficulty: ${difficulty}`);
  }
  const words = wordsByDifficulty[difficulty];
  const candidates = words.filter((candidate) => candidate !== previousWord.toLowerCase());
  const pool = candidates.length ? candidates : words;
  return pool[Math.floor(random() * pool.length)];
}


/** Prefer a network word; retry invalid/duplicate API results, then fall back. */
export async function getWordForRound(difficulty, previousWord = '', {
  fetchImpl = globalThis.fetch,
  signal,
  timeoutMs = 5000,
  random = Math.random,
} = {}) {
  if (!Object.hasOwn(WORD_LENGTHS, difficulty)) {
    throw new RangeError(`Unknown difficulty: ${difficulty}`);
  }

  const url = `https://random-word-api.herokuapp.com/word?length=${WORD_LENGTHS[difficulty]}&diff=1`;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const payload = await requestJson(url, { fetchImpl, signal, timeoutMs });
      const candidate = Array.isArray(payload) ? payload[0] : null;
      if (isValidWord(candidate, difficulty) && candidate.toLowerCase() !== previousWord.toLowerCase()) {
        return { word: candidate.toLowerCase(), source: 'api' };
      }
    } catch (error) {
      // Don't start a game after the player has cancelled the loading screen.
      if (signal?.aborted) throw error;
      break; // Network errors/timeouts should not make users wait through more attempts.
    }
  }

  if (signal?.aborted) throw new DOMException('Request cancelled', 'AbortError');
  return { word: getRandomWord(difficulty, previousWord, random), source: 'offline' };
}

/** Assignment-compatible helper for callers that need only an array of letters. */
export async function getRandomWordAsArray(difficulty, previousWord = '', options = {}) {
  const { word } = await getWordForRound(difficulty, previousWord, options);
  return [...word];
}
