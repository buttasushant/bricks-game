# Implementation Plan: Random Power-Ups

## Overview

Extend `game.html` by adding a `PowerUpManager` class, updating `GameEngine` to support multiple balls and timed effects, and updating `Renderer` to draw tokens and visual state changes. All code lives in the existing `<script>` block.

## Tasks

- [x] 1. Add constants and config for power-ups
  - Add `PowerUpType` constant object with MULTI_BALL, EXTRA_LIFE, WIDE_PADDLE, SLOW_BALL values
  - Extend `GameConfig` with power-up config fields: `powerUpSpawnChance`, `powerUpFallSpeed`, `powerUpTokenWidth`, `powerUpTokenHeight`, `widePaddleMultiplier`, `widePaddleDuration`, `slowBallMultiplier`, `slowBallDuration`, `maxLives`
  - _Requirements: 1.1, 1.2, 1.3, 4.2, 5.1, 6.1_

- [x] 2. Implement PowerUpManager class
  - [x] 2.1 Implement PowerUpManager with spawn, update, and collection logic
    - Add `_tokens` array, `onCollect` callback, `onBrickDestroyed(brick)` method (20% chance spawn at brick center)
    - Add `update(dt, paddle)` to move tokens down, detect paddle overlap, fire `onCollect`, remove out-of-bounds tokens
    - Add `clearTokens()` and `getTokens()` methods
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.3, 2.4_

  - [ ]* 2.2 Write property test for spawn threshold (Property 1)
    - **Property 1: Spawn threshold**
    - **Validates: Requirements 1.1**

  - [ ]* 2.3 Write property test for spawned token type validity (Property 2)
    - **Property 2: Spawned token type is valid**
    - **Validates: Requirements 1.2**

  - [ ]* 2.4 Write property test for token fall speed (Property 3)
    - **Property 3: Token falls at correct speed**
    - **Validates: Requirements 1.3**

  - [ ]* 2.5 Write property test for token removal at bottom boundary (Property 4)
    - **Property 4: Token removed at bottom boundary**
    - **Validates: Requirements 1.4**

  - [ ]* 2.6 Write property test for paddle collision removes token and fires callback (Property 5)
    - **Property 5: Paddle collision removes token and fires callback**
    - **Validates: Requirements 2.1**

  - [ ]* 2.7 Write property test for clearTokens (Property 6)
    - **Property 6: clearTokens empties all tokens**
    - **Validates: Requirements 2.3, 2.4**

- [x] 3. Update GameEngine to support multiple balls
  - [x] 3.1 Replace `_ball` with `_balls` array and update all single-ball logic
    - Rename `_ball` to `_balls` (array); update `initLevel`, `launchBall`, `_updateBall`, `_checkBrickCollisions`, `_checkBallLost`, `_resetBallToStart`
    - Add `_baseSpeed` field to each ball object
    - Update `getBalls()` to return array of snapshots; keep `getBallState()` returning first ball for backward compat or remove if unused
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 9 (design: multi-ball array)_

  - [ ]* 3.2 Write property test for Multi_Ball doubles ball count (Property 7)
    - **Property 7: Multi_Ball doubles ball count**
    - **Validates: Requirements 3.1**

  - [ ]* 3.3 Write property test for non-last ball loss does not decrement lives (Property 8)
    - **Property 8: Non-last ball loss does not decrement lives**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 3.4 Write property test for reset transition yields a single ball (Property 9)
    - **Property 9: Reset transition yields a single ball**
    - **Validates: Requirements 3.4, 8.2**

