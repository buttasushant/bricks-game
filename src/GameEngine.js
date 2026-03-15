/**
 * GameEngine — physics, collision detection, scoring, and game rule enforcement.
 *
 * Requirements: 1.3, 2.1-2.5, 3.1-3.4, 4.1, 7.3
 */
import { LEVELS } from './levels.js';

export class GameEngine {
  /**
   * @param {import('./constants').GameConfig} config
   */
  constructor(config) {
    this._config = config;

    this._score = 0;
    this._lives = 3;
    this._currentLevel = 1;

    /** @type {{ x: number, y: number, vx: number, vy: number, radius: number }} */
    this._ball = null;

    /** @type {{ x: number, y: number, width: number, height: number, speed: number }} */
    this._paddle = null;

    /** @type {Array<object>} */
    this._bricks = [];

    /** @type {import('./InputHandler').InputHandler|null} */
    this._inputHandler = null;

    // Track previous mouseX to detect mouse movement
    this._lastMouseX = null;

    // Ball-loss / game-over flags (Task 5.5)
    this._ballLost = false;
    this._gameOver = false;

    // Level completion bonus tracking (Task 5.3)
    this._levelBonusAwarded = false;

    // Per-level ball speed (Task 5.10)
    this._levelSpeed = config.ballInitialSpeed;
  }

  // ---------------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------------

  /**
   * Wire up the InputHandler so update() can read input.
   * @param {import('./InputHandler').InputHandler} inputHandler
   */
  setInputHandler(inputHandler) {
    this._inputHandler = inputHandler;
    this._lastMouseX = inputHandler ? inputHandler.getMouseX() : null;
  }

  /**
   * Load a level by 1-based index, create Brick objects, reset ball and paddle.
   * @param {number} levelIndex — 1-based
   */
  initLevel(levelIndex) {
    if (levelIndex < 1 || levelIndex > LEVELS.length) {
      console.warn(`GameEngine.initLevel: invalid level index ${levelIndex}`);
      return;
    }

    this._currentLevel = levelIndex;
    const layout = LEVELS[levelIndex - 1];
    const cfg = this._config;

    // Task 5.10: compute per-level speed
    this._levelSpeed = cfg.ballInitialSpeed + (levelIndex - 1) * cfg.ballSpeedIncrement;

    // Reset per-level flags
    this._levelBonusAwarded = false;
    this._ballLost = false;
    this._gameOver = false;

    // Compute brick dimensions
    const brickWidth =
      (cfg.canvasWidth - 2 * cfg.brickOffsetLeft - (cfg.brickCols - 1) * cfg.brickPadding) /
      cfg.brickCols;
    const brickHeight = 20;

    // Build brick objects
    this._bricks = [];
    for (let row = 0; row < layout.length; row++) {
      for (let col = 0; col < layout[row].length; col++) {
        const descriptor = layout[row][col];
        if (!descriptor) continue;

        const x = cfg.brickOffsetLeft + col * (brickWidth + cfg.brickPadding);
        const y = cfg.brickOffsetTop + row * (brickHeight + cfg.brickPadding);

        this._bricks.push({
          col,
          row,
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          hp: descriptor.hp,
          maxHp: descriptor.hp,
          points: descriptor.points,
          active: true,
        });
      }
    }

    // Reset paddle to center-bottom
    this._paddle = {
      x: cfg.canvasWidth / 2 - cfg.paddleWidth / 2,
      y: cfg.canvasHeight - 40,
      width: cfg.paddleWidth,
      height: cfg.paddleHeight,
      speed: cfg.paddleSpeed,
    };

    // Reset ball to center-x, just above paddle
    this._ball = {
      x: cfg.canvasWidth / 2,
      y: this._paddle.y - cfg.ballRadius,
      vx: 0,
      vy: 0,
      radius: cfg.ballRadius,
    };

    // Sync mouse tracking baseline
    if (this._inputHandler) {
      this._lastMouseX = this._inputHandler.getMouseX();
    }
  }

  // ---------------------------------------------------------------------------
  // Ball launch
  // ---------------------------------------------------------------------------

  /**
   * Give the ball its initial velocity. No-op if already in motion.
   * Speed increases with level: ballInitialSpeed + (level-1) * ballSpeedIncrement
   */
  launchBall() {
    if (!this._ball) return;
    // Already in motion
    if (this._ball.vx !== 0 || this._ball.vy !== 0) return;

    // Task 5.10: use pre-computed level speed
    const speed = this._levelSpeed;
    const angle = Math.PI / 4; // 45 degrees
    this._ball.vx = speed * Math.cos(angle);
    this._ball.vy = -speed * Math.sin(angle);
  }

