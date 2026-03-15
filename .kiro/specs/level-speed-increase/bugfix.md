# Bugfix Requirements Document

## Introduction

The game's ball speed at Level 1 is too slow, making the initial gameplay feel sluggish and unengaging. The `ballInitialSpeed` constant (currently `0.3` pixels/ms) is the base speed applied at Level 1, and it needs to be increased so the game feels responsive from the very first level. Subsequent levels already scale speed correctly via `ballSpeedIncrement`, so only the base starting speed is affected.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the game starts at Level 1 THEN the system launches the ball at `0.3` pixels/ms, which is perceived as too slow by the player

1.2 WHEN `initLevel(1)` is called THEN the system sets `_levelSpeed` to `ballInitialSpeed + (1 - 1) * ballSpeedIncrement = 0.3`, producing a sluggish ball movement

### Expected Behavior (Correct)

2.1 WHEN the game starts at Level 1 THEN the system SHALL launch the ball at a noticeably faster speed (e.g. `0.5` pixels/ms) so gameplay feels engaging from the start

2.2 WHEN `initLevel(1)` is called THEN the system SHALL set `_levelSpeed` to the updated `ballInitialSpeed` value, reflecting the increased base speed

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the player advances from Level 1 to Level 2 THEN the system SHALL CONTINUE TO increase ball speed by `ballSpeedIncrement` relative to the new base speed

3.2 WHEN any level `n > 1` is initialized THEN the system SHALL CONTINUE TO compute speed as `ballInitialSpeed + (n - 1) * ballSpeedIncrement`, preserving the per-level speed progression

3.3 WHEN the ball is launched on any level THEN the system SHALL CONTINUE TO launch at a 45-degree diagonal angle with the correct speed magnitude for that level

3.4 WHEN the game is restarted THEN the system SHALL CONTINUE TO reset to Level 1 and apply the (updated) base speed correctly
