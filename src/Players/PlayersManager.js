'use strict';

import {AbstractStorage} from "../Storage/AbstractStorage";
import {ScopedStorage} from "../Storage/ScopedStorage";

export class PlayersManager {

	setAdmins(admins) {
		this._admins = admins;
	}

	verifyAdminCredentials(username, password) {
		return this._admins.some((item) => undefined !== item.username && item.username === username && undefined !== item.password && item.password === password);
	}

	verifyAdminAuthToken(auth) {
		return this._admins.some((item) => undefined !== item.auth && item.auth === auth);
	}

	/**
	 * @param {RoomObject} roomObject
	 * @param {AbstractStorage} storage
	 */
	constructor(roomObject, storage) {
		this._roomObject = roomObject;

		/**
		 * @type {ScopedStorage<PlayerInfo>}
		 * @private
		 */
		this._storage = new ScopedStorage(storage, 'player.');

		/**
		 * @type {!Object.<number, string>}
		 * @private
		 */
		this._idToAuthMap = {};

		/**
		 * @type {Array.<AdminInfo>}
		 * @private
		 */
		this._admins = [];
	}

	/**
	 * @param {PlayerObject} player
	 */
	register(player) {
		if (null === player.auth) {
			throw new Error('Cannot register player without auth token!');
		}

		this._idToAuthMap[player.id] = player.auth;

		/**
		 * @type {PlayerInfo}
		 */
		let playerObject;

		if (this.has(player.id)) {
			playerObject = this._storage.get(player.auth);
		} else {
			playerObject = new PlayerInfo();

			playerObject.auth = player.auth;
		}

		playerObject.name = player.name;
		playerObject.connected = true;
		playerObject.afk = false;
		playerObject.loggedInAt = Date.now();

		this._storage.set(player.auth, playerObject);
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {boolean}
	 */
	has(player) {
		try {
			return this._storage.has(this.getPlayerAuth(player));
		} catch (e) {
			return false;
		}
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {null|PlayerInfo}
	 */
	get(player) {
		try {
			return this._storage.get(this.getPlayerAuth(player));
		} catch (e) {
			return null;
		}
	}

	/**
	 * @return {!Object.<string, !PlayerInfo>}
	 */
	all() {
		return this._storage.all();
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {?PlayerObject}
	 */
	getActivePlayerObject(player) {
		try {
			const playerId = this.getPlayerAuth(player);

			for (const [id, auth] of Object.entries(this._idToAuthMap)) {
				if (playerId === auth) {
					return this._roomObject.getPlayer(+id);
				}
			}
		} catch (e) {
			//
		}

		return null;
	}

	/**
	 * @param {string|number|PlayerObject} player
	 */
	disconnect(player) {
		try {
			const playerObject = this._storage.get(this.getPlayerAuth(player));

			// Update player's times
			const timeSpent = Date.now() - playerObject.loggedInAt;
			playerObject.totalTimeOnServer = playerObject.totalTimeOnServer + timeSpent;

			// Mark player as disconnected
			playerObject.connected = false;
			playerObject.loggedInAt = null;

			// Save changes
			this._storage.set(this.getPlayerAuth(player), playerObject);

			// Remove player mapping
			delete this._idToAuthMap[player.id];
		} catch (e) {
			//
		}
	}

	flush() {
		for (const /** @type {PlayerInfo} */ player of Object.values(this._storage.all())) {
			this._storage.set(player.auth, player);
		}
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {boolean}
	 */
	isConnected(player) {
		return this._storage.get(this.getPlayerAuth(player)).connected;
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {boolean}
	 */
	isAfk(player) {
		return this._storage.get(this.getPlayerAuth(player)).afk;
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {number}
	 */
	getTotalTimeOnServer(player) {
		return this._storage.get(this.getPlayerAuth(player)).totalTimeOnServer / 1000 + this.getTodayTimeOnServer(player);
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {number}
	 */
	getTodayTimeOnServer(player) {
		const playerId = this.getPlayerAuth(player);

		return this.isConnected(playerId) ?
			(Date.now() - this._storage.get(playerId).loggedInAt) / 1000 :
			0;
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {string}
	 *
	 * @throws Error When ID resolution is not possible
	 */
	getPlayerAuth(player) {
		const originalPlayer = player;

		if ("string" === typeof player && this._storage.has(player)) {
			return player;
		}

		if ("object" === typeof player) {
			if (player.hasOwnProperty("auth") && null !== player.auth) {
				return player.auth;
			}

			if (player.hasOwnProperty("id") && null !== player.id) {
				player = parseInt(player.id, 10);
			}
		}

		if ("number" === typeof player && this._idToAuthMap.hasOwnProperty(player)) {
			return this._idToAuthMap[player];
		}

		console.debug('getPlayerAuth', originalPlayer);

		throw new Error('Cannot resolve given player ID: unknown player');
	}
}

export class PlayerInfo {

	constructor() {
		/**
		 * @type {string}
		 * @private
		 */
		this._auth = '';

		/**
		 * @type {boolean}
		 * @private
		 */
		this._connected = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._afk = false;

		/**
		 * @type {?number}
		 * @private
		 */
		this._loggedInAt = null;

		/**
		 * @type {number}
		 * @private
		 */
		this._totalTimeOnServer = 0;

		/**
		 * @type {string}
		 * @private
		 */
		this._name = '';

		/**
		 * @type {number}
		 * @private
		 */
		this._goals = 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._ownGoals = 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._assists = 0;
	}

	/**
	 * @return {string}
	 */
	get auth() {
		return this._auth;
	}

	set auth(value) {
		this._auth = value;
	}

	/**
	 * @return {boolean}
	 */
	get connected() {
		return this._connected;
	}

	set connected(value) {
		this._connected = value;
	}

	/**
	 * @return {boolean}
	 */
	get afk() {
		return this._afk;
	}

	set afk(value) {
		this._afk = value;
	}

	/**
	 * @return {?number}
	 */
	get loggedInAt() {
		return this._loggedInAt;
	}

	set loggedInAt(value) {
		this._loggedInAt = value;
	}

	/**
	 * @return {number}
	 */
	get totalTimeOnServer() {
		return this._totalTimeOnServer;
	}

	set totalTimeOnServer(value) {
		this._totalTimeOnServer = value;
	}

	/**
	 * @return {string}
	 */
	get name() {
		return this._name;
	}

	set name(value) {
		this._name = value;
	}

	/**
	 * @return {number}
	 */
	get goals() {
		return this._goals;
	}

	set goals(value) {
		this._goals = value;
	}

	/**
	 * @return {number}
	 */
	get ownGoals() {
		return this._ownGoals;
	}

	set ownGoals(value) {
		this._ownGoals = value;
	}

	/**
	 * @return {number}
	 */
	get assists() {
		return this._assists;
	}

	set assists(value) {
		this._assists = value;
	}

	/**
	 * @param {string} serialized
	 *
	 * @return {PlayerInfo}
	 */
	static fromJSON(serialized) {
		return Object.assign(new PlayerInfo(), JSON.parse(serialized));
	}

	toJSON() {
		return {
			name: this._name,
			connected: this._connected,
			afk: this._afk,
			loggedInAt: this._loggedInAt,
			totalTimeOnServer: this._totalTimeOnServer,
			goals: this._goals,
			ownGoals: this._ownGoals,
			assists: this._assists,
			auth: this._auth,
		};
	}
}

export class AdminInfo {

	constructor() {
		/**
		 * @type {string|undefined}
		 * @private
		 */
		this._password = undefined;

		/**
		 * @type {string|undefined}
		 * @private
		 */
		this._username = undefined;

		/**
		 * @type {string|undefined}
		 * @private
		 */
		this._auth = undefined;
	}

	/**
	 * @return {string|undefined}
	 */
	get password() {
		return this._password;
	}

	set password(value) {
		this._password = value;
	}

	/**
	 * @return {string|undefined}
	 */
	get username() {
		return this._username;
	}

	set username(value) {
		this._username = value;
	}

	/**
	 * @return {string|undefined}
	 */
	get auth() {
		return this._auth;
	}

	set auth(value) {
		this._auth = value;
	}
}