  // ---------------------------------------------------------------------------
  // Main update
  // ---------------------------------------------------------------------------

  /**
   * Advance the simulation by dt milliseconds.
   * @param {number} dt — milliseconds since last frame
   */
  update(dt) {
    if (!this._ball || !this._paddle) return;

    this._updatePaddle(dt);
    this._updateBall(dt);
    this._checkBrickCollisions();   // Task 5.1 & 5.3
    this._checkBallLost();          // Task 5.5
    this._checkLevelComplete();     // Task 5.3 (bonus) & 5.8
  }

  // ---------------------------------------------------------------------------
  // Paddle movement (Task 3.2)
  // ---------------------------------------------------------------------------

  _updatePaddle(dt) {
    const input = this._inputHandler;
    const paddle = this._paddle;
    const cfg = this._config;

    if (input) {
      const mouseX = input.getMouseX();

      // Mouse takes priority if it has moved
      if (mouseX !== this._lastMouseX) {
        paddle.x = mouseX - paddle.width / 2;
        this._lastMouseX = mouseX;
      } else {
        // Keyboard movement
        if (input.isKeyDown('ArrowLeft')) {
          paddle.x -= cfg.paddleSpeed * dt;
        }
        if (input.isKeyDown('ArrowRight')) {
          paddle.x += cfg.paddleSpeed * dt;
        }
      }
    }

    // Clamp paddle within canvas
    paddle.x = Math.max(0, Math.min(paddle.x, cfg.canvasWidth - paddle.width));
  }

  // ---------------------------------------------------------------------------
  // Ball movement + wall/paddle collisions (Tasks 3.6, 3.8)
  // ---------------------------------------------------------------------------

  _updateBall(dt) {
    const ball = this._ball;
    const cfg = this._config;

    // Move ball
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // --- Wall reflections (Task 3.6) ---

    // Left wall
    if (ball.x - ball.radius <= 0) {
      ball.vx = Math.abs(ball.vx);
      ball.x = ball.radius;
    }

    // Right wall
    if (ball.x + ball.radius >= cfg.canvasWidth) {
      ball.vx = -Math.abs(ball.vx);
      ball.x = cfg.canvasWidth - ball.radius;
    }

    // Top wall
    if (ball.y - ball.radius <= 0) {
      ball.vy = Math.abs(ball.vy);
      ball.y = ball.radius;
    }

    // --- Paddle collision (Task 3.8) ---
    this._checkPaddleCollision();

    // Validate finite values
    if (!isFinite(ball.x) || !isFinite(ball.y) || !isFinite(ball.vx) || !isFinite(ball.vy)) {
      this._resetBallToStart();
    }
  }

  _checkPaddleCollision() {
    const ball = this._ball;
    const paddle = this._paddle;

    // AABB overlap check
    const ballLeft   = ball.x - ball.radius;
    const ballRight  = ball.x + ball.radius;
    const ballTop    = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;

    const paddleLeft   = paddle.x;
    const paddleRight  = paddle.x + paddle.width;
    const paddleTop    = paddle.y;
    const paddleBottom = paddle.y + paddle.height;

    const overlaps =
      ballRight  > paddleLeft  &&
      ballLeft   < paddleRight &&
      ballBottom > paddleTop   &&
      ballTop    < paddleBottom;

    if (!overlaps) return;

    // Only handle if ball is moving downward (avoid sticking)
    if (ball.vy <= 0) return;

    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

    // Contact position ratio: 0 = left edge, 1 = right edge
    const ratio = (ball.x - paddle.x) / paddle.width;

    if (ratio < 1 / 3) {
      // Left third — deflect left
      ball.vx = -Math.abs(speed) * 0.7;
      ball.vy = -Math.abs(speed) * 0.7;
    } else if (ratio > 2 / 3) {
      // Right third — deflect right
      ball.vx = Math.abs(speed) * 0.7;
      ball.vy = -Math.abs(speed) * 0.7;
    } else {
      // Middle third — keep vx, just negate vy
      ball.vy = -Math.abs(ball.vy);
    }

    // Clamp ball above paddle
    ball.y = paddle.y - ball.radius;
  }

  _resetBallToStart() {
    const cfg = this._config;
    this._ball.x = cfg.canvasWidth / 2;
    this._ball.y = this._paddle.y - cfg.ballRadius;
    this._ball.vx = 0;
    this._ball.vy = 0;
  }

