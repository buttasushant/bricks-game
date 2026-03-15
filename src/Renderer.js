import { GameState } from './constants.js';

/**
 * Renderer — stateless drawing module for the Bricks game.
 * Given game state, draws a complete frame onto the canvas context.
 */
export class Renderer {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {import('./constants').GameConfig} config
   */
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
  }

  // ---------------------------------------------------------------------------
  // Game element drawing
  // ---------------------------------------------------------------------------

  /** Draw the ball as a filled cyan circle. */
  drawBall(ball) {
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.fill();
    ctx.closePath();
  }

  /** Draw the paddle as a filled white rounded rectangle. */
  drawPaddle(paddle) {
    const { ctx } = this;
    const r = paddle.height / 2;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, r);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
  }

  /** Draw all active bricks, colored by maxHp tier with opacity based on current hp. */
  drawBricks(bricks) {
    const { ctx } = this;
    const tierColors = {
      1: '#4caf50', // green
      2: '#ff9800', // orange
      3: '#f44336', // red
    };

    for (const brick of bricks) {
      if (!brick.active) continue;

      const baseColor = tierColors[brick.maxHp] ?? '#4caf50';
      const opacity = 0.4 + 0.6 * (brick.hp / brick.maxHp);

      ctx.globalAlpha = opacity;
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
      ctx.fill();

      // Subtle border
      ctx.globalAlpha = opacity * 0.6;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
    }

    ctx.globalAlpha = 1;
  }

  /** Draw score, lives, and level in the HUD area at the top of the canvas. */
  drawHUD(score, lives, level) {
    const { ctx, config } = this;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textBaseline = 'top';

    // Score — left
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 12, 10);

    // Level — center
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${level}`, config.canvasWidth / 2, 10);

    // Lives — right
    ctx.textAlign = 'right';
    ctx.fillText(`LIVES: ${lives}`, config.canvasWidth - 12, 10);

    // Separator line
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.lineTo(config.canvasWidth, 34);
    ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // Screen overlays
  // ---------------------------------------------------------------------------

  /** Dark overlay with game title and start prompt. */
  drawStartScreen() {
    const { ctx, config } = this;
    const cx = config.canvasWidth / 2;
    const cy = config.canvasHeight / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 72px monospace';
    ctx.fillText('BRICKS', cx, cy - 50);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '20px monospace';
    ctx.fillText('Click or press SPACE to start', cx, cy + 20);
  }

  /** Semi-transparent overlay with PAUSED text. */
  drawPauseOverlay() {
    const { ctx, config } = this;
    const cx = config.canvasWidth / 2;
    const cy = config.canvasHeight / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px monospace';
    ctx.fillText('PAUSED', cx, cy - 20);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '18px monospace';
    ctx.fillText('Press ESC to resume', cx, cy + 30);
  }

  /** Dark overlay showing the upcoming level number. */
  drawLevelTransition(levelNumber) {
    const { ctx, config } = this;
    const cx = config.canvasWidth / 2;
    const cy = config.canvasHeight / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.82)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px monospace';
    ctx.fillText(`LEVEL ${levelNumber}`, cx, cy - 20);

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '22px monospace';
    ctx.fillText('Get ready!', cx, cy + 40);
  }

  /** Dark overlay with game over message and final score. */
  drawGameOver(score) {
    const { ctx, config } = this;
    const cx = config.canvasWidth / 2;
    const cy = config.canvasHeight / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#f44336';
    ctx.font = 'bold 64px monospace';
    ctx.fillText('GAME OVER', cx, cy - 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '26px monospace';
    ctx.fillText(`Score: ${score}`, cx, cy + 10);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '18px monospace';
    ctx.fillText('Press R to restart', cx, cy + 55);
  }

  /** Dark overlay with victory message and final score. */
  drawVictory(score) {
    const { ctx, config } = this;
    const cx = config.canvasWidth / 2;
    const cy = config.canvasHeight / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 64px monospace';
    ctx.fillText('YOU WIN!', cx, cy - 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '26px monospace';
    ctx.fillText(`Score: ${score}`, cx, cy + 10);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '18px monospace';
    ctx.fillText('Press R to restart', cx, cy + 55);
  }

  // ---------------------------------------------------------------------------
  // Main render entry point
  // ---------------------------------------------------------------------------

  /**
   * Clear the canvas and draw the appropriate frame for the current game state.
   * @param {string} gameState  — one of the GameState enum values
   * @param {import('./GameEngine').GameEngine} engine
   */
  render(gameState, engine) {
    const { ctx, config } = this;

    // Always clear with dark background
    ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    switch (gameState) {
      case GameState.PLAYING: {
        this.drawBricks(engine.getBricks());
        this.drawBall(engine.getBallState());
        this.drawPaddle(engine.getPaddleState());
        this.drawHUD(engine.getScore(), engine.getLives(), engine.getCurrentLevel());
        break;
      }

      case GameState.PAUSED: {
        this.drawBricks(engine.getBricks());
        this.drawBall(engine.getBallState());
        this.drawPaddle(engine.getPaddleState());
        this.drawHUD(engine.getScore(), engine.getLives(), engine.getCurrentLevel());
        this.drawPauseOverlay();
        break;
      }

      case GameState.BALL_LOST: {
        this.drawBricks(engine.getBricks());
        this.drawPaddle(engine.getPaddleState());
        this.drawHUD(engine.getScore(), engine.getLives(), engine.getCurrentLevel());
        this._drawBallLostMessage();
        break;
      }

      case GameState.LEVEL_TRANSITION: {
        this.drawLevelTransition(engine.getCurrentLevel());
        break;
      }

      case GameState.GAME_OVER: {
        this.drawGameOver(engine.getScore());
        break;
      }

      case GameState.VICTORY: {
        this.drawVictory(engine.getScore());
        break;
      }

      case GameState.START_SCREEN:
      default: {
        this.drawStartScreen();
        break;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** "Ball Lost" prompt shown while waiting for the player to relaunch. */
  _drawBallLostMessage() {
    const { ctx, config } = this;
    const cx = config.canvasWidth / 2;
    const cy = config.canvasHeight / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ff9800';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('Ball Lost', cx, cy - 20);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '20px monospace';
    ctx.fillText('Press SPACE to continue', cx, cy + 25);
  }
}
