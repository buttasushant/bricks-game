# Level Speed Increase Bugfix Design

## Overview

The ball's initial speed at Level 1 is `0.3` pixels/ms, which feels sluggish and unengaging.
The fix is a single-value change: increase `ballInitialSpeed` in `src/constants.js` from `0.3`
to `0.5`. Because all per-level speed calculations derive from this constant, the fix
automatically propagates to every level without touching the speed-scaling logic.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — `initLevel` is called with any
  level index while `ballInitialSpeed` is still `0.3`, producing a base speed that is too slow
- **Property (P)**: The desired behavior — Level 1 launches the ball at `≥ 0.5` pixels/ms
- **Preservation**: The per-level speed-increment formula and all other game behaviors that must
  remain unchanged by the fix
- **ballInitialSpeed**: The constant in `src/constants.js` that sets the base ball speed for
  Level 1 (currently `0.3`, target `0.5`)
- **ballSpeedIncrement**: The constant (`0.02`) added per level above Level 1
- **_levelSpeed**: The field in `GameEngine` computed as
  `ballInitialSpeed + (levelIndex - 1) * ballSpeedIncrement`
- **initLevel(n)**: The `GameEngine` method that computes `_levelSpeed` and resets the board
- **launchBall()**: The `GameEngine` method that applies `_levelSpeed` to the ball's velocity

## Bug Details

### Bug Condition

The bug manifests whenever `initLevel` is called (at game start, after a level transition, or
after a restart) because `_levelSpeed` is computed from the too-low `ballInitialSpeed` constant.
Every subsequent `launchBall()` call uses this under-speed value.

**Formal Specification:**
```
FUNCTION isBugCondition(config)
  INPUT: config of type GameConfig
  OUTPUT: boolean

  RETURN config.ballInitialSpeed < 0.5
END FUNCTION
```

### Examples

- Level 1 launch: `_levelSpeed = 0.3 + (1-1)*0.02 = 0.3` → ball moves at 0.3 px/ms (too slow)
- Level 2 launch: `_levelSpeed = 0.3 + (2-1)*0.02 = 0.32` → still slow relative to expectation
- After fix, Level 1: `_levelSpeed = 0.5 + 0 = 0.5` → ball moves at 0.5 px/ms (correct)
- After fix, Level 2: `_levelSpeed = 0.5 + 0.02 = 0.52` → speed progression preserved

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Speed progression formula `ballInitialSpeed + (n-1) * ballSpeedIncrement` must remain intact
- `launchBall()` must continue to launch at a 45-degree angle with the correct speed magnitude
- Restart must continue to reset to Level 1 and apply the (updated) base speed correctly
- All other `GameConfig` values (paddle speed, brick layout, lives, scoring) must be unaffected

**Scope:**
All game behavior that does NOT depend on `ballInitialSpeed` is completely unaffected.
This includes:
- Paddle movement and collision response
- Brick collision detection and scoring
- Ball-loss detection and life decrement
- Level-completion bonus and victory condition

## Hypothesized Root Cause

Based on the bug description and code review, there is one clear root cause:

1. **Hardcoded low constant**: `ballInitialSpeed` in `src/constants.js` is set to `0.3`.
   `GameEngine.initLevel` reads this value directly:
   ```js
   this._levelSpeed = cfg.ballInitialSpeed + (levelIndex - 1) * cfg.ballSpeedIncrement;
   ```
   There is no secondary computation or override — the constant is the sole source of the
   base speed. Increasing it to `0.5` is the complete fix.

2. **No other contributing factors**: The speed-scaling formula is correct, `launchBall()`
   correctly uses `_levelSpeed`, and the angle calculation is correct. The bug is isolated
   entirely to the constant's value.

## Correctness Properties

Property 1: Bug Condition - Level 1 Ball Speed Is Fast Enough

_For any_ `GameConfig` where `isBugCondition(config)` returns false (i.e.,
`ballInitialSpeed >= 0.5`), calling `initLevel(1)` followed by `launchBall()` SHALL produce
a ball whose speed magnitude equals `ballInitialSpeed` (≥ 0.5 px/ms), making gameplay feel
responsive from the start.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Per-Level Speed Progression Is Unchanged