  // ---------------------------------------------------------------------------
  // Brick collision (Task 5.1 & 5.3)
  // ---------------------------------------------------------------------------

  _checkBrickCollisions() {
    const ball = this._ball;

    for (const brick of this._bricks) {
      if (!brick.active) continue;

      // AABB overlap
      const ballLeft   = ball.x - ball.radius;
      const ballRight  = ball.x + ball.radius;
      const ballTop    = ball.y - ball.radius;
      const ballBottom = ball.y + ball.radius;

      const overlapX = ballRight > brick.x && ballLeft < brick.x + brick.width;
      const overlapY = ballBottom > brick.y && ballTop < brick.y + brick.height;

      if (!overlapX || !overlapY) continue;

      // Determine which face was hit by measuring penetration depth
      const overlapLeft   = ballRight  - brick.x;
      const overlapRight  = brick.x + brick.width  - ballLeft;
      const overlapTop    = ballBottom - brick.y;
      const overlapBottom = brick.y + brick.height - ballTop;

      const minOverlapX = Math.min(overlapLeft, overlapRight);
      const minOverlapY = Math.min(overlapTop, overlapBottom);

      if (minOverlapX < minOverlapY) {
        // Hit left or right face — reflect horizontal
        ball.vx = -ball.vx;
      } else {
        // Hit top or bottom face — reflect vertical
        ball.vy = -ball.vy;
      }

      // Decrement hp
      brick.hp -= 1;
      if (brick.hp <= 0) {
        brick.active = false;
        // Task 5.3: award points on destruction
        this._score += brick.points;
      }

      // Only one brick collision per frame
      break;
    }
  }

  // ---------------------------------------------------------------------------
  // Ball-loss detection (Task 5.5)
  // ---------------------------------------------------------------------------

  _checkBallLost() {
    const ball = this._ball;
    const cfg = this._config;

    if (ball.y - ball.radius > cfg.canvasHeight) {
      this._lives -= 1;
      this._ballLost = true;

      // Reset ball and paddle to starting positions
      this._resetBallToStart();
      this._paddle.x = cfg.canvasWidth / 2 - this._paddle.width / 2;

      if (this._lives <= 0) {
        this._gameOver = true;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Level-complete check + bonus (Task 5.3 & 5.8)
  // ---------------------------------------------------------------------------

  _checkLevelComplete() {
    if (!this.isLevelComplete()) return;

    // Award level completion bonus once per level
    if (!this._levelBonusAwarded) {
      this._score += this._config.levelCompletionBonus;
      this._levelBonusAwarded = true;
    }
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  /** @returns {number} */
  getScore() { return this._score; }

  /** @returns {number} */
  getLives() { return this._lives; }

  /** @returns {number} */
  getCurrentLevel() { return this._currentLevel; }

  /**
   * @returns {{ x: number, y: number, vx: number, vy: number, radius: number }}
   */
  getBallState() { return this._ball ? { ...this._ball } : null; }

  /**
   * @returns {{ x: number, y: number, width: number, height: number }}
   */
  getPaddleState() { return this._paddle ? { ...this._paddle } : null; }

  /** @returns {Array<object>} */
  getBricks() { return this._bricks; }

  /** @returns {boolean} */
  isLevelComplete() {
    return this._bricks.length > 0 && this._bricks.every(b => !b.active);
  }

  /** Task 5.8: true when level 10 is complete */
  isVictory() {
    return this.isLevelComplete() && this._currentLevel === this._config.totalLevels;
  }

  /** Task 5.5: true if ball was lost this frame */
  isBallLost() { return this._ballLost; }

  /** Task 5.5: reset the ball-lost flag after the orchestrator handles it */
  clearBallLost() { this._ballLost = false; }

  /** Task 5.5: true when lives have reached 0 */
  isGameOver() { return this._gameOver; }

  /**
   * Convenience accessor used by some renderers.
   * @returns {number}
   */
  getPaddleX() {
    return this._paddle ? this._paddle.x + this._paddle.width / 2 : 0;
  }

  // ---------------------------------------------------------------------------
  // Score / lives mutators (called by Game orchestrator)
  // ---------------------------------------------------------------------------

  /** @param {number} delta */
  addScore(delta) { this._score += delta; }

  decrementLives() { this._lives -= 1; }

  /** @param {number} n */
  setLives(n) { this._lives = n; }

  /** @param {number} n */
  setScore(n) { this._score = n; }
}
