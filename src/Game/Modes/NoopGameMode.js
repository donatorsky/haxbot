import {AbstractGameMode} from './AbstractGameMode';

/**
 * @extends {AbstractGameMode}
 */
export class NoopGameMode extends AbstractGameMode {

	/**
	 * @param {!RoomObject} roomObject
	 */
	constructor(roomObject) {
		super(roomObject);

		console.log('NoopGameMode.constructor');
	}

	/**
	 * @inheritDoc
	 */
	start() {
		//
	}

	/**
	 * @inheritDoc
	 */
	registerVictory(scores) {
		//
	}

	/**
	 * @inheritDoc
	 */
	stop() {
		//
	}

	/**
	 * @inheritDoc
	 */
	restart() {
		//
	}

	/**
	 * @inheritDoc
	 */
	isInProgress() {
		return false;
	}
}
