import {DISPLAY_TIME_SCORED} from '../../Utils/constants';
import {AbstractGameMode}    from './AbstractGameMode';

/**
 * @extends {AbstractGameMode}
 */
export class RandomGameMode extends AbstractGameMode {

	/**
	 * @param {!RoomObject}              roomObject
	 * @param {!Object.<string, string>} args
	 */
	constructor(roomObject, args) {
		super(roomObject);

		console.log('RandomGameMode.constructor');

		/**
		 * @type {number}
		 * @private
		 */
		this._limit = parseInt(args['limit'] ?? RandomGameMode.DEFAULT_LIMIT, 10);

		if (this._limit < 0) {
			throw new Error(`W trybie "Random" limit zwycięstw nie może być mniejszy niż 0, podano ${this._limit}.`);
		}

		/**
		 * @type {number}
		 * @private
		 */
		this._teamSize = parseInt(args['teamsize'] ?? RandomGameMode.DEFAULT_TEAM_SIZE, 10);

		if (this._teamSize < 1) {
			throw new Error(`W trybie "Random" rozmiar drużyny nie może być mniejszy niż jeden, podano ${this._teamSize}`);
		}

		/**
		 * @type {boolean}
		 * @private
		 */
		this._started = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._finished = false;

		/**
		 * @type {number}
		 * @private
		 */
		this._matchesPlayed = 0;

		/**
		 * @type {{red: number, blue: number}}
		 * @private
		 */
		this._victories = {
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

		this.roomObject.sendAnnouncement(`🏆 Rozpoczynam turniej: typ - losowy, limit zwycięstw - ${this._limit}, maks. rozmiar drużyny - ${this._teamSize}`);

		this._started = true;
		this._finished = false;
		this._victories = {red: 0, blue: 0};
		this._matchesPlayed = 0;

		this._randomizeTeams(this._teamSize);

		this.roomObject.startGame();
	}

	/**
	 * @inheritDoc
	 */
	registerVictory(scores) {
		if (this._started) {
			++this._matchesPlayed;

			if (scores.red > scores.blue) {
				++this._victories.red;
			} else if (scores.blue > scores.red) {
				++this._victories.blue;
			} else {
				// Remis
				--this._matchesPlayed;
			}

			if (this._limit > 0 && this._matchesPlayed >= this._limit) {
				this._finished = true;
			}
		}

		if (!this._finished) {
			setTimeout(() => {
				this.roomObject.stopGame();
				this.roomObject.sendAnnouncement('🏆 Losuję nowe drużyny');

				this._randomizeTeams(this._teamSize);

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
		if (this._started && this._finished) {
			if (this._victories.red > this._victories.blue) {
				this.roomObject.sendAnnouncement(`🏆 Turniej zakończony! Zwycięża drużyna 🔴 ${this._victories.red}:${this._victories.blue} 🔵. Brawa! 👏`);
			} else if (this._victories.blue > this._victories.red) {
				this.roomObject.sendAnnouncement(`🏆 Turniej zakończony! Zwycięża drużyna 🔵 ${this._victories.blue}:${this._victories.red} 🔴. Brawa! 👏`);
			} else {
				this.roomObject.sendAnnouncement('🏆 Turniej zakończony! Remis 🤷‍♂️');
			}
		}

		this._started = false;
		this._finished = false;

		this.roomObject.setTeamsLock(false);
		this.roomObject.stopGame();
	}

	/**
	 * @inheritDoc
	 */
	restart() {
		this._started = false;
		this._finished = false;

		this.roomObject.stopGame();

		this.start();
	}

	/**
	 * @inheritDoc
	 */
	isInProgress() {
		return this._started && !this._finished;
	}
}

RandomGameMode.DEFAULT_LIMIT = 3;
RandomGameMode.DEFAULT_TEAM_SIZE = 3;
