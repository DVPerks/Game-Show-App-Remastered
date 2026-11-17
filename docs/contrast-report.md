# Color contrast audit

Calculated with the WCAG relative-luminance contrast formula, based on the defined solid CSS tokens. Numbers do **not** replace browser, zoom, focus, and assistive-technology testing.

Thresholds: normal text 4.5:1, meaningful non-text outlines 3:1.

## Classic

| Element | Contrast | Required | Result |
|---|---:|---:|---|
| Body text | 13.39:1 | 4.5:1 | Pass |
| Body text on surface | 14.52:1 | 4.5:1 | Pass |
| Muted text on surface | 7.83:1 | 4.5:1 | Pass |
| Brand heading | 8.58:1 | 4.5:1 | Pass |
| Keyboard labels | 11.97:1 | 4.5:1 | Pass |
| Keyboard chosen labels | 9.30:1 | 4.5:1 | Pass |
| Key borders | 3.88:1 | 3.0:1 | Pass |
| Key borders against page | 4.34:1 | 3.0:1 | Pass |
| Tile borders | 3.70:1 | 3.0:1 | Pass |
| Revealed tile labels | 7.34:1 | 4.5:1 | Pass |
| Overlay text | 9.30:1 | 4.5:1 | Pass |
| Form labels on overlay | 9.30:1 | 4.5:1 | Pass |
| Form input text | 14.52:1 | 4.5:1 | Pass |
| Action text | 12.03:1 | 4.5:1 | Pass |
| Focus outline on overlay | 5.84:1 | 3.0:1 | Pass |
| Win overlay white | 7.46:1 | 4.5:1 | Pass |
| Lose overlay white | 7.49:1 | 4.5:1 | Pass |

## Dark

| Element | Contrast | Required | Result |
|---|---:|---:|---|
| Body text | 16.75:1 | 4.5:1 | Pass |
| Body text on surface | 14.00:1 | 4.5:1 | Pass |
| Muted text on surface | 11.17:1 | 4.5:1 | Pass |
| Brand heading | 12.05:1 | 4.5:1 | Pass |
| Keyboard labels | 11.28:1 | 4.5:1 | Pass |
| Keyboard chosen labels | 12.05:1 | 4.5:1 | Pass |
| Key borders | 5.47:1 | 3.0:1 | Pass |
| Key borders against page | 8.57:1 | 3.0:1 | Pass |
| Tile borders | 4.12:1 | 3.0:1 | Pass |
| Revealed tile labels | 11.01:1 | 4.5:1 | Pass |
| Overlay text | 13.25:1 | 4.5:1 | Pass |
| Form labels on overlay | 13.25:1 | 4.5:1 | Pass |
| Form input text | 14.52:1 | 4.5:1 | Pass |
| Action text | 12.33:1 | 4.5:1 | Pass |
| Focus outline on overlay | 9.17:1 | 3.0:1 | Pass |
| Win overlay white | 9.33:1 | 4.5:1 | Pass |
| Lose overlay white | 9.21:1 | 4.5:1 | Pass |

## Neon

| Element | Contrast | Required | Result |
|---|---:|---:|---|
| Body text | 18.86:1 | 4.5:1 | Pass |
| Body text on surface | 16.88:1 | 4.5:1 | Pass |
| Muted text on surface | 12.73:1 | 4.5:1 | Pass |
| Brand heading | 11.94:1 | 4.5:1 | Pass |
| Keyboard labels | 13.88:1 | 4.5:1 | Pass |
| Keyboard chosen labels | 11.50:1 | 4.5:1 | Pass |
| Key borders | 6.29:1 | 3.0:1 | Pass |
| Key borders against page | 8.85:1 | 3.0:1 | Pass |
| Tile borders | 6.58:1 | 3.0:1 | Pass |
| Revealed tile labels | 12.65:1 | 4.5:1 | Pass |
| Overlay text | 14.05:1 | 4.5:1 | Pass |
| Form labels on overlay | 14.05:1 | 4.5:1 | Pass |
| Form input text | 14.52:1 | 4.5:1 | Pass |
| Action text | 11.50:1 | 4.5:1 | Pass |
| Focus outline on overlay | 10.69:1 | 3.0:1 | Pass |
| Win overlay white | 7.69:1 | 4.5:1 | Pass |
| Lose overlay white | 8.34:1 | 4.5:1 | Pass |

## Additional manual checks

- [ ] `npm run build` with installed dependencies (offline container could not reach npm).
- [ ] Real browser checks at 320 CSS px, 200% zoom, desktop and tablet.
- [ ] Tab order, visible focus, setup-to-game and return focus.
- [ ] Chrome, Firefox and Safari where available.
- [ ] Automated axe/Lighthouse check when game is implemented.
- [ ] NVDA/VoiceOver label and status announcements.
- [ ] Timer behavior and timing accommodations for the completed game.
