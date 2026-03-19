# Requirements Document

## Introduction

This feature adds randomly spawning power-ups to the Bricks Game. When a Brick is destroyed, there is a chance a power-up token falls from the Brick's position toward the Paddle. If the player catches the token with the Paddle, the associated effect is applied immediately. Power-ups introduce variety and strategic depth across all 10 levels.

## Glossary

- **Power_Up**: A collectible token that falls from a destroyed Brick and grants a temporary or one-time effect when caught by the Paddle
- **Power_Up_Type**: The category of a Power_Up that determines its effect (e.g., Multi_Ball, Extra_Life, Wide_Paddle, Slow_Ball)
- **Multi_Ball**: A Power_Up_Type that duplicates the current active Ball(s), doubling the number of balls in play
- **Extra_Life**: A Power_Up_Type that grants the player one additional Life
- **Wide_Paddle**: A Power_Up_Type that temporarily increases the Paddle's width for a fixed duration
- **Slow_Ball**: A Power_Up_Type that temporarily reduces all active Balls' speed for a fixed duration
- **Power_Up_Manager**: The module responsible for spawning, updating, and applying Power_Ups
- **Game_Engine**: The core logic module responsible for physics, collision detection, and game state (existing)
- **Renderer**: The module responsible for drawing all game elements onto the canvas (existing)
- **Ball**: The moving projectile that bounces around the play area and destroys bricks (existing)
- **Paddle**: The player-controlled horizontal bar at the bottom of the play area (existing)
- **Brick**: A rectangular block that is destroyed when hit by the Ball (existing)
- **Lives**: The number of remaining attempts the player has before the game ends (existing)
- **Play_Area**: The bounded rectangular canvas where gameplay occurs (existing)

## Requirements

### Requirement 1: Power-Up Spawning

**User Story:** As a player, I want power-ups to occasionally drop from destroyed bricks, so that gameplay feels rewarding and unpredictable.

#### Acceptance Criteria

1. WHEN a Brick is destroyed, THE Power_Up_Manager SHALL spawn a Power_Up token at the Brick's position with a 20% probability.
2. WHEN a Power_Up is spawned, THE Power_Up_Manager SHALL assign it a Power_Up_Type chosen uniformly at random from all available Power_Up_Types.
3. WHEN a Power_Up is spawned, THE Power_Up_Manager SHALL move the Power_Up token downward at a constant speed of 0.15 pixels per millisecond.
4. WHEN a Power_Up token reaches the bottom boundary of the Play_Area without being caught, THE Power_Up_Manager SHALL remove the Power_Up token from play with no effect applied.
5. THE Power_Up_Manager SHALL support simultaneous active Power_Up tokens falling at the same time.

---

### Requirement 2: Power-Up Collection

**User Story:** As a player, I want to catch falling power-ups with my paddle, so that I can activate their effects.

#### Acceptance Criteria

1. WHEN a falling Power_Up token overlaps with the Paddle, THE Power_Up_Manager SHALL remove the token from play and apply the Power_Up_Type's effect.
2. WHEN a Power_Up is collected, THE Game_Engine SHALL apply the effect immediately.
3. WHEN a new level begins, THE Power_Up_Manager SHALL remove all active falling Power_Up tokens from play.
4. WHEN the Ball is lost and the game transitions to the BALL_LOST state, THE Power_Up_Manager SHALL remove all active falling Power_Up tokens from play.

---

### Requirement 3: Multi-Ball Power-Up

**User Story:** As a player, I want a power-up that doubles the number of balls, so that I can destroy bricks faster.

#### Acceptance Criteria

