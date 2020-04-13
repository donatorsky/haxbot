'use strict';

/**
 * @typedef {function(PlayerObject, (string|undefined), string): boolean} CommandLogicHandler
 */
let CommandLogicHandler;

/**
 * @typedef {function((string|undefined), PlayerObject): string} CommandDescriptionHandler
 */
let CommandDescriptionHandler;

/**
 * @typedef {function(PlayerObject): boolean} CommandVisibilityHandler
 */
let CommandVisibilityHandler;

/**
 * Class representing chat command logic.
 */
export class Command {

	/**
	 * @param {string}                                  name
	 * @param {CommandLogicHandler}                     handler
	 * @param {string|CommandDescriptionHandler|null}   description
	 * @param {boolean|CommandVisibilityHandler}        isVisible
	 */
	constructor(name, handler, description = null, isVisible = true) {
		/**
		 * @type {string}
		 * @private
		 */
		this._name = name;

		/**
		 * @type {CommandLogicHandler}
		 * @private
		 */
		this._handler = handler;

		/**
		 * @type {string|CommandDescriptionHandler|null}
		 * @private
		 */
		this._description = description;

		/**
		 * @type {boolean|CommandVisibilityHandler}
		 * @private
		 */
		this._isVisible = isVisible;
	}

	/**
	 * @return {string}
	 */
	getName() {
		return this._name;
	}

	/**
	 * @param {string|undefined}    arg
	 * @param {PlayerObject}        player
	 *
	 * @return {string}
	 */
	getDescription(arg, player) {
		if (null === this._description) {
			throw new Error('No help information available for this command');
		}

		if ('string' === typeof this._description) {
			return this._description;
		}

		return this._description.call(null, arg, player);
	}

	/**
	 * @return {boolean}
	 */
	hasDescription() {
		return null !== this._description;
	}

	/**
	 * @param {PlayerObject} player
	 *
	 * @return {boolean}
	 */
	isVisible(player) {
		return "boolean" === typeof this._isVisible ?
			this._isVisible :
			this._isVisible.call(null, player);
	}

	/**
	 * @param {PlayerObject} player
	 * @param {string|undefined} arg
	 * @param {string} message
	 *
	 * @return {boolean}
	 */
	execute(player, arg, message) {
		if (!this.isVisible(player)) {
			return true;
		}

		return !!this._handler.call(null, player, arg, message);
	}
}
