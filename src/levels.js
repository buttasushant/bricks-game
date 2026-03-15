/**
 * Brick descriptor helpers.
 * Points: 1-hp = 10, 2-hp = 20, 3-hp = 30
 */
const b1 = { hp: 1, points: 10 };
const b2 = { hp: 2, points: 20 };
const b3 = { hp: 3, points: 30 };
const __ = null; // empty cell

/**
 * LEVELS — array of 10 level layouts.
 * Each layout is a 2D array [row][col] of { hp, points } | null.
 * All layouts use exactly 10 columns (brickCols = 10).
 */
export const LEVELS = [
  // ─── Level 1: 3 rows, all 1-hp bricks, simple full grid ───────────────────
  [
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
  ],

  // ─── Level 2: 4 rows, all 1-hp bricks ─────────────────────────────────────
  [
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
  ],

  // ─── Level 3: 4 rows, mix of 1-hp and 2-hp bricks ─────────────────────────
  [
    [b2, b2, b2, b2, b2, b2, b2, b2, b2, b2],
    [b2, b1, b1, b1, b1, b1, b1, b1, b1, b2],
    [b1, b2, b1, b1, b1, b1, b1, b1, b2, b1],
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
  ],

  // ─── Level 4: 5 rows, checkerboard of 1-hp and 2-hp bricks ────────────────
  [
    [b2, b1, b2, b1, b2, b1, b2, b1, b2, b1],
    [b1, b2, b1, b2, b1, b2, b1, b2, b1, b2],
    [b2, b1, b2, b1, b2, b1, b2, b1, b2, b1],
    [b1, b2, b1, b2, b1, b2, b1, b2, b1, b2],
    [b2, b1, b2, b1, b2, b1, b2, b1, b2, b1],
  ],

  // ─── Level 5: 5 rows, diamond/pyramid shape with 2-hp bricks ──────────────
  // Pyramid grows from 2 wide at top to 6 wide at bottom, centered
  [
    [__, __, __, __, b2, b2, __, __, __, __],
    [__, __, __, b2, b2, b2, b2, __, __, __],
    [__, __, b2, b2, b2, b2, b2, b2, __, __],
    [__, b2, b2, b2, b2, b2, b2, b2, b2, __],
    [b2, b2, b2, b2, b2, b2, b2, b2, b2, b2],
  ],

  // ─── Level 6: 5 rows, 3-hp bricks introduced in top rows ──────────────────
  [
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
    [b2, b2, b2, b2, b2, b2, b2, b2, b2, b2],
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
  ],

  // ─── Level 7: 6 rows, mixed 1/2/3-hp dense layout ─────────────────────────
  [
    [b3, b3, b2, b2, b3, b3, b2, b2, b3, b3],
    [b3, b2, b1, b2, b3, b3, b2, b1, b2, b3],
    [b2, b1, b2, b3, b2, b2, b3, b2, b1, b2],
    [b2, b2, b3, b1, b2, b2, b1, b3, b2, b2],
    [b1, b2, b2, b2, b1, b1, b2, b2, b2, b1],
    [b1, b1, b1, b2, b2, b2, b2, b1, b1, b1],
  ],

  // ─── Level 8: 6 rows, fortress pattern with 3-hp outer ring ───────────────
  [
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
    [b3, b1, b1, b1, b1, b1, b1, b1, b1, b3],
    [b3, b1, b2, b2, b2, b2, b2, b2, b1, b3],
    [b3, b1, b2, b3, b3, b3, b3, b2, b1, b3],
    [b3, b1, b1, b1, b1, b1, b1, b1, b1, b3],
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
  ],

  // ─── Level 9: 7 rows, sparse high-value bricks + dense low-hp ─────────────
  [
    [b3, __, b3, __, b3, b3, __, b3, __, b3],
    [__, b3, __, b3, __, __, b3, __, b3, __],
    [b2, b2, b2, b2, b2, b2, b2, b2, b2, b2],
    [b1, b2, b1, b2, b1, b1, b2, b1, b2, b1],
    [b2, b1, b2, b1, b2, b2, b1, b2, b1, b2],
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
    [b1, b1, b1, b1, b1, b1, b1, b1, b1, b1],
  ],

  // ─── Level 10: 7 rows, full grid all 3-hp bricks ──────────────────────────
  [
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
    [b3, b3, b3, b3, b3, b3, b3, b3, b3, b3],
  ],
];
