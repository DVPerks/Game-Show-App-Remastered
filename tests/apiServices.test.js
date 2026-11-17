import test from 'node:test';
import assert from 'node:assert/strict';
import { getWordForRound, getRandomWordAsArray, isValidWord } from '../js/game/wordService.js';
import { fetchDefinition, formatDefinition } from '../js/game/definitionService.js';

const ok = (payload) => async (_url, _options) => ({ ok: true, json: async () => payload });

test('API word matches difficulty and normalizes casing', async () => {
  let requestedUrl = '';
  const fetchImpl = async (url) => {
    requestedUrl = url;
    return { ok: true, json: async () => ['PLANET'] };
  };
  assert.deepEqual(await getWordForRound('medium', '', { fetchImpl }), { word: 'planet', source: 'api' });
  assert.match(requestedUrl, /length=6&diff=1$/);
});

test('API words are validated strictly by letters and length', () => {
  assert.equal(isValidWord('banana', 'medium'), true);
  for (const value of ['ban ana', '123456', 'banána', 'five', '', null, 123456]) {
    assert.equal(isValidWord(value, 'medium'), false);
  }
});

test('duplicate API word triggers another request', async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return { ok: true, json: async () => [calls === 1 ? 'cat' : 'dog'] };
  };
  const selection = await getWordForRound('easy', 'cat', { fetchImpl });
  assert.deepEqual(selection, { word: 'dog', source: 'api' });
  assert.equal(calls, 2);
});

test('malformed, duplicate, failed and timed-out APIs use valid offline words', async () => {
  const providers = [
    ok(['123']),
    ok('not-an-array'),
    ok(['cat']),
    async () => { throw new Error('Offline'); },
    async () => ({ ok: false, status: 503 }),
    (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }),
  ];
  for (const fetchImpl of providers) {
    const selection = await getWordForRound('easy', 'cat', { fetchImpl, random: () => 0, timeoutMs: 8 });
    assert.equal(selection.source, 'offline');
    assert.equal(selection.word.length, 3);
    assert.notEqual(selection.word, 'cat');
  }
});

test('cancelled word selection never starts an offline game', async () => {
  const controller = new AbortController();
  const request = getWordForRound('hard', '', {
    signal: controller.signal,
    fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }),
  });
  controller.abort();
  await assert.rejects(request, { name: 'AbortError' });
});

test('Datamuse exact word definition is formatted and does not reveal the answer', async () => {
  let requestedUrl = '';
  const fetchImpl = async (url) => {
    requestedUrl = url;
    return { ok: true, json: async () => [{ word: 'banana', defs: ['n\tbanana is a fruit', 'n\ta long yellow fruit'] }] };
  };
  assert.equal(await fetchDefinition('banana', { fetchImpl }), 'Noun: a long yellow fruit');
  assert.match(requestedUrl, /sp=banana&md=d&max=1$/);
  assert.equal(formatDefinition('n\tthe word banana', 'banana'), null);
});

test('missing/mismatched definitions and errors resolve to null', async () => {
  assert.equal(await fetchDefinition('cat', { fetchImpl: ok([{ word: 'bat', defs: ['n\ta bat'] }]) }), null);
  assert.equal(await fetchDefinition('cat', { fetchImpl: ok([{ word: 'cat', defs: [] }]) }), null);
  assert.equal(await fetchDefinition('cat', { fetchImpl: async () => { throw new Error('network'); } }), null);
});

test('getRandomWordAsArray uses the remote word service', async () => {
  const letters = await getRandomWordAsArray('medium', '', { fetchImpl: ok(['garden']) });
  assert.deepEqual(letters, ['g', 'a', 'r', 'd', 'e', 'n']);
});
