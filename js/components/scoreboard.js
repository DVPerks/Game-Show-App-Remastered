import { MAX_MISSES } from '../game/gameRules.js';

const iconOptions = new Set(['Heart', 'Emoji', 'Shield', 'Thumbs']);

function iconName(selectedIcon) {
  return iconOptions.has(selectedIcon) ? selectedIcon : 'Heart';
}

export function resetLives(scoreboard, selectedIcon) {
  scoreboard.querySelector('#lives-count').textContent = String(MAX_MISSES);
  for (const image of scoreboard.querySelectorAll('.tries img')) {
    image.src = `./images/live${iconName(selectedIcon)}.png`;
  }
}

/** Increment misses and swap exactly one icon to its lost version. */
export function removeLife(scoreboard, missed, selectedIcon) {
  const nextMissed = Math.min(missed + 1, MAX_MISSES);
  const images = scoreboard.querySelectorAll('.tries img');
  const image = images[nextMissed - 1];
  if (image) image.src = `./images/lost${iconName(selectedIcon)}.png`;
  scoreboard.querySelector('#lives-count').textContent = String(MAX_MISSES - nextMissed);
  return nextMissed;
}
