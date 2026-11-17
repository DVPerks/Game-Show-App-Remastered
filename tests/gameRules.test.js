import test from 'node:test';
import assert from 'node:assert/strict';
import { isLetterKey, getLetterPositions, isWordSolved, WORD_LENGTHS, MAX_MISSES } from '../js/game/gameRules.js';
import { getRandomWord } from '../js/game/wordService.js';

test('only single A-Z keys count as guesses', () => {
  for (const letter of ['a', 'Z', 'm']) assert.equal(isLetterKey(letter), true);
  for (const key of ['Shift', '1', 'é', 'ab', ' ', 'ArrowLeft']) assert.equal(isLetterKey(key), false);
});

test('repeated letters return all 1-based positions', () => {
  assert.deepEqual(getLetterPositions('banana', 'a'), [2, 4, 6]);
  assert.deepEqual(getLetterPositions('banana', 'z'), []);
});

test('win rule counts unique guesses but every letter in the answer', () => {
  assert.equal(isWordSolved('banana', new Set(['b', 'a', 'n'])), true);
  assert.equal(isWordSolved('banana', new Set(['b', 'n'])), false);
});

test('word pools contain valid strings of the specified lengths', () => {
  for (const [difficulty, length] of Object.entries(WORD_LENGTHS)) {
    for (let i = 0; i < 40; i += 1) {
      const word = getRandomWord(difficulty, '', () => i / 40);
      assert.match(word, /^[a-z]+$/);
      assert.equal(word.length, length, `${difficulty}: ${word}`);
    }
  }
  assert.equal(MAX_MISSES, 5);
});

test('replay avoids the immediately previous word', () => {
  const first = getRandomWord('easy', '', () => 0);
  const next = getRandomWord('easy', first, () => 0);
  assert.notEqual(next, first);
});

test('invalid difficulty is rejected', () => {
  assert.throws(() => getRandomWord('expert'), RangeError);
});
