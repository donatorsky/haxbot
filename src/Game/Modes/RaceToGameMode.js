import {DISPLAY_TIME_SCORED} from '../../Utils/constants';
import {AbstractGameMode}    from './AbstractGameMode';

/**
 * @extends {AbstractGameMode}
 */
export class RaceToGameMode extends AbstractGameMode {

	/**
	 * @param {!RoomObject}              roomObject
	 * @param {!Object.<string, string>} args
	 */
	constructor(roomObject, args) {
		super(roomObject);

		console.log('RaceToGameMode.constructor');

		/**
		 * @type {number}
		 * @protected
		 */
		this.limit = this._parseLimit(args['limit']);

		/**
		 * @type {number}
		 * @protected
		 */
		this.teamSize = this._parseTeamSize(args['teamsize']);

		/**
		 * @type {boolean}
		 * @protected
		 */
		this.started = false;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this.finished = false;

		/**
		 * @type {number}
		 * @protected
		 */
		this.matchesPlayed = 0;

		/**
		 * @type {{red: number, blue: number}}
		 * @protected
		 */
		this.victories = {
			red: 0,
			blue: 0,
		};
	}

	/**
	 * @inheritDoc
	 */
	start() {
		if (this.isInProgress()) {
			throw new Error('Gra została już rozpoczęta.');
		}

		this.roomObject.setTeamsLock(true);

		const playerList = this.roomObject.getPlayerList();

		if (playerList.length < 2) {
			throw new Error('Gra nie została automatycznie rozpoczęta. Ilość graczy na serwerze jest mniejsza od 2.');
		}

		this.roomObject.sendAnnouncement(`🏆 Rozpoczynam turniej: typ - Race To, limit zwycięstw - ${this.limit}, maks. rozmiar drużyny - ${this.teamSize}`);

		this.started = true;
		this.finished = false;
		this.victories = {red: 0, blue: 0};
		this.matchesPlayed = 0;

		this._fillTeamsWithFreePlayersFromBench(this.teamSize);
		this._autoTeamsBalance();

		this.roomObject.startGame();
	}

	/**
	 * @inheritDoc
	 */
	registerVictory(scores) {
		if (this.started) {
			++this.matchesPlayed;

			if (scores.red > scores.blue) {
				++this.victories.red;
			} else if (scores.blue > scores.red) {
				++this.victories.blue;
			} else {
				// Remis
				--this.matchesPlayed;
			}

			if (this.limit > 0 && this._shouldMatchBeFinished()) {
				this.finished = true;
			}
		}

		if (!this.finished) {
			setTimeout(() => {
				this.roomObject.stopGame();
				this.roomObject.sendAnnouncement('🏆 Zamieniam drużyny miejscami');

				this._swapTeams();
				this._fillTeamsWithFreePlayersFromBench(this.teamSize);
				this._autoTeamsBalance();

				this.roomObject.startGame();
			}, DISPLAY_TIME_SCORED);
		} else {
			this.stop();
		}
	}

	/**
	 * @inheritDoc
	 */
	stop() {
		if (this.started && this.finished) {
			if (this.victories.red > this.victories.blue) {
				this.roomObject.sendAnnouncement(`🏆 Turniej zakończony! Zwycięża drużyna 🔴 ${this.victories.red}:${this.victories.blue} 🔵. Brawa! 👏`);
			} else if (this.victories.blue > this.victories.red) {
				this.roomObject.sendAnnouncement(`🏆 Turniej zakończony! Zwycięża drużyna 🔵 ${this.victories.blue}:${this.victories.red} 🔴. Brawa! 👏`);
			} else {
				this.roomObject.sendAnnouncement('🏆 Turniej zakończony! Remis 🤷‍♂️');
			}
		}

		this.started = false;
		this.finished = false;

		this.roomObject.setTeamsLock(false);
		this.roomObject.stopGame();
	}

	/**
	 * @inheritDoc
	 */
	restart() {
		this.started = false;
		this.finished = false;

		this.roomObject.stopGame();

		this.start();
	}

	/**
	 * @inheritDoc
	 */
	isInProgress() {
		return this.started && !this.finished;
	}

	/**
	 * @param {string|undefined} limitArgument
	 *
	 * @return {number}
	 *
	 * @protected
	 */
	_parseLimit(limitArgument) {
		const limit = parseInt(limitArgument ?? RaceToGameMode.DEFAULT_LIMIT, 10);

		if (limit < 0) {
			throw new Error(`W trybie "Race To" limit zwycięstw nie może być mniejszy niż 0, podano ${limit}.`);
		}

		return limit;
	}

	/**
	 * @param {string|undefined} teamSizeArgument
	 *
	 * @return {number}
	 *
	 * @protected
	 */
	_parseTeamSize(teamSizeArgument) {
		const teamSize = parseInt(teamSizeArgument ?? RaceToGameMode.DEFAULT_TEAM_SIZE, 10);

		if (teamSize < 1) {
			throw new Error(`W trybie "Race To" rozmiar drużyny nie może być mniejszy niż jeden, podano ${teamSize}`);
		}

		return teamSize;
	}

	/**
	 * Determines whether the match should be finished or not.
	 *
	 * @return {boolean}
	 * @protected
	 */
	_shouldMatchBeFinished() {
		return Math.max(this.victories.red, this.victories.blue) >= this.limit;
	}

	/**
	 * @inheritDoc
	 */
	_swapTeams() {
		super._swapTeams();

		[this.victories.red, this.victories.blue] = [this.victories.blue, this.victories.red];
	}
}

RaceToGameMode.DEFAULT_LIMIT = 3;
RaceToGameMode.DEFAULT_TEAM_SIZE = 3;
