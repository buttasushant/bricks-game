# Implementation Plan: Bricks Game

## Overview

Implement a web-based Breakout/Arkanoid-style game using HTML5 Canvas and vanilla JavaScript (ES6 modules). The implementation follows the architecture defined in the design: Game orchestrator, GameEngine (physics/logic), Renderer (drawing), InputHandler (input), and LevelData (level definitions).

## Tasks

- [x] 1. Project scaffold and core data definitions
  - Create `index.html` with a `<canvas>` element and script entry point
  - Create `src/constants.js` exporting `GameState` enum and default `GameConfig` values
  - Create `src/levels.js` exporting the `LEVELS` array with all 10 level layouts (2D arrays of `{ hp, points } | null`)
  - _Requirements: 1.1, 7.3_

- [x] 2. Implement InputHandler
  - [x] 2.1 Create `src/InputHandler.js` with constructor, `update()`, `getMouseX()`, `isKeyDown(key)`, `wasKeyPressed(key)`, and `destroy()` methods
    - Attach `mousemove`, `keydown`, `keyup` listeners on construction; buffer keydown events for `wasKeyPressed`
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 2.2 Write property test for paddle mouse tracking (Property 1)
    - **Property 1: Paddle mouse tracking**
    - **Validates: Requirements 2.1, 2.4, 2.5**

  - [ ]* 2.3 Write property test for paddle keyboard movement direction (Property 2)
    - **Property 2: Paddle keyboard movement direction**
    - **Validates: Requirements 2.2, 2.3**

- [x] 3. Implement GameEngine — paddle, ball, and physics
  - [x] 3.1 Create `src/GameEngine.js` with constructor accepting `config`; implement `initLevel(levelIndex)` to set up ball, paddle, and bricks from `LevelData`
    - _Requirements: 1.3, 4.1, 7.3_

  - [x] 3.2 Implement paddle movement in `update(dt)`: apply mouse x from InputHandler and keyboard left/right input, clamp to canvas bounds
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.3 Write property test for paddle boundary clamping (Property 3)
    - **Property 3: Paddle boundary clamping**
    - **Validates: Requirements 2.4, 2.5**

  - [x] 3.4 Implement `launchBall()` to give the ball its initial diagonal velocity based on the current level's configured speed
    - _Requirements: 3.1_

  - [ ]* 3.5 Write property test for ball launch speed invariant (Property 4)
    - **Property 4: Ball launch speed invariant**
    - **Validates: Requirements 3.1**

  - [x] 3.6 Implement wall reflection in `update(dt)`: reflect `vx` on left/right walls, reflect `vy` on top wall; clamp ball to boundary to prevent tunneling
    - _Requirements: 3.2_

  - [ ]* 3.7 Write property test for wall reflection preserving speed (Property 5)
    - **Property 5: Wall reflection preserves speed**
    - **Validates: Requirements 3.2**

  - [x] 3.8 Implement paddle collision in `update(dt)`: on contact set `vy` negative; apply edge deflection to `vx` based on contact position in left/right thirds
    - _Requirements: 3.3, 3.4_

  - [ ]* 3.9 Write property test for paddle reflection sending ball upward (Property 6)
    - **Property 6: Paddle reflection sends ball upward**
    - **Validates: Requirements 3.3**

  - [ ]* 3.10 Write property test for paddle edge deflection changing horizontal direction (Property 7)
    - **Property 7: Paddle edge deflection changes horizontal direction**
    - **Validates: Requirements 3.4**

