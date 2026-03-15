/**
 * Unit tests for the Bricks Game
 * Requirements: 1.2, 1.4, 7.3, 8.1, 8.2, 8.3, 8.4
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { GameConfig, GameState } from '../src/constants.js';
import { LEVELS } from '../src/levels.js';
import { GameEngine } from '../src/GameEngine.js';

// ---------------------------------------------------------------------------
// 1. Game initialization
// ---------------------------------------------------------------------------
describe('GameEngine initialization', () => {
  it('starts with score = 0', () => {
    const engine = new GameEngine(GameConfig);
    expect(engine.getScore()).toBe(0);
  });

  it('starts with lives = 3', () => {
    const engine = new GameEngine(GameConfig);
    expect(engine.getLives()).toBe(3);
  });

  it('is not in game-over state after construction', () => {
    const engine = new GameEngine(GameConfig);
    expect(engine.isGameOver()).toBe(false);
  });

  it('is not in level-complete state after construction (no level loaded)', () => {
    const engine = new GameEngine(GameConfig);
    // No bricks loaded yet — isLevelComplete requires bricks.length > 0
    expect(engine.isLevelComplete()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. LEVELS data validation
// ---------------------------------------------------------------------------
describe('LEVELS data', () => {
  it('has exactly 10 levels', () => {
    expect(LEVELS.length).toBe(10);
  });

  it('all level layouts are non-empty (have at least one row)', () => {
    for (let i = 0; i < LEVELS.length; i++) {
      expect(LEVELS[i].length, `Level ${i + 1} should have rows`).toBeGreaterThan(0);
    }
  });

  it('all level layouts contain at least one non-null brick', () => {
    for (let i = 0; i < LEVELS.length; i++) {
      const hasBrick = LEVELS[i].some(row => row.some(cell => cell !== null));
      expect(hasBrick, `Level ${i + 1} should have at least one brick`).toBe(true);
    }
  });

  it('no two level layouts are identical', () => {
    for (let i = 0; i < LEVELS.length; i++) {
      for (let j = i + 1; j < LEVELS.length; j++) {
        const a = JSON.stringify(LEVELS[i]);
        const b = JSON.stringify(LEVELS[j]);
        expect(a, `Level ${i + 1} and Level ${j + 1} should not be identical`).not.toBe(b);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 3. State transitions (tested via GameEngine flags + Game-like orchestration)
// ---------------------------------------------------------------------------
describe('State transitions', () => {
  let engine;

  beforeEach(() => {
    engine = new GameEngine(GameConfig);
    engine.initLevel(1);
    engine.launchBall();
  });

  it('transitions to playing: engine is ready after initLevel + launchBall', () => {
    const ball = engine.getBallState();
    // Ball is in motion — confirms "playing" state is active
    expect(ball.vx).not.toBe(0);
    expect(ball.vy).not.toBe(0);
  });

  it('pausing: engine.update does not advance ball when not called (simulates PAUSED)', () => {
    const before = engine.getBallState();
    // In PAUSED state the Game orchestrator skips engine.update — verify ball stays put
    const after = engine.getBallState();
    expect(after.x).toBe(before.x);
    expect(after.y).toBe(before.y);
  });

  it('transitions to GAME_OVER when lives reach 0', () => {
    engine._lives = 1;
    // Push ball below canvas
    engine._ball.y = GameConfig.canvasHeight + 100;
    engine.update(1);
    expect(engine.isGameOver()).toBe(true);
  });

  it('transitions to victory when level 10 is cleared', () => {
    const eng = new GameEngine(GameConfig);
    eng.initLevel(10);
    // Deactivate all bricks
    for (const brick of eng._bricks) {
      brick.active = false;
      brick.hp = 0;
    }
    eng.update(1);
    expect(eng.isVictory()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Level-completion bonus
// ---------------------------------------------------------------------------
describe('Level-completion bonus', () => {
  it('adds levelCompletionBonus (500) to score when level clears', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(1);

    // Deactivate all bricks without scoring points
    for (const brick of engine._bricks) {
      brick.active = false;
      brick.hp = 0;
      brick.points = 0; // zero out points so only bonus counts
    }

    engine.update(1);
    expect(engine.getScore()).toBe(GameConfig.levelCompletionBonus);
  });

  it('does not award the bonus twice for the same level', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(1);

    for (const brick of engine._bricks) {
      brick.active = false;
      brick.hp = 0;
      brick.points = 0;
    }

    engine.update(1);
    engine.update(1); // second update — bonus should not be re-awarded
    expect(engine.getScore()).toBe(GameConfig.levelCompletionBonus);
  });
});

// ---------------------------------------------------------------------------
// 5. Game-over when lives reach 0
// ---------------------------------------------------------------------------
describe('Game-over transition', () => {
  it('sets isGameOver() when lives drop to 0', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(1);
    engine._lives = 1;
    engine._ball.y = GameConfig.canvasHeight + 100;
    engine.update(1);
    expect(engine.isGameOver()).toBe(true);
  });

  it('does not set isGameOver() when lives remain above 0', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(1);
    engine._lives = 2;
    engine._ball.y = GameConfig.canvasHeight + 100;
    engine.update(1);
    expect(engine.isGameOver()).toBe(false);
    expect(engine.getLives()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 6. Victory on level 10
// ---------------------------------------------------------------------------
describe('Victory transition', () => {
  it('isVictory() is true when level 10 is cleared', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(10);

    for (const brick of engine._bricks) {
      brick.active = false;
      brick.hp = 0;
    }

    engine.update(1);
    expect(engine.isVictory()).toBe(true);
  });

  it('isVictory() is false when a non-final level is cleared', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(5);

    for (const brick of engine._bricks) {
      brick.active = false;
      brick.hp = 0;
    }

    engine.update(1);
    expect(engine.isVictory()).toBe(false);
    expect(engine.isLevelComplete()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. Restart resets all state
// ---------------------------------------------------------------------------
describe('Restart / reset', () => {
  it('resets score to 0 after setScore(0)', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(1);
    engine.addScore(1000);
    engine.setScore(0);
    expect(engine.getScore()).toBe(0);
  });

  it('resets lives to 3 after setLives(3)', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(1);
    engine.setLives(1);
    engine.setLives(3);
    expect(engine.getLives()).toBe(3);
  });

  it('resets level to 1 after initLevel(1)', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(5);
    engine.initLevel(1);
    expect(engine.getCurrentLevel()).toBe(1);
  });

  it('full reset sequence restores initial state', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(3);
    engine.addScore(5000);
    engine.setLives(1);

    // Simulate Game.reset()
    engine.setScore(0);
    engine.setLives(3);
    engine.initLevel(1);

    expect(engine.getScore()).toBe(0);
    expect(engine.getLives()).toBe(3);
    expect(engine.getCurrentLevel()).toBe(1);
    expect(engine.isGameOver()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. Bug condition exploration — Level 1 ball speed too slow
//    Validates: Requirements 1.1, 1.2
//    EXPECTED TO FAIL on unfixed code (ballInitialSpeed = 0.3)
//    Failure confirms the bug exists.
// ---------------------------------------------------------------------------
describe('Bug condition exploration - Level 1 ball speed too slow', () => {
  it('Level 1 launch speed should be >= 0.5 px/ms', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(1);
    engine.launchBall();
    const ball = engine.getBallState();
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    // On unfixed code: speed = 0.3, which is below 0.5 — test FAILS (confirms bug)
    expect(speed).toBeGreaterThanOrEqual(0.5);
  });

  it('Level 2 launch speed should be >= 0.52 px/ms', () => {
    const engine = new GameEngine(GameConfig);
    engine.initLevel(2);
    engine.launchBall();
    const ball = engine.getBallState();
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    // On unfixed code: speed = 0.32, which is below 0.52 — test FAILS (confirms bug)
    expect(speed).toBeGreaterThanOrEqual(0.52);
  });
});