1. WHEN the Multi_Ball Power_Up is collected, THE Game_Engine SHALL create one additional Ball for each Ball currently in play, resulting in double the number of active Balls.
2. WHEN multiple Balls are in play and one Ball is lost, THE Game_Engine SHALL remove only that Ball from play without decrementing Lives.
3. WHEN multiple Balls are in play and the last remaining Ball is lost, THE Game_Engine SHALL decrement Lives by 1 and transition to the BALL_LOST state.
4. WHEN the game transitions to the BALL_LOST state with multiple Balls, THE Game_Engine SHALL remove all Balls and reset to a single Ball at the starting position.

---

### Requirement 4: Extra Life Power-Up

**User Story:** As a player, I want a power-up that grants an extra life, so that I can extend my game session.

#### Acceptance Criteria

1. WHEN the Extra_Life Power_Up is collected, THE Game_Engine SHALL increment Lives by 1.
2. THE Game_Engine SHALL cap Lives at a maximum value of 9 when applying the Extra_Life effect.

---

### Requirement 5: Wide Paddle Power-Up

**User Story:** As a player, I want a power-up that widens my paddle temporarily, so that catching the ball becomes easier for a short time.

#### Acceptance Criteria

1. WHEN the Wide_Paddle Power_Up is collected, THE Game_Engine SHALL increase the Paddle's width to 1.75 times its base width for a duration of 10 seconds.
2. WHEN the Wide_Paddle effect expires, THE Game_Engine SHALL restore the Paddle to its base width.
3. WHEN the Wide_Paddle Power_Up is collected while the Wide_Paddle effect is already active, THE Game_Engine SHALL reset the remaining duration to 10 seconds.
4. WHILE the Wide_Paddle effect is active, THE Game_Engine SHALL keep the Paddle within the Play_Area boundaries.

---

### Requirement 6: Slow Ball Power-Up

**User Story:** As a player, I want a power-up that slows the ball down temporarily, so that I have more time to react.

#### Acceptance Criteria

1. WHEN the Slow_Ball Power_Up is collected, THE Game_Engine SHALL reduce the speed of all active Balls to 50% of their current level speed for a duration of 8 seconds.
2. WHEN the Slow_Ball effect expires, THE Game_Engine SHALL restore all active Balls to the current level's base speed, preserving each Ball's direction.
3. WHEN the Slow_Ball Power_Up is collected while the Slow_Ball effect is already active, THE Game_Engine SHALL reset the remaining duration to 8 seconds.
4. WHEN a new Ball is launched while the Slow_Ball effect is active, THE Game_Engine SHALL apply the reduced speed to the new Ball.

---

### Requirement 7: Power-Up Visual Rendering

**User Story:** As a player, I want power-ups to be visually distinct and clearly labeled, so that I can identify and decide whether to catch them.

#### Acceptance Criteria

1. THE Renderer SHALL draw each falling Power_Up token as a colored capsule with a short text label indicating its type.
2. THE Renderer SHALL use a distinct color for each Power_Up_Type: Multi_Ball in cyan, Extra_Life in green, Wide_Paddle in orange, Slow_Ball in blue.
3. WHILE the Wide_Paddle effect is active, THE Renderer SHALL visually distinguish the Paddle from its default appearance (e.g., using the Wide_Paddle color).
4. WHILE the Slow_Ball effect is active, THE Renderer SHALL visually distinguish active Balls from their default appearance (e.g., using the Slow_Ball color).
5. THE Renderer SHALL draw Power_Up tokens on every animation frame while they are active.

---

### Requirement 8: Power-Up State Persistence Across Levels

**User Story:** As a player, I want to understand how power-up effects behave when a level ends, so that I have consistent expectations.

#### Acceptance Criteria

1. WHEN a Level is completed and the game transitions to the next Level, THE Game_Engine SHALL cancel all active timed Power_Up effects (Wide_Paddle, Slow_Ball) and restore default values.
2. WHEN a Level is completed, THE Game_Engine SHALL reset the Ball count to one Ball for the new Level.
3. WHEN a Level is completed, THE Game_Engine SHALL preserve the Lives count including any Extra_Life bonuses earned during the Level.
