/** Display letters visually, but never speak hidden answer characters. */
export function addWordToDisplay(characters, wordList) {
  wordList.replaceChildren();
  for (const character of characters) {
    const tile = document.createElement('li');
    tile.className = 'letter';
    tile.textContent = character;
    tile.setAttribute('aria-hidden', 'true');
    wordList.append(tile);
  }
  updateWordAccessibleLabel(wordList);
}

/** Reveal every occurrence (not only the first) of the guessed letter. */
export function checkLetter(guess, wordList) {
  let found = false;
  for (const tile of wordList.querySelectorAll('li.letter')) {
    if (tile.textContent === guess) {
      tile.classList.add('show');
      found = true;
    }
  }
  if (found) updateWordAccessibleLabel(wordList);
  return found ? guess : null;
}

export function updateWordAccessibleLabel(wordList) {
  const tiles = [...wordList.querySelectorAll('li.letter')];
  const progress = tiles.map((tile, i) =>
    `position ${i + 1}: ${tile.classList.contains('show') ? tile.textContent.toUpperCase() : 'hidden'}`
  );
  wordList.setAttribute('aria-label', `${tiles.length}-letter word. ${progress.join('; ')}.`);
}

export function clearWordDisplay(wordList) {
  wordList.replaceChildren();
  wordList.setAttribute('aria-label', 'No word selected');
}
