'use strict';

/**
 * @readonly
 * @const
 * @enum {number}
 */
export const TeamID = {
	Spectators: 0,
	RedTeam: 1,
	BlueTeam: 2,
};

/**
 * The maximum distance of the ball from the player, that player is able to kick the ball.
 *
 * @const {number}
 */
export const KICKABLE_BALL_THRESHOLD = 4.0;

/**
 * The maximum distance of the ball from the player, that ball is considered as touched by player.
 *
 * @const {number}
 */
export const TOUCHED_BALL_THRESHOLD = KICKABLE_BALL_THRESHOLD / 2.0;

/**
 * In milliseconds.
 *
 * @const {number}
 */
export const ASSIST_VALID_FOR = 5 * 1000;

/**
 * How long does "Red/Blue Scores!" text is being displayed (in milliseconds).
 *
 * @const {number}
 */
export const DISPLAY_TIME_SCORED = 2.5 * 1000;

/**
 * How long does "Red/Blue Scores! Red/Blue team is victorious" text is being displayed (in milliseconds).
 *
 * @const {number}
 */
export const DISPLAY_TIME_SCORED_AND_VICTORIOUS = 5 * 1000;
