'use strict';

import {ASSIST_VALID_FOR, TeamID} from "../Utils/constants";
import {popNRandomElements} from "../Utils/Utils";
import {PlayersManager} from "../Players/PlayersManager";

export const GAME_MODES = {
	BO: 'bo',
	UT: 'ut',
	RANDOM: 'random'
};

export class GameManager {

	get goals() {
		return this._goals;
	}

	/**
	 * @param {GoalInfo} data
	 */
	registerGoal(data) {
		this._goals.push(data);
	}

	get mode() {
		return this._mode;
	}

	get limit() {
		return this._limit;
	}

	get teamSize() {
		return this._teamSize;
	}

	get started() {
		return this._started;
	}

	get finished() {
		return this._finished;
	}

	get matchesPlayed() {
		return this._matchesPlayed;
	}

	get ballTouches() {
		if (this._ballTouches.length > 1 && this._ballTouches[1].touchedAt + ASSIST_VALID_FOR < Date.now()) {
			this._ballTouches.pop();
		}

		return this._ballTouches;
	}

	/**
	 * @param {RoomObject} roomObject
	 * @param {PlayersManager} playersManager
	 */
	constructor(roomObject, playersManager) {
		/**
		 * @type {RoomObject}
		 * @private
		 */
		this._roomObject = roomObject;

		/**
		 * @type {PlayersManager}
		 * @private
		 */
		this._playersManager = playersManager;

		/**
		 * @type {Array.<GoalInfo>}
		 * @private
		 */
		this._goals = [];

		/**
		 * @type {string}
		 * @private
		 */
		this._mode = GAME_MODES.BO;

		/**
		 * @type {number}
		 * @private
		 */
		this._limit = 3;

		/**
		 * @type {number}
		 * @private
		 */
		this._teamSize = 3;

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
		 * @type {Array.<BallTouchInfo>}
		 * @private
		 */
		this._ballTouches = [];

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

	get victories() {
		return this._victories;
	}

	/**
	 * @param {string} mode
	 * @param {number} limit
	 * @param {number} teamSize
	 *
	 * @throws Error
	 */
	start(mode = GAME_MODES.BO, limit = 3, teamSize = 3) {
		console.log('GAME.start', arguments);

		if (this.isInProgress()) {
			throw new Error(`Nie można rozpocząć nowej gry nadzorowanej, dopóki taka jeszcze trwa. Zatrzymaj ją poprzez «!match stop» lub poczekaj do jej zakończenia.`);
		}

		if (GAME_MODES.BO === mode && 1 !== limit % 2) {
			throw new Error(`W trybie ${mode} limit zwycięstw musi być nieparzysty, podano ${limit}.`);
		}

		if (teamSize < 1) {
			throw new Error(`Rozmiar drużyny nie może być mniejszy niż jeden, podano ${teamSize}`);
		}

		this._started = true;
		this._finished = false;
		this._mode = mode;
		this._limit = limit;
		this._teamSize = teamSize;

		this._roomObject.setTeamsLock(true);

		const playerList = this._roomObject.getPlayerList();

		if (playerList.length < 2) {
			throw new Error(`Gra nie została automatycznie rozpoczęta. Ilość graczy na serwerze jest mniejsza od 2.`);
		}

		this._roomObject.startGame();
	}

	stop() {
		console.log('GAME.stop');

		this._started = false;
		this._finished = false;
		this._victories = {red: 0, blue: 0};
		this._matchesPlayed = 0;

		this._roomObject.setTeamsLock(false);
		this._roomObject.stopGame();
	}

	/**
	 * @param {ScoresObject} scores
	 */
	registerVictory(scores) {
		console.log('GAME.registerVictory', scores);

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

			switch (this._mode) {
				case GAME_MODES.BO:
					let winnerPoints, looserPoints;

					if (this._victories.red === this._victories.blue) {
						break;
					}

					if (this._victories.red > this._victories.blue) {
						winnerPoints = this._victories.red;
						looserPoints = this._victories.blue;
					} else {
						winnerPoints = this._victories.blue;
						looserPoints = this._victories.red;
					}

					if (this._matchesPlayed >= Math.ceil((this._limit + 1) / 2)) {
						this._finished = true;
					}
					break;

				case GAME_MODES.UT:
					if (this._matchesPlayed === this._limit) {
						this._finished = true;
					}
					break;

				case GAME_MODES.RANDOM:
					if (this._limit > 0 && this._matchesPlayed >= this._limit) {
						this._finished = true;
					}
					break;

				default:
					throw new Error(`Unknown game mode: ${this._mode}`);
			}

			if (!this._finished) {
				const self = this;

				setTimeout(function () {
					const playerList = self._roomObject.getPlayerList();

					switch (self._mode) {
						case GAME_MODES.BO:
						case GAME_MODES.UT:
							const redTeam  = playerList.filter((player) => TeamID.RedTeam === player.team),
							      blueTeam = playerList.filter((player) => TeamID.BlueTeam === player.team);

							self._roomObject.stopGame();
							self._roomObject.sendAnnouncement("🏆 Zmieniam drużyny miejscami");

							redTeam.forEach((player) => self._roomObject.setPlayerTeam(player.id, TeamID.BlueTeam));
							blueTeam.forEach((player) => self._roomObject.setPlayerTeam(player.id, TeamID.RedTeam));

							const redVictories = self._victories.red;

							self._victories.red = self._victories.blue;
							self._victories.blue = redVictories;

							self._roomObject.startGame();
							break;

						case GAME_MODES.RANDOM:
							self._roomObject.stopGame();
							self._roomObject.sendAnnouncement("🏆 Losuję nowe drużyny");

							const teamSize = self.teamSize > 0 && playerList.length >= self.teamSize * 2 ?
								self.teamSize :
								playerList.length / 2;

							playerList.filter(player => TeamID.Spectators !== player.team)
								.forEach(player => self._roomObject.setPlayerTeam(player.id, TeamID.Spectators));

							popNRandomElements(playerList, teamSize)
								.forEach(player => self._roomObject.setPlayerTeam(player.id, TeamID.RedTeam));

							popNRandomElements(playerList, teamSize)
								.forEach(player => self._roomObject.setPlayerTeam(player.id, TeamID.BlueTeam));

							if (self.teamSize <= 0 && playerList.length > 0) {
								playerList.forEach(player => self._roomObject.setPlayerTeam(player.id, Math.random() < 0.5 ?
									TeamID.RedTeam :
									TeamID.BlueTeam))
							}

							self._roomObject.startGame();
							break;

						default:
							self._roomObject.stopGame();
							break;
					}
				}, 2000);
			} else {
				switch (this._mode) {
					case GAME_MODES.BO:
					case GAME_MODES.UT:
						this._roomObject.sendAnnouncement("🏆 Przenoszę zwycięską drużynę do czerwonych. Kto śmie stawić im czoła? 🙀");

						const availablePlayers = [],
						      victoriousTeam   = this._victories.red > this._victories.blue ?
							      TeamID.RedTeam :
							      TeamID.BlueTeam;

						this._roomObject.getPlayerList()
							.forEach((player) => {
								if (victoriousTeam === player.team) {
									this._roomObject.setPlayerTeam(player.id, TeamID.RedTeam);
								} else {
									this._roomObject.setPlayerTeam(player.id, TeamID.Spectators);

									availablePlayers.push(player.id);
								}
							});

						this._roomObject.stopGame();

						if (availablePlayers.length > 0) {
							const randomCaptain = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];

							this._roomObject.setPlayerTeam(randomCaptain, TeamID.BlueTeam);

							this._roomObject.sendAnnouncement(`🏆 Niebiescy, powitajcie nowego kapitana: ${this._roomObject.getPlayer(randomCaptain).name}!`);
						}
						break;

					case GAME_MODES.RANDOM:
						this._roomObject.sendAnnouncement("🏆 Turniej losowych drużyn zakończony! 🎲");

						this.end();
						break;

					default:
						this._roomObject.stopGame();
						break;
				}
			}
		}
	}

	end() {
		console.log('GAME.end');

		if (this._started && this._finished) {
			if (this._victories.red > this._victories.blue) {
				this._roomObject.sendAnnouncement(`🏆 Turniej zakończony! Zwycięża drużyna 🔴 ${this._victories.red}:${this._victories.blue} 🔵. Brawa! 👏`);
			} else if (this._victories.blue > this._victories.red) {
				this._roomObject.sendAnnouncement(`🏆 Turniej zakończony! Zwycięża drużyna 🔵 ${this._victories.blue}:${this._victories.red} 🔴. Brawa! 👏`);
			} else {
				this._roomObject.sendAnnouncement(`🏆 Turniej zakończony! Remis 🤷‍♂️`);
			}

			this._finished = false;
			this._victories = {red: 0, blue: 0};
			this._matchesPlayed = 0;
		}

		this._goals = [];

		this.resetBallTouches();
	}

	isInProgress() {
		return this._started && !this._finished;
	}

	/**
	 * @return {Object}
	 */
	getStats() {
		return {};
	}
}

/**
 * @property {string} _goalBy
 * @property {?string} _assistBy
 * @property {number} _scoredAt
 * @property {TeamID} _byTeam
 */
export class GoalInfo {

	constructor(goalBy, assistBy, scoredAt, byTeam) {
		this._goalBy = goalBy;
		this._assistBy = assistBy;
		this._scoredAt = scoredAt;
		this._byTeam = byTeam;
	}

	get goalBy() {
		return this._goalBy;
	}

	get assistBy() {
		return this._assistBy;
	}

	get scoredAt() {
		return this._scoredAt;
	}

	get byTeam() {
		return this._byTeam;
	}
}

/**
 * @property {number} _touchedAt
 * @property {string} _auth
 */
class BallTouchInfo {

	get touchedAt() {
		return this._touchedAt;
	}

	get playerId() {
		return this._playerId;
	}

	constructor(playerId) {
		this._playerId = playerId;
		this._touchedAt = Date.now();
	}
}
