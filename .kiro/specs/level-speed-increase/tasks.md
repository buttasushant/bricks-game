# Implementation Plan

- [-] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Level 1 Ball Speed Too Slow
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing cases: Level 1 and Level 2 launch speeds
  - In `tests/game.test.js`, add a test that calls `initLevel(1)` + `launchBall()` and asserts `sqrt(vx^2 + vy^2) >= 0.5`
  - Also test `initLevel(2)` + `launchBall()` and assert speed `>= 0.52`
  - The bug condition is `isBugCondition(config)` where `config.ballInitialSpeed < 0.5` (from design)
  - Run test on UNFIXED code (`ballInitialSpeed = 0.3`)
  - **EXPECTED OUTCOME**: Test FAILS — speed is `0.3` at Level 1, below the `0.5` threshold
  - Document counterexamples found (e.g., "Level 1 speed is 0.3, expected >= 0.5")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Per-Level Speed Progression Formula
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: on unfixed code, `initLevel(n)` sets `_levelSpeed = 0.3 + (n-1) * 0.02` for all n in 1–10
  - Observe: `launchBall()` produces speed magnitude equal to `_levelSpeed` at 45-degree angle
  - Write property-based test: for all level indices 1–10, verify `_levelSpeed = ballInitialSpeed + (n-1) * ballSpeedIncrement` using the engine's actual config values
  - Write test: for all levels 1–10, verify `sqrt(vx^2 + vy^2)` after `launchBall()` matches `_levelSpeed` (within floating-point tolerance)
  - Write test: verify ball launch angle is 45 degrees (`Math.abs(Math.abs(vx) - Math.abs(vy)) < 1e-9`)
  - Verify all preservation tests PASS on UNFIXED code before proceeding
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Fix for ball initial speed too slow

  - [x] 3.1 Implement the fix
    - In `src/constants.js`, change `ballInitialSpeed` from `0.3` to `0.5`
    - No other files require changes — `GameEngine.initLevel` already reads `cfg.ballInitialSpeed` dynamically
    - _Bug_Condition: isBugCondition(config) where config.ballInitialSpeed < 0.5_
    - _Expected_Behavior: Level 1 launches ball at >= 0.5 px/ms; all levels use ballInitialSpeed + (n-1) * ballSpeedIncrement_
    - _Preservation: Speed progression formula, 45-degree launch angle, restart behavior, and all other GameConfig values remain unchanged_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Level 1 Ball Speed Is Fast Enough
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (speed >= 0.5 at Level 1)
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES — speed is now `0.5` at Level 1 (confirms bug is fixed)
    - _Requirements: 2.1, 2.2_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Per-Level Speed Progression Formula
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS — formula `ballInitialSpeed + (n-1) * ballSpeedIncrement` still holds, only the base value changed
    - Confirm no regressions in angle, formula, or restart behavior

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run the full test suite (`npx vitest --run`)
  - Ensure all tests pass, ask the user if questions arise
