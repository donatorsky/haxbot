import {TeamID}                               from '../../Utils/constants';
import {popNRandomElements, popRandomElement} from '../../Utils/Utils';

/**
 * @abstract
 */
export class AbstractGameMode {

	/**
	 * @param {!RoomObject} roomObject
	 */
	constructor(roomObject) {
		console.log('AbstractGameMode.constructor');

		/**
		 * @type {!RoomObject}
		 * @protected
		 */
		this.roomObject = roomObject;
	}

	/**
	 * Starts a game.
	 *
	 * @abstract
	 */
	start() {
		// throw new Error('Method start() not implemented');
	}

	/**
	 * Register new victory for a team
	 *
	 * @param {!ScoresObject} scores
	 *
	 * @abstract
	 */
	registerVictory(scores) {
		// throw new Error('Method registerVictory() not implemented');
	}

	/**
	 * Stops a game, but does not quit this game mode.
	 *
	 * @abstract
	 */
	stop() {
		// throw new Error('Method stop() not implemented');
	}

	/**
	 * Restarts a game.
	 *
	 * @abstract
	 */
	restart() {
		// throw new Error('Method restart() not implemented');
	}

	/**
	 * Returns true when game is started in given mode and false otherwise.
	 *
	 * @return {boolean}
	 *
	 * @abstract
	 */
	isInProgress() {
		// throw new Error('Method isInProgress() not implemented');
	}

	/**
	 * Assigns players to teams randomly.
	 *
	 * @param {number} teamSize
	 *
	 * @protected
	 */
	_randomizeTeams(teamSize) {
		const playerList  = this.roomObject.getPlayerList(),
		      maxTeamSize = teamSize > 0 && playerList.length >= teamSize * 2 ?
			      teamSize :
			      playerList.length / 2;

		playerList.filter(player => TeamID.Spectators !== player.team)
			.forEach(player => this.roomObject.setPlayerTeam(player.id, TeamID.Spectators));

		popNRandomElements(playerList, maxTeamSize)
			.forEach(player => this.roomObject.setPlayerTeam(player.id, TeamID.RedTeam));

		popNRandomElements(playerList, maxTeamSize)
			.forEach(player => this.roomObject.setPlayerTeam(player.id, TeamID.BlueTeam));

		if (maxTeamSize <= 0 && playerList.length > 0) {
			playerList.forEach(player => this.roomObject.setPlayerTeam(player.id, Math.random() < 0.5 ?
				TeamID.RedTeam :
				TeamID.BlueTeam));
		}
	}

	/**
	 * Swaps players between teams.
	 *
	 * @protected
	 */
	_swapTeams() {
		const playersList = this.roomObject.getPlayerList(),
		      redTeam     = playersList.filter(player => TeamID.RedTeam === player.team),
		      blueTeam    = playersList.filter(player => TeamID.BlueTeam === player.team);

		redTeam.forEach(player => this.roomObject.setPlayerTeam(player.id, TeamID.BlueTeam));
		blueTeam.forEach(player => this.roomObject.setPlayerTeam(player.id, TeamID.RedTeam));
	}

	/**
	 * Adds free players from the bench to teams.
	 *
	 * @param {number} teamSize
	 *
	 * @protected
	 */
	_fillTeamsWithFreePlayersFromBench(teamSize) {
		const playersList = this.roomObject.getPlayerList(),
		      redTeam     = playersList.filter(player => TeamID.RedTeam === player.team),
		      blueTeam    = playersList.filter(player => TeamID.BlueTeam === player.team);

		if (redTeam.length < teamSize || blueTeam.length < teamSize) {
			const chosenPlayers = popNRandomElements(playersList, playersList.length - redTeam.length - blueTeam.length);

			if (chosenPlayers.length > 0) {
				this.roomObject.sendAnnouncement('Przydzielam zawodników z ławki rezerwowych do drużyn');

				let difference = redTeam.length - blueTeam.length,
				    targetTeam;

				if (0 !== difference) {
					targetTeam = difference > 0 ?
						TeamID.BlueTeam :
						TeamID.RedTeam;

					difference = Math.abs(difference);

					while (difference-- > 0 && chosenPlayers.length > 0) {
						this.roomObject.setPlayerTeam(chosenPlayers.pop().id, targetTeam);
					}
				}

				targetTeam = Math.random() >= 0.5 ?
					TeamID.RedTeam :
					TeamID.BlueTeam;

				while (chosenPlayers.length > 0) {
					this.roomObject.setPlayerTeam(chosenPlayers.pop().id, targetTeam);

					targetTeam = targetTeam === TeamID.RedTeam ?
						TeamID.BlueTeam :
						TeamID.RedTeam;
				}
			}
		}
	}

	/**
	 * Balances the number of players between teams.
	 *
	 * @protected
	 */
	_autoTeamsBalance() {
		const playersList = this.roomObject.getPlayerList(),
		      redTeam     = playersList.filter(player => TeamID.RedTeam === player.team),
		      blueTeam    = playersList.filter(player => TeamID.BlueTeam === player.team);

		let difference = redTeam.length - blueTeam.length;

		if (Math.abs(difference) >= 2) {
			this.roomObject.sendAnnouncement('Wyrównuję ilość zawodników w drużynach');

			/**
			 * @type {Array.<PlayerObject>}
			 */
			let fromTeam;

			/**
			 * @type {TeamID}
			 */
			let toTeam;

			if (difference > 0) {
				fromTeam = redTeam;
				toTeam = TeamID.BlueTeam;
			} else {
				fromTeam = blueTeam;
				toTeam = TeamID.RedTeam;
			}

			difference = Math.abs(difference);

			while (difference >= 2) {
				this.roomObject.setPlayerTeam(popRandomElement(fromTeam).id, toTeam);

				difference -= 2;
			}
		}
	}
}
