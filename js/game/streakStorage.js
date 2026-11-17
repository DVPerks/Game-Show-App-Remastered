import { WORD_LENGTHS } from './gameRules.js';

const DIFFICULTIES = Object.keys(WORD_LENGTHS);

function readCount(storage, key) {
  try {
    const raw = storage?.getItem(key);
    if (raw === null || raw === undefined || !/^\d+$/.test(raw)) return 0;
    const parsed = Number(raw);
    return Number.isSafeInteger(parsed) ? parsed : 0;
  } catch {
    return 0; // Blocked/corrupt storage should never prevent play.
  }
}

function saveCount(storage, key, count) {
  try {
    storage?.setItem(key, String(count));
  } catch {
    // Memory-only streaks still work during this visit.
  }
}

/** Per-difficulty current/best streaks using the assignment's storage keys. */
export function createStreakTracker(storage = null) {
  const stats = Object.fromEntries(DIFFICULTIES.map((difficulty) => {
    const current = readCount(storage, `currentStreak_${difficulty}`);
    const best = Math.max(current, readCount(storage, `bestStreak_${difficulty}`));
    return [difficulty, { current, best }];
  }));

  function getStats(difficulty) {
    if (!Object.hasOwn(stats, difficulty)) throw new RangeError(`Unknown difficulty: ${difficulty}`);
    return { ...stats[difficulty] };
  }

  function recordResult(difficulty, outcome) {
    if (!Object.hasOwn(stats, difficulty)) throw new RangeError(`Unknown difficulty: ${difficulty}`);
    if (outcome !== 'won' && outcome !== 'lost') throw new RangeError(`Invalid result: ${outcome}`);
    const currentStats = stats[difficulty];
    // Preserve the completed run for the result screen before a loss resets it.
    const streakAtResult = outcome === 'won'
      ? Math.min(currentStats.current + 1, Number.MAX_SAFE_INTEGER)
      : currentStats.current;
    currentStats.current = outcome === 'won' ? streakAtResult : 0;
    currentStats.best = Math.max(currentStats.best, streakAtResult);
    saveCount(storage, `currentStreak_${difficulty}`, currentStats.current);
    saveCount(storage, `bestStreak_${difficulty}`, currentStats.best);
    return { ...getStats(difficulty), streakAtResult };
  }

  /** End the session without changing the saved high score. */
  function resetCurrent(difficulty) {
    if (!Object.hasOwn(stats, difficulty)) throw new RangeError(`Unknown difficulty: ${difficulty}`);
    stats[difficulty].current = 0;
    saveCount(storage, `currentStreak_${difficulty}`, 0);
    return getStats(difficulty);
  }

  return { getStats, recordResult, resetCurrent };
}