_For any_ level index `n` (1–10), the fixed code SHALL compute `_levelSpeed` as
`ballInitialSpeed + (n - 1) * ballSpeedIncrement`, preserving the same relative speed
differences between levels as before the fix.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

**File**: `src/constants.js`

**Specific Changes**:
1. **Update `ballInitialSpeed`**: Change the value from `0.3` to `0.5`
   ```js
   // Before
   ballInitialSpeed: 0.3,   // pixels/ms

   // After
   ballInitialSpeed: 0.5,   // pixels/ms
   ```

No other files require changes. `GameEngine` already reads `cfg.ballInitialSpeed` dynamically,
so the fix propagates automatically to `initLevel` and `launchBall`.

## Testing Strategy

### Validation Approach

Two-phase approach: first confirm the bug exists on unfixed code, then verify the fix and
preservation of speed-progression behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface a counterexample showing Level 1 speed is below the acceptable threshold
on the UNFIXED code, confirming the root cause.

**Test Plan**: Instantiate `GameEngine` with the current (unfixed) `GameConfig`, call
`initLevel(1)` and `launchBall()`, then assert the ball speed magnitude is `>= 0.5`.
This test WILL FAIL on unfixed code, confirming the bug.

**Test Cases**:
1. **Level 1 speed too slow**: `initLevel(1)` + `launchBall()` → assert speed `>= 0.5`
   (will fail on unfixed code, speed is `0.3`)
2. **Level 2 speed too slow**: `initLevel(2)` + `launchBall()` → assert speed `>= 0.52`
   (will fail on unfixed code, speed is `0.32`)

**Expected Counterexamples**:
- Ball speed magnitude at Level 1 is `0.3`, below the `0.5` threshold
- Root cause confirmed: `ballInitialSpeed` constant is `0.3`

### Fix Checking

**Goal**: Verify that after the fix, Level 1 (and all levels) launch the ball at the correct speed.

**Pseudocode:**
```
FOR ALL levelIndex IN [1..10] WHERE isBugCondition(config) = false DO
  engine.initLevel(levelIndex)
  engine.launchBall()
  ball := engine.getBallState()
  speed := sqrt(ball.vx^2 + ball.vy^2)
  expectedSpeed := config.ballInitialSpeed + (levelIndex - 1) * config.ballSpeedIncrement
  ASSERT speed ≈ expectedSpeed
  ASSERT speed >= 0.5
END FOR
```

### Preservation Checking

**Goal**: Verify that the speed-increment formula produces the same relative differences
between levels before and after the fix.

**Pseudocode:**
```
FOR ALL levelIndex IN [1..10] DO
  speedBefore := 0.3 + (levelIndex - 1) * 0.02
  speedAfter  := 0.5 + (levelIndex - 1) * 0.02
  ASSERT speedAfter - speedBefore = 0.2   // constant offset, formula unchanged
END FOR
```

**Testing Approach**: Property-based testing is well-suited here because:
- It can generate arbitrary level indices and verify the formula holds for all of them
- It catches any accidental change to the increment logic
- It provides a strong guarantee that only the base value changed

**Test Cases**:
1. **Speed formula preservation**: For all levels 1–10, verify
   `_levelSpeed = ballInitialSpeed + (n-1) * ballSpeedIncrement`
2. **Launch angle preservation**: Verify ball is still launched at 45 degrees after fix
3. **Restart preservation**: Verify `reset()` → `initLevel(1)` applies the updated base speed

### Unit Tests

- Assert Level 1 `_levelSpeed` equals `0.5` after fix
- Assert Level 2 `_levelSpeed` equals `0.52` after fix
- Assert `launchBall()` speed magnitude matches `_levelSpeed` for each level
- Assert ball launch angle remains 45 degrees (vx ≈ vy in magnitude)

### Property-Based Tests

- For all level indices 1–10: `_levelSpeed = ballInitialSpeed + (n-1) * ballSpeedIncrement`
- For all level indices 1–10: speed magnitude after `launchBall()` matches `_levelSpeed`
- For any valid config with `ballInitialSpeed >= 0.5`: Level 1 speed is never below threshold

### Integration Tests

- Full game start → Level 1 ball launches at `0.5` px/ms and feels responsive
- Level 1 → Level 2 transition: speed increases by exactly `ballSpeedIncrement` (0.02)
- Restart after game-over: Level 1 speed resets to `0.5` px/ms correctly
