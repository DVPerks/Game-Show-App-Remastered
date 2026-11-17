import '../scss/main.scss';
import { initializeGameController } from './game/gameController.js';

const supportedThemes = new Set(['classic', 'dark', 'neon']);
const themeSelect = document.querySelector('#theme');

function loadSavedTheme() {
  try {
    const savedTheme = localStorage.getItem('gameTheme');
    return supportedThemes.has(savedTheme) ? savedTheme : 'classic';
  } catch {
    return 'classic'; // Theme preference should never block gameplay.
  }
}

function applyTheme(theme) {
  if (!supportedThemes.has(theme)) return;
  document.documentElement.dataset.theme = theme;
  themeSelect.value = theme;
  try {
    localStorage.setItem('gameTheme', theme);
  } catch {
    // If storage is blocked, the theme still works during this visit.
  }
}

applyTheme(loadSavedTheme());
themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
initializeGameController();
