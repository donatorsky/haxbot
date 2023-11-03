'use strict';

import {PlayersManager}           from '../Players/PlayersManager';
import {AbstractStorage}          from '../Storage/AbstractStorage';
import {ScopedStorage}            from '../Storage/ScopedStorage';
import {ASSIST_VALID_FOR, TeamID} from '../Utils/constants';
import {AbstractGameMode}         from './Modes/AbstractGameMode';
import {BestOfGameMode}           from './Modes/BestOfGameMode';
import {NoopGameMode}             from './Modes/NoopGameMode';
import {RaceToGameMode}           from './Modes/RaceToGameMode';
import {RandomGameMode}           from './Modes/RandomGameMode';

export const GAME_MODES = {
	BO: 'bo',
	RT: 'rt',
	RANDOM: 'random',
};

export class GameManager {

	/**
	 * @return {Array.<GoalInfo>}
	 */
	get goals() {
		return this._goals;
	}

	/**
	 * @param {GoalInfo} data
	 */
	registerGoal(data) {
		this._goals.push(data);
	}

	get ballTouches() {
		if (this._ballTouches.length > 1 && this._ballTouches[1].touchedAt + ASSIST_VALID_FOR < Date.now()) {
			this._ballTouches.pop();
		}

		return this._ballTouches;
	}

	/**
	 * @param {!RoomObject} roomObject
	 * @param {!PlayersManager} playersManager
	 * @param {!AbstractStorage} storage
	 */
	constructor(roomObject, playersManager, storage) {
		/**
		 * @type {!RoomObject}
		 * @private
		 */
		this._roomObject = roomObject;

		/**
		 * @type {!PlayersManager}
		 * @private
		 */
		this._playersManager = playersManager;

		/**
		 * @type {!ScopedStorage<number>}
		 * @private
		 */
		this._storage = new ScopedStorage(storage, 'game.');

		/**
		 * @type {Array.<GoalInfo>}
		 * @private
		 */
		this._goals = [];

		/**
		 * @type {!AbstractGameMode}
		 * @private
		 */
		this._modeObject = new NoopGameMode(roomObject);

		/**
		 * @type {Array.<BallTouchInfo>}
		 * @private
		 */
		this._ballTouches = [];

		if (!this._storage.has('score-limit')) {
			this.setScoreLimit(3);
		}

		if (!this._storage.has('time-limit')) {
			this.setTimeLimit(3);
		}
	}

	/**
	 * @return {number}
	 */
	getScoreLimit() {
		return this._storage.get('score-limit') ?? 3;
	}

	/**
	 * @param {number} limit Must be greater than or equal to 0
	 *
	 * @throws {Error} When score limit is less than 0
	 */
	setScoreLimit(limit) {
		if (limit < 0) {
			throw new Error(`The score limit cannot be less than 0, ${limit} provided`);
		}

		this._storage.set('score-limit', limit);
	}

	/**
	 * @return {number}
	 */
	getTimeLimit() {
		return this._storage.get('time-limit') ?? 3;
	}

	/**
	 * @param {number} limit Must be greater than or equal to 0
	 *
	 * @throws {Error} When time limit is less than 0
	 */
	setTimeLimit(limit) {
		if (limit < 0) {
			throw new Error(`The time limit cannot be less than 0, ${limit} provided`);
		}

		this._storage.set('time-limit', limit);
	}

	/**
	 * @param {PlayerObject} player
	 */
	registerBallTouch(player) {
		const playerId = this._playersManager.getPlayerAuth(player);

		if (0 === this._ballTouches.length) {
			this._ballTouches.push(new BallTouchInfo(playerId));

			return;
		}

		if (this._ballTouches[0].playerId === playerId) {
			return;
		}

		if (this._ballTouches.unshift(new BallTouchInfo(playerId)) > 2) {
			this._ballTouches.pop();
		}
	}

	resetBallTouches() {
		this._ballTouches = [];
	}

	/**
	 * @param {string}                   mode
	 * @param {!Object.<string, string>} args
	 *
	 * @throws {Error} When desired game mode does not exist or could not be started
	 */
	start(mode, args) {
		if ('previous' !== mode) {
			switch (mode) {
				case GAME_MODES.BO:
					this._modeObject = new BestOfGameMode(this._roomObject, args);
					break;

				case GAME_MODES.RT:
					this._modeObject = new RaceToGameMode(this._roomObject, args);
					break;

				case GAME_MODES.RANDOM:
					this._modeObject = new RandomGameMode(this._roomObject, args);
					break;

				default:
					throw new Error(`Unknown game mode: ${mode}`);
			}
		}

		this._modeObject.start();
	}

	restart() {
		this._modeObject.restart();
	}

	/**
	 * @param {!ScoresObject} scores
	 */
	registerVictory(scores) {
		this._modeObject.registerVictory(scores);
	}

	stop() {
		this._goals = [];

		this.resetBallTouches();
	}

	end() {
		this.stop();

		this._modeObject.stop();

		this._modeObject = new NoopGameMode(this._roomObject);
	}
}

export class GoalInfo {

	constructor(goalBy, assistBy, scoredAt, byTeam) {
		/**
		 * @type {string}
		 * @private
		 */
		this._goalBy = goalBy;

		/**
		 * @type {?string}
		 * @private
		 */
		this._assistBy = assistBy;

		/**
		 * @type {number}
		 * @private
		 */
		this._scoredAt = scoredAt;

		/**
		 * @type {TeamID}
		 * @private
		 */
		this._byTeam = byTeam;
	}

	/**
	 * @return {string}
	 */
	get goalBy() {
		return this._goalBy;
	}

	/**
	 * @return {?string}
	 */
	get assistBy() {
		return this._assistBy;
	}

	/**
	 * @return {number}
	 */
	get scoredAt() {
		return this._scoredAt;
	}

	/**
	 * @return {TeamID}
	 */
	get byTeam() {
		return this._byTeam;
	}
}

class BallTouchInfo {
	/**
	 * @return {string}
	 */
	get playerId() {
		return this._playerId;
	}

	/**
	 * @return {number}
	 */
	get touchedAt() {
		return this._touchedAt;
	}

	/**
	 * @param {string} playerId
	 */
	constructor(playerId) {
		/**
		 * @type {string}
		 * @private
		 */
		this._playerId = playerId;

		/**
		 * @type {number}
		 * @private
		 */
		this._touchedAt = Date.now();
	}
}
