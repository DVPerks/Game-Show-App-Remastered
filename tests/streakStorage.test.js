import test from 'node:test';
import assert from 'node:assert/strict';
import { createStreakTracker } from '../js/game/streakStorage.js';

function memoryStorage(entries = {}) {
  const map = new Map(Object.entries(entries));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    read: (key) => map.get(key),
  };
}

test('streaks increment on wins, reset on losses, and preserve the best', () => {
  const storage = memoryStorage();
  const tracker = createStreakTracker(storage);
  assert.deepEqual(tracker.recordResult('easy', 'won'), { current: 1, best: 1, streakAtResult: 1 });
  assert.deepEqual(tracker.recordResult('easy', 'won'), { current: 2, best: 2, streakAtResult: 2 });
  assert.deepEqual(tracker.recordResult('easy', 'lost'), { current: 0, best: 2, streakAtResult: 2 });
  assert.deepEqual(tracker.recordResult('easy', 'won'), { current: 1, best: 2, streakAtResult: 1 });
  assert.equal(storage.read('currentStreak_easy'), '1');
  assert.equal(storage.read('bestStreak_easy'), '2');
});

test('streaks persist through new trackers and remain independent by difficulty', () => {
  const storage = memoryStorage();
  const tracker = createStreakTracker(storage);
  tracker.recordResult('hard', 'won');
  tracker.recordResult('medium', 'lost');
  const restored = createStreakTracker(storage);
  assert.deepEqual(restored.getStats('hard'), { current: 1, best: 1 });
  assert.deepEqual(restored.getStats('easy'), { current: 0, best: 0 });
  assert.deepEqual(restored.getStats('medium'), { current: 0, best: 0 });
});

test('invalid storage values are ignored and a smaller best is corrected', () => {
  const tracker = createStreakTracker(memoryStorage({
    currentStreak_easy: 'broken', bestStreak_easy: '-4',
    currentStreak_hard: '4', bestStreak_hard: '2',
  }));
  assert.deepEqual(tracker.getStats('easy'), { current: 0, best: 0 });
  assert.deepEqual(tracker.getStats('hard'), { current: 4, best: 4 });
});

test('blocked localStorage falls back to in-memory statistics', () => {
  const storage = { getItem() { throw Error('Blocked'); }, setItem() { throw Error('Blocked'); } };
  const tracker = createStreakTracker(storage);
  tracker.recordResult('medium', 'won');
  assert.deepEqual(tracker.getStats('medium'), { current: 1, best: 1 });
});

test('invalid difficulties and outcomes are rejected', () => {
  const tracker = createStreakTracker();
  assert.throws(() => tracker.getStats('expert'), RangeError);
  assert.throws(() => tracker.recordResult('easy', 'abandoned'), RangeError);
});


test('loss result shows the achieved streak even though stored current resets', () => {
  const storage = memoryStorage();
  const tracker = createStreakTracker(storage);
  for (let i = 0; i < 4; i += 1) tracker.recordResult('medium', 'won');
  const result = tracker.recordResult('medium', 'lost');
  assert.deepEqual(result, { current: 0, best: 4, streakAtResult: 4 });
  assert.equal(storage.read('currentStreak_medium'), '0');
  assert.equal(storage.read('bestStreak_medium'), '4');
  assert.deepEqual(tracker.recordResult('medium', 'won'), { current: 1, best: 4, streakAtResult: 1 });
});

test('returning home resets active streak without changing high score or other difficulties', () => {
  const storage = memoryStorage();
  const tracker = createStreakTracker(storage);
  tracker.recordResult('easy', 'won');
  tracker.recordResult('easy', 'won');
  tracker.recordResult('hard', 'won');
  assert.deepEqual(tracker.resetCurrent('easy'), { current: 0, best: 2 });
  assert.equal(storage.read('currentStreak_easy'), '0');
  assert.equal(storage.read('bestStreak_easy'), '2');
  assert.deepEqual(tracker.getStats('hard'), { current: 1, best: 1 });
  assert.deepEqual(createStreakTracker(storage).getStats('easy'), { current: 0, best: 2 });
  assert.throws(() => tracker.resetCurrent('expert'), RangeError);
});
