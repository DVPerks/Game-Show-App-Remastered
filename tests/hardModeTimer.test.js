import test from 'node:test';
import assert from 'node:assert/strict';
import { createHardModeTimer, HARD_MODE_SECONDS, PENALTY_INTERVAL_SECONDS } from '../js/game/hardModeTimer.js';

function fakeScheduler() {
  const timers = new Map();
  let nextId = 0;
  return {
    setInterval(callback, milliseconds) {
      assert.equal(milliseconds, 1000);
      const id = ++nextId;
      timers.set(id, callback);
      return id;
    },
    clearInterval(id) { timers.delete(id); },
    advance(seconds = 1) {
      for (let n = 0; n < seconds; n += 1) {
        for (const [id, callback] of [...timers]) {
          if (timers.has(id)) callback();
        }
      }
    },
    get active() { return timers.size; },
  };
}

test('hard mode starts at 25s and deducts a life every five seconds', () => {
  const scheduler = fakeScheduler();
  const ticks = [];
  const penalties = [];
  let expirations = 0;
  const timer = createHardModeTimer({
    scheduler,
    onTick: (remaining) => ticks.push(remaining),
    onPenalty: (remaining) => penalties.push(remaining),
    onExpire: () => { expirations += 1; },
  });
  assert.equal(HARD_MODE_SECONDS, 25);
  assert.equal(PENALTY_INTERVAL_SECONDS, 5);
  timer.start();
  assert.equal(timer.getRemaining(), 25);
  scheduler.advance(4);
  assert.equal(timer.getRemaining(), 21);
  assert.deepEqual(penalties, []);
  scheduler.advance(21);
  assert.deepEqual(penalties, [20, 15, 10, 5, 0]);
  assert.equal(ticks.length, 26); // Initial display plus 25 countdown updates.
  assert.equal(timer.getRemaining(), 0);
  assert.equal(timer.isRunning(), false);
  assert.equal(scheduler.active, 0);
  assert.equal(expirations, 1);
  scheduler.advance(10);
  assert.equal(penalties.length, 5);
  assert.equal(expirations, 1);
});

test('stopping on a correct answer prevents future ticks and penalties', () => {
  const scheduler = fakeScheduler();
  const penalties = [];
  const timer = createHardModeTimer({scheduler, onTick() {}, onPenalty: (time) => penalties.push(time)});
  timer.start();
  scheduler.advance(3);
  timer.stop();
  scheduler.advance(22);
  assert.deepEqual(penalties, []);
  assert.equal(timer.getRemaining(), 22);
  assert.equal(scheduler.active, 0);
});

test('finishing due to a penalty stops the timer and avoids duplicate losses', () => {
  const scheduler = fakeScheduler();
  const penalties = [];
  let expirationCount = 0;
  let timer;
  timer = createHardModeTimer({
    scheduler,
    onTick() {},
    onPenalty(time) { penalties.push(time); if (penalties.length === 2) timer.stop(); },
    onExpire() { expirationCount += 1; },
  });
  timer.start();
  scheduler.advance(25);
  assert.deepEqual(penalties, [20, 15]);
  assert.equal(expirationCount, 0);
  assert.equal(scheduler.active, 0);
});

test('replay resets time and replaces rather than duplicates intervals', () => {
  const scheduler = fakeScheduler();
  const ticks = [];
  const timer = createHardModeTimer({scheduler, onTick: (time) => ticks.push(time), onPenalty() {}});
  timer.start();
  scheduler.advance(7);
  timer.start();
  assert.equal(timer.getRemaining(), 25);
  assert.equal(scheduler.active, 1);
  scheduler.advance(5);
  assert.equal(timer.getRemaining(), 20);
  assert.deepEqual(ticks.slice(-6), [25, 24, 23, 22, 21, 20]);
  timer.stop();
  timer.stop();
  assert.equal(scheduler.active, 0);
});

test('invalid timer configuration is rejected', () => {
  assert.throws(() => createHardModeTimer({onTick(){}, onPenalty(){}, durationSeconds: 0}), RangeError);
  assert.throws(() => createHardModeTimer({onTick(){}, onPenalty(){}, penaltyEverySeconds: -5}), RangeError);
  assert.throws(() => createHardModeTimer({onPenalty() {}}), TypeError);
});
