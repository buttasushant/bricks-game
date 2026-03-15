/**
 * Game — top-level orchestrator that wires GameEngine, Renderer, and InputHandler
 * and drives the game state machine.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 8.1-8.5, 9.2, 10.1, 10.3
 */
import { GameConfig, GameState } from './constants.js';
import { GameEngine } from './GameEngine.js';
import { Renderer } from './Renderer.js';
import { InputHandler } from './InputHandler.js';

export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this._canvas = canvas;

    // Ensure canvas dimensions match config
    canvas.width  = GameConfig.canvasWidth;
    canvas.height = GameConfig.canvasHeight;

    this._config  = GameConfig;
    this._engine  = new GameEngine(GameConfig);
    this._renderer = new Renderer(canvas.getContext('2d'), GameConfig);
    this._input   = new InputHandler(canvas);

    // Wire input into engine
    this._engine.setInputHandler(this._input);

    this._state = GameState.START_SCREEN;

    // Level-transition metadata
    this._levelTransitionTime    = null; // timestamp when LEVEL_TRANSITION was entered
    this._levelTransitionVictory = false; // whether we entered via a victory condition

    // Track last frame timestamp for dt calculation
    this._lastTimestamp = null;

    // Bind the loop so we can pass it to rAF
    this._loop = this._loop.bind(this);

    // Canvas click handler for start / relaunch
    this._onCanvasClick = this._onCanvasClick.bind(this);
    canvas.addEventListener('click', this._onCanvasClick);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** @returns {string} current GameState value */
  getState() {
    return this._state;
  }

  /**
   * Transition to a new game state.
   * Records a timestamp when entering LEVEL_TRANSITION.
   * @param {string} newState
   */
  setState(newState) {
    this._state = newState;

    if (newState === GameState.LEVEL_TRANSITION) {
      this._levelTransitionTime = performance.now();
    }
  }

  /**
   * Full reset: score → 0, lives → 3, level → 1, state → START_SCREEN.
   */
  reset() {
    this._engine.setScore(0);
    this._engine.setLives(3);
    this._engine.initLevel(1);
    this.setState(GameState.START_SCREEN);
  }

  /** Begin the requestAnimationFrame game loop. */
  start() {
    this._lastTimestamp = null;
    requestAnimationFrame(this._loop);
  }

  // ---------------------------------------------------------------------------
  // Game loop
  // ---------------------------------------------------------------------------

  /**
   * @param {DOMHighResTimeStamp} timestamp
   */
  _loop(timestamp) {
    // Compute delta time (cap at 100ms to avoid spiral-of-death on tab switch)
    const dt = this._lastTimestamp === null
      ? 16
      : Math.min(timestamp - this._lastTimestamp, 100);
    this._lastTimestamp = timestamp;

    const state = this._state;

    // 1. Snapshot input
    this._input.update();

    // 2. Pause / resume toggle (Escape or 'p')
    if (state === GameState.PLAYING &&
        (this._input.wasKeyPressed('Escape') || this._input.wasKeyPressed('p'))) {
      this.setState(GameState.PAUSED);
    } else if (state === GameState.PAUSED &&
               (this._input.wasKeyPressed('Escape') || this._input.wasKeyPressed('p'))) {
      this.setState(GameState.PLAYING);
    }

    // 3. Advance physics only when actively playing
    const activeState = this._state; // may have changed above
    if (activeState === GameState.PLAYING) {
      this._engine.update(dt);
    }

    // 4. State-specific transition checks
    this._checkStateTransitions(timestamp);

    // 5. Render
    this._renderer.render(this._state, this._engine);

    // 6. Schedule next frame
    requestAnimationFrame(this._loop);
  }

  // ---------------------------------------------------------------------------
  // State transition logic
  // ---------------------------------------------------------------------------

  /**
   * @param {DOMHighResTimeStamp} timestamp
   */
  _checkStateTransitions(timestamp) {
    const state = this._state;

    if (state === GameState.PLAYING) {
      // Ball lost?
      if (this._engine.isBallLost()) {
        this._engine.clearBallLost();
        if (this._engine.isGameOver()) {
          this.setState(GameState.GAME_OVER);
        } else {
          this.setState(GameState.BALL_LOST);
        }
        return;
      }

      // Level complete?
      if (this._engine.isLevelComplete()) {
        if (this._engine.isVictory()) {
          this._levelTransitionVictory = true;
        } else {
          this._levelTransitionVictory = false;
        }
        this.setState(GameState.LEVEL_TRANSITION);
        return;
      }
    }

    if (state === GameState.LEVEL_TRANSITION) {
      const elapsed = timestamp - this._levelTransitionTime;
      if (elapsed >= 2000) {
        if (this._levelTransitionVictory) {
          this.setState(GameState.VICTORY);
        } else {
          const nextLevel = this._engine.getCurrentLevel() + 1;
          this._engine.initLevel(nextLevel);
          this._engine.launchBall();
          this.setState(GameState.PLAYING);
        }
      }
      return;
    }

    if (state === GameState.START_SCREEN) {
      if (this._input.wasKeyPressed(' ')) {
        this._startGame();
      }
      return;
    }

    if (state === GameState.BALL_LOST) {
      if (this._input.wasKeyPressed(' ')) {
        this._engine.launchBall();
        this.setState(GameState.PLAYING);
      }
      return;
    }

    if (state === GameState.GAME_OVER || state === GameState.VICTORY) {
      if (this._input.wasKeyPressed('r') || this._input.wasKeyPressed('R')) {
        this.reset();
      }
      return;
    }
  }

  // ---------------------------------------------------------------------------
  // Canvas click handler
  // ---------------------------------------------------------------------------

  _onCanvasClick() {
    const state = this._state;
    if (state === GameState.START_SCREEN) {
      this._startGame();
    } else if (state === GameState.BALL_LOST) {
      this._engine.launchBall();
      this.setState(GameState.PLAYING);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  _startGame() {
    this._engine.initLevel(1);
    this.setState(GameState.PLAYING);
    this._engine.launchBall();
  }
}
