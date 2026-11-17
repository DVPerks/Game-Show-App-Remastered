/** A single, cancellable countdown. Five elapsed seconds costs one life. */
export const HARD_MODE_SECONDS = 25;
export const PENALTY_INTERVAL_SECONDS = 5;

export function createHardModeTimer({
  onTick,
  onPenalty,
  onExpire = () => {},
  durationSeconds = HARD_MODE_SECONDS,
  penaltyEverySeconds = PENALTY_INTERVAL_SECONDS,
  scheduler = globalThis,
}) {
  if (!Number.isInteger(durationSeconds) || durationSeconds < 1) {
    throw new RangeError('Timer duration must be a positive whole number.');
  }
  if (!Number.isInteger(penaltyEverySeconds) || penaltyEverySeconds < 1) {
    throw new RangeError('Penalty interval must be a positive whole number.');
  }
  if (typeof onTick !== 'function' || typeof onPenalty !== 'function') {
    throw new TypeError('Timer needs tick and penalty callbacks.');
  }

  let intervalId = null;
  let remaining = durationSeconds;
  let elapsed = 0;

  function stop() {
    if (intervalId === null) return;
    scheduler.clearInterval(intervalId);
    intervalId = null;
  }

  function tick() {
    if (intervalId === null) return;
    elapsed += 1;
    remaining = Math.max(0, durationSeconds - elapsed);
    onTick(remaining);

    // Do not apply a time penalty after the round has been stopped by a callback.
    if (intervalId !== null && elapsed % penaltyEverySeconds === 0) {
      onPenalty(remaining);
    }
    if (intervalId !== null && remaining === 0) {
      stop();
      onExpire();
    }
  }

  function start() {
    stop();
    elapsed = 0;
    remaining = durationSeconds;
    onTick(remaining);
    intervalId = scheduler.setInterval(tick, 1000);
  }

  return {
    start,
    stop,
    isRunning: () => intervalId !== null,
    getRemaining: () => remaining,
  };
}