- [x] 4. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement GameEngine — bricks, scoring, and lives
  - [x] 5.1 Implement brick collision in `update(dt)`: detect ball–brick AABB overlap, decrement `hp` or set `active = false`, reflect ball trajectory
    - _Requirements: 3.5, 4.2, 4.3_

  - [ ]* 5.2 Write property test for brick hp decrement on hit (Property 8)
    - **Property 8: Brick hp decrement on hit**
    - **Validates: Requirements 4.2, 4.3**

  - [x] 5.3 Implement scoring in `update(dt)`: add `brick.points` to score on destruction; add `levelCompletionBonus` when level clears
    - _Requirements: 4.4, 5.1, 5.3_

  - [ ]* 5.4 Write property test for score increment on brick destruction (Property 9)
    - **Property 9: Score increases by brick point value on destruction**
    - **Validates: Requirements 4.4, 5.1**

  - [x] 5.5 Implement ball-loss detection in `update(dt)`: when `ball.y > canvasHeight`, decrement lives; reset ball and paddle positions; transition to `BALL_LOST` or `GAME_OVER`
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ]* 5.6 Write property test for ball loss decrementing lives (Property 13)
    - **Property 13: Ball loss decrements lives by one**
    - **Validates: Requirements 6.1**

  - [ ]* 5.7 Write property test for ball and paddle reset after ball loss (Property 14)
    - **Property 14: Ball and paddle reset after ball loss**
    - **Validates: Requirements 6.2**

  - [x] 5.8 Implement `isLevelComplete()` and level-transition logic: when all bricks inactive, transition to `LEVEL_TRANSITION` or `VICTORY` on level 10
    - _Requirements: 7.1, 7.4_

  - [ ]* 5.9 Write property test for level transition on all bricks cleared (Property 15)
    - **Property 15: Level transition on all bricks cleared**
    - **Validates: Requirements 7.1**

  - [x] 5.10 Implement per-level ball speed increase in `initLevel`: each level's initial speed = `ballInitialSpeed + (levelIndex * ballSpeedIncrement)`
    - _Requirements: 7.2_

  - [ ]* 5.11 Write property test for ball speed increasing each level (Property 16)
    - **Property 16: Ball speed increases each level**
    - **Validates: Requirements 7.2**

- [x] 6. Implement Renderer
  - [x] 6.1 Create `src/Renderer.js` with constructor accepting `ctx` and `config`; implement `drawBall`, `drawPaddle`, `drawBricks` (color by `maxHp` tier), and `drawHUD`
    - _Requirements: 9.1, 9.3, 4.5_

  - [ ]* 6.2 Write property test for distinct colors per hp tier (Property 11)
    - **Property 11: Distinct colors per hp tier**
    - **Validates: Requirements 4.5, 9.3**

  - [ ]* 6.3 Write property test for HUD always showing current score and lives (Property 12)
    - **Property 12: HUD always shows current score and lives**
    - **Validates: Requirements 5.2, 6.3**

  - [ ]* 6.4 Write property test for render completeness during play (Property 19)
    - **Property 19: Render completeness during play**
    - **Validates: Requirements 9.1**

  - [x] 6.5 Implement `drawStartScreen()`, `drawPauseOverlay()`, `drawLevelTransition(levelNumber)`, `drawGameOver(score)`, and `drawVictory(score)`
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 10.2_

- [x] 7. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Game orchestrator and state machine
  - [x] 8.1 Create `src/Game.js` wiring `GameEngine`, `Renderer`, and `InputHandler`; implement `setState(newState)` and the `requestAnimationFrame` game loop calling `InputHandler.update()`, `GameEngine.update(dt)`, and `Renderer.render()`
    - _Requirements: 1.1, 9.2_

  - [x] 8.2 Implement pause/resume logic in `Game`: toggle between `PLAYING` and `PAUSED` on Escape or pause button; skip `engine.update` when paused
    - _Requirements: 10.1, 10.3_

  - [ ]* 8.3 Write property test for pause freezing ball position (Property 17)
    - **Property 17: Pause freezes ball position**
    - **Validates: Requirements 10.1**

  - [ ]* 8.4 Write property test for pause-unpause round trip preserving state (Property 18)
    - **Property 18: Pause-unpause round trip preserves state**
    - **Validates: Requirements 10.3**

  - [x] 8.5 Implement restart logic in `Game.reset()`: reset score, lives, level to initial values and transition to `START_SCREEN`
    - _Requirements: 8.4_

  - [x] 8.6 Implement level-transition delay: on entering `LEVEL_TRANSITION`, show the next level screen for ~2 seconds then call `initLevel` and resume `PLAYING`
    - _Requirements: 8.5_

- [x] 9. Implement LevelData validation and unit tests
  - [x] 9.1 Write unit tests covering: game initialization (score=0, lives=3, state=START_SCREEN), `LEVELS.length == 10`, all layouts non-empty and distinct, state transitions (start→playing, playing→paused→playing, playing→game-over, playing→victory), level-completion bonus, restart resets all state
    - _Requirements: 1.2, 1.4, 7.3, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 9.2 Write property test for brick grid layout invariant (Property 10)
    - **Property 10: Brick grid layout invariant**
    - **Validates: Requirements 4.1_**

- [x] 10. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests should use **fast-check** with a minimum of 100 iterations per test
- Each property test must include a comment: `// Feature: bricks-game, Property N: <property_text>`
- Checkpoints ensure incremental validation before wiring everything together
