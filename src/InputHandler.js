/**
 * InputHandler — captures keyboard and mouse events and exposes a clean
 * per-frame snapshot to the game loop.
 *
 * Requirements: 2.1, 2.2, 2.3
 */
export class InputHandler {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this._canvas = canvas;

    /** @type {number} Last known mouse x relative to the canvas */
    this._mouseX = 0;

    /** @type {Set<string>} Keys currently held down */
    this._keysDown = new Set();

    /** @type {Set<string>} Keys pressed since last update() call */
    this._keysPressedBuffer = new Set();

    /** @type {Set<string>} Keys available for wasKeyPressed() this frame */
    this._keysPressed = new Set();

    // Bind handlers so we can remove them later
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onKeyDown   = this._onKeyDown.bind(this);
    this._onKeyUp     = this._onKeyUp.bind(this);

    canvas.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('keydown',   this._onKeyDown);
    window.addEventListener('keyup',     this._onKeyUp);
  }

  // -------------------------------------------------------------------------
  // Event listeners
  // -------------------------------------------------------------------------

  /** @param {MouseEvent} e */
  _onMouseMove(e) {
    const rect = this._canvas.getBoundingClientRect();
    this._mouseX = e.clientX - rect.left;
  }

  /** @param {KeyboardEvent} e */
  _onKeyDown(e) {
    this._keysDown.add(e.key);
    this._keysPressedBuffer.add(e.key);
  }

  /** @param {KeyboardEvent} e */
  _onKeyUp(e) {
    this._keysDown.delete(e.key);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Snapshot the buffered keydown events for this frame, then clear the
   * buffer. Called once per game-loop iteration before engine.update().
   */
  update() {
    this._keysPressed = new Set(this._keysPressedBuffer);
    this._keysPressedBuffer.clear();
  }

  /**
   * Returns the last known mouse x position relative to the canvas left edge.
   * @returns {number}
   */
  getMouseX() {
    return this._mouseX;
  }

  /**
   * Returns true while the given key is held down.
   * @param {string} key — e.g. 'ArrowLeft', 'ArrowRight', ' '
   * @returns {boolean}
   */
  isKeyDown(key) {
    return this._keysDown.has(key);
  }

  /**
   * Returns true exactly once per keydown event for the given key.
   * Subsequent calls return false until the key is pressed again.
   * @param {string} key
   * @returns {boolean}
   */
  wasKeyPressed(key) {
    if (this._keysPressed.has(key)) {
      this._keysPressed.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Remove all event listeners. Call when tearing down the game.
   */
  destroy() {
    this._canvas.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('keydown',   this._onKeyDown);
    window.removeEventListener('keyup',     this._onKeyUp);
  }
}
