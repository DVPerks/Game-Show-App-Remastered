# Streak display update (Phase 3.1)

The result screen now labels the first statistic **Streak** instead of **Current streak**.

- Winning displays the updated consecutive-win count.
- Losing displays the total consecutive wins earned immediately **before** the loss, rather than the now-reset active counter. The persisted `currentStreak_<difficulty>` resets to `0` when a loss is recorded.
- **Play again** after a win continues the streak so a player can set a high score greater than 1.
- **Try again** after a loss starts with an active streak of 0.
- **Home** from gameplay or results clears the active streak for that difficulty but preserves `bestStreak_<difficulty>`.
- The best streak remains stored separately per difficulty. Theme and other gameplay behaviors are unchanged.

To verify, win two rounds, lose the third, and confirm the loss screen shows **Streak 2 / Best streak 2**. Select Try again; after another win, it should show **Streak 1 / Best streak 2**.
