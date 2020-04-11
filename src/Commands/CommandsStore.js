'use strict';

import {Command} from "./Command";

export class CommandsStore {

	/**
	 * @param {!Array.<Command>} commands
	 */
	constructor(commands = []) {
		/**
		 * @type {!Object.<string, Command>}
		 * @private
		 */
		this._store = {};

		for (const command of commands) {
			this.add(command);
		}
	}


	/**
	 * @param {Command} command
	 */
	add(command) {
		this._store[command.getName().toLocaleLowerCase()] = command;
	}

	/**
	 * @param {string} name
	 *
	 * @return {boolean}
	 */
	has(name) {
		return this._store.hasOwnProperty(name.toLocaleLowerCase());
	}

	/**
	 * @param {string} name
	 *
	 * @return {?Command}
	 */
	get(name) {
		return !this.has(name) ?
			null :
			this._store[name.toLocaleLowerCase()];
	}

	/**
	 * @param {string} name
	 * @param {PlayerObject} player
	 * @param {string|undefined} arg
	 * @param {string} message
	 *
	 * @return {boolean}
	 */
	execute(name, player, arg, message) {
		if (!this.has(name) || !this._store[name].isVisible(player)) {
			return true;
		}

		return this._store[name].execute(player, arg, message);
	}

	/**
	 * @param {PlayerObject} player
	 *
	 * @return {Array.<string>}
	 */
	getCommandsNames(player) {
		const commands = [];

		for (const name in this._store) {
			if (this._store.hasOwnProperty(name) && this._store[name].isVisible(player)) {
				commands.push(name);
			}
		}

		return commands;
	}
}
