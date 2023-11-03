import {RaceToGameMode} from './RaceToGameMode';

/**
 * @extends {RaceToGameMode}
 */
export class BestOfGameMode extends RaceToGameMode {

	/**
	 * @param {!RoomObject}              roomObject
	 * @param {!Object.<string, string>} args
	 */
	constructor(roomObject, args) {
		super(roomObject, args);

		console.log('BestOfGameMode.constructor');
	}

	/**
	 * @inheritDoc
	 */
	_parseLimit(limitArgument) {
		const limit = parseInt(limitArgument ?? BestOfGameMode.DEFAULT_LIMIT, 10);

		if (limit < 0) {
			throw new Error(`W trybie "Best Of" limit zwycięstw nie może być mniejszy niż 0, podano ${limit}.`);
		}

		if (1 !== limit % 2) {
			throw new Error(`W trybie "Best Of" limit zwycięstw musi być nieparzysty, podano ${limit}.`);
		}

		return limit;
	}

	/**
	 * @inheritDoc
	 */
	_parseTeamSize(teamSizeArgument) {
		const teamSize = parseInt(teamSizeArgument ?? BestOfGameMode.DEFAULT_TEAM_SIZE, 10);

		if (teamSize < 1) {
			throw new Error(`W trybie "Best Of" rozmiar drużyny nie może być mniejszy niż jeden, podano ${teamSize}`);
		}

		return teamSize;
	}

	/**
	 * @inheritDoc
	 */
	_shouldMatchBeFinished() {
		return Math.max(this.victories.red, this.victories.blue) >= (this.limit + 1) / 2;
	}
}

BestOfGameMode.DEFAULT_LIMIT = 3;
BestOfGameMode.DEFAULT_TEAM_SIZE = 3;