- [x] 4. Implement applyPowerUp and timed effects in GameEngine
  - [x] 4.1 Add `applyPowerUp(type)` method and timed effect state to GameEngine
    - Add `_widePaddleTimer`, `_slowBallTimer`, `_paddleBaseWidth` fields; initialize in `initLevel`
    - Implement `applyPowerUp`: MULTI_BALL clones each ball, EXTRA_LIFE increments lives (cap 9), WIDE_PADDLE sets width and timer, SLOW_BALL scales all ball speeds and sets timer
    - Add timer countdown logic in `update(dt)`: decrement timers, restore paddle width and ball speeds on expiry
    - _Requirements: 3.1, 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 8.1_

  - [ ]* 4.2 Write property test for Extra_Life increments lives capped at 9 (Property 10)
    - **Property 10: Extra_Life increments lives, capped at 9**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 4.3 Write property test for Wide_Paddle sets width and timer (Property 11)
    - **Property 11: Wide_Paddle sets width and timer**
    - **Validates: Requirements 5.1**

  - [ ]* 4.4 Write property test for Wide_Paddle expiry restores base width (Property 12)
    - **Property 12: Wide_Paddle expiry restores base width**
    - **Validates: Requirements 5.2**

  - [ ]* 4.5 Write property test for re-applying Wide_Paddle resets timer (Property 13)
    - **Property 13: Re-applying Wide_Paddle resets timer**
    - **Validates: Requirements 5.3**

  - [ ]* 4.6 Write property test for paddle stays within play area while wide (Property 14)
    - **Property 14: Paddle stays within play area while wide**
    - **Validates: Requirements 5.4**

  - [ ]* 4.7 Write property test for Slow_Ball sets speed and timer (Property 15)
    - **Property 15: Slow_Ball sets speed and timer**
    - **Validates: Requirements 6.1**

  - [ ]* 4.8 Write property test for Slow_Ball expiry restores speed and preserves direction (Property 16)
    - **Property 16: Slow_Ball expiry restores speed and preserves direction**
    - **Validates: Requirements 6.2**

  - [ ]* 4.9 Write property test for re-applying Slow_Ball resets timer (Property 17)
    - **Property 17: Re-applying Slow_Ball resets timer**
    - **Validates: Requirements 6.3**

  - [ ]* 4.10 Write property test for new ball launched during Slow_Ball gets reduced speed (Property 18)
    - **Property 18: New ball launched during Slow_Ball gets reduced speed**
    - **Validates: Requirements 6.4**

  - [ ]* 4.11 Write property test for level completion cancels timed effects (Property 22)
    - **Property 22: Level completion cancels timed effects**
    - **Validates: Requirements 8.1**

  - [ ]* 4.12 Write property test for level completion preserves lives (Property 23)
    - **Property 23: Level completion preserves lives**
    - **Validates: Requirements 8.3**

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update Renderer for power-ups and visual effects
  - [x] 6.1 Add `drawPowerUpTokens(tokens)` and update existing draw methods
    - Add `drawPowerUpTokens(tokens)`: draw each token as a colored capsule with label (MULTI_BALL → cyan, EXTRA_LIFE → green, WIDE_PADDLE → orange, SLOW_BALL → blue)
    - Rename `drawBall` to `drawBalls(balls, isSlow)`: iterate array, use blue fill when `isSlow` is true
    - Update `drawPaddle(paddle, isWide)`: use orange fill when `isWide` is true
    - Update `render(state, engine, powerUpManager)` to pass the new arguments and call `drawPowerUpTokens`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 6.2 Write property test for token rendered with correct color and label per type (Property 19)
    - **Property 19: Token rendered with correct color and label per type**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 6.3 Write property test for paddle rendered differently when Wide_Paddle is active (Property 20)
    - **Property 20: Paddle rendered differently when Wide_Paddle is active**
    - **Validates: Requirements 7.3**

  - [ ]* 6.4 Write property test for balls rendered differently when Slow_Ball is active (Property 21)
    - **Property 21: Balls rendered differently when Slow_Ball is active**
    - **Validates: Requirements 7.4**

- [x] 7. Wire PowerUpManager into Game orchestrator
  - Instantiate `PowerUpManager` in `Game` constructor
  - Set `powerUpManager.onCollect = (type) => this._engine.applyPowerUp(type)`
  - Set `engine.onBrickDestroyed = (brick) => this._powerUpManager.onBrickDestroyed(brick)` (hook into `_checkBrickCollisions`)
  - Call `this._powerUpManager.update(dt, engine.getPaddleState())` in the game loop
  - Call `this._powerUpManager.clearTokens()` on BALL_LOST and level transitions
  - Pass `powerUpManager` to `renderer.render(state, engine, powerUpManager)`
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 7.1 Write unit tests for Game wiring
    - Test `onBrickDestroyed` callback connects GameEngine to PowerUpManager
    - Test `onCollect` triggers `applyPowerUp` on GameEngine
    - Test `clearTokens` called on BALL_LOST and level transition
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use fast-check; each test must include the comment tag `// Feature: random-power-ups, Property N: <text>`
- Unit tests live in `tests/random-power-ups.unit.test.js`, property tests in `tests/random-power-ups.property.test.js`
- All code changes are confined to the `<script>` block in `game.html`
