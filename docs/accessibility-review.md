# Accessibility design and review notes

## Built-in accommodations

- **Input and focus.** Both physical A–Z keys and on-screen buttons guess letters. On each guess, focus follows the actual key. A guessed key uses `aria-disabled="true"` and `tabindex="-1"` rather than native `disabled`; this makes the used key programmatically focusable for feedback, but removes it from the normal Tab order. The game controller rejects any attempts to reuse it.
- **Dialog focus.** Setup, loading and results are presented as a modal view while the game behind it is inert. Focus enters the active dialog, and Tab remains within it. The loading request can be cancelled.
- **Nonvisual progress.** Hidden answer letters are excluded from the accessibility tree. The word list describes each position as hidden or revealed. Status announcements report guesses, letter positions, and remaining lives. The scoreboard also gives a numeric lives count.
- **Visual design.** Three theme palettes use shared semantic color tokens. Correct and incorrect keys have symbols as well as colors. Focus rings are visible; animations honor `prefers-reduced-motion`.
- **Layout.** Flexible controls and tiles were checked at 320–1280 CSS pixels; 200%/400% zoom and assistive technologies still require manual validation.

## What needs further review

The Hard timer is fixed at 25 seconds by the assignment. Easy and Medium are untimed alternatives, but **the ability to choose a different difficulty does not by itself establish WCAG 2.2 AA conformance** for a timed game. WCAG SC 2.2.1 usually requires a way to turn off, adjust, or extend content-set time limits unless an exception such as an essential time limit applies. Review the experience against the [W3C timing criterion](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html) and the assignment's constraints before claiming conformance.

Color-token contrast checks are recorded in `contrast-report.md`. They do not replace testing computed colors, focus states, zoom, screen-reader output, or navigation across multiple browser engines.
