'use strict';

export class Command {

	/**
	 * @param {string} name
	 * @param {Function} handler Otrzyma player (obiekt {PlayerObject}), arg (argument polecenia {string|undefined}) i message (oryginalna wiadomość) jako argumenty. Funkcja powinna zwracać {boolean}.
	 * @param {?string} description
	 * @param {boolean|Function} isVisible
	 */
	constructor(name, handler, description = null, isVisible = true) {
		/**
		 * @type {string}
		 * @private
		 */
		this._name = name;

		/**
		 * @type {Function}
		 * @private
		 */
		this._handler = handler;

		/**
		 * @type {?string}
		 * @private
		 */
		this._description = description;

		/**
		 * @type {boolean|Function}
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
	 * @return {?string}
	 */
	getDescription() {
		return this._description;
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
