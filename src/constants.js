/**
 * GameState enum — all possible states of the game state machine.
 */
export const GameState = {
  START_SCREEN:     'START_SCREEN',
  PLAYING:          'PLAYING',
  PAUSED:           'PAUSED',
  BALL_LOST:        'BALL_LOST',
  LEVEL_TRANSITION: 'LEVEL_TRANSITION',
  GAME_OVER:        'GAME_OVER',
  VICTORY:          'VICTORY',
};

/**
 * Default game configuration values.
 * @type {import('./types').GameConfig}
 */
export const GameConfig = {
  canvasWidth:          800,
  canvasHeight:         600,
  ballRadius:           8,
  ballInitialSpeed:     0.5,   // pixels/ms
  ballSpeedIncrement:   0.02,  // added per level
  paddleWidth:          100,
  paddleHeight:         12,
  paddleSpeed:          0.5,   // pixels/ms
  brickRows:            7,     // max rows (varies per level)
  brickCols:            10,
  brickPadding:         4,
  brickOffsetTop:       60,
  brickOffsetLeft:      30,
  levelCompletionBonus: 500,
  totalLevels:          10,
};
