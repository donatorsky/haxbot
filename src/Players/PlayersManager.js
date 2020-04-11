'use strict';

import {AbstractStorage} from "../Storage/AbstractStorage";
import {InMemoryStorage} from "../Storage/InMemoryStorage";
import {ScopedStorage} from "../Storage/ScopedStorage";

/**
 * @property {RoomObject} _roomObject
 * @property {string} _storagePrefix
 * @property {Object.<string, PlayerInfo>} _store
 * @property {Object.<number, string>} _idToAuthMap
 * @property {Array.<AdminInfo>} _admins
 */
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
	 * @param {string} storagePrefix
	 * @param {AbstractStorage} storage
	 */
	constructor(roomObject, storagePrefix, storage) {
		this._roomObject = roomObject;
		this._storagePrefix = storagePrefix;
		this._storage = new ScopedStorage(storage, 'player.');

		/**
		 * @type {InMemoryStorage<PlayerInfo>}
		 * @private
		 */
		this._storage2 = new InMemoryStorage();

		this._store = {};
		this._idToAuthMap = {};
		this._admins = [];

		const storeItemPrefix = `${this._storagePrefix}player.`;
		let playerInfo;

		for (const [key, player] of Object.entries(this._storage.all())) {
			console.log([key, player]);
		}

		for (const key of Object.keys(localStorage)) {
			if (key.startsWith(storeItemPrefix)) {
				try {
					playerInfo = PlayerInfo.fromJSON(localStorage.getItem(key));

					playerInfo.afk = false;
					playerInfo.connected = false;

					this._store[key.substr(storeItemPrefix.length)] = playerInfo;
					this._storage2.set(key.substr(storeItemPrefix.length), playerInfo);
				} catch (e) {
					console.error('Could not deserialize player: ', key, localStorage.getItem(key));
				}
			}
		}
	}

	/**
	 * @param {PlayerObject} player
	 */
	register(player) {
		if (null === player.auth) {
			throw new Error('Cannot register player without auth token!');
		}

		this._idToAuthMap[player.id] = player.auth;

		if (!this.has(player.id)) {
			this._store[player.auth] = new PlayerInfo();
			this._storage2.set(player.auth, new PlayerInfo());
		}

		this._store[player.auth].name = player.name;
		this._store[player.auth].connected = true;
		this._store[player.auth].loggedInAt = Date.now();
		this._storage2.get(player.auth).name = player.name;
		this._storage2.get(player.auth).connected = true;
		this._storage2.get(player.auth).loggedInAt = Date.now();

		localStorage.setItem(`${this._storagePrefix}player.${player.auth}`, JSON.stringify(this._store[player.auth]));
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {boolean}
	 */
	has(player) {
		try {
			return this._store.hasOwnProperty(this.getPlayerAuth(player));
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
			return this._store[this.getPlayerAuth(player)];
		} catch (e) {
			return null;
		}
	}

	/**
	 * @return {Object.<string, PlayerInfo>}
	 */
	all() {
		return this._store;
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {PlayerObject|null}
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
			const auth = this.getPlayerAuth(player);

			// Update player's times
			const timeSpent = Date.now() - this._store[auth].loggedInAt;
			this._store[auth].totalTimeOnServer += timeSpent;

			// Mark player as disconnected
			this._store[auth].connected = false;
			this._store[auth].loggedInAt = null;

			localStorage.setItem(`${this._storagePrefix}player.${auth}`, JSON.stringify(this._store[auth]));

			// Remove player mapping
			delete this._idToAuthMap[player.id];
		} catch (e) {
			//
		}
	}

	flush() {
		for (const [auth, player] of Object.entries(this._store)) {
			localStorage.setItem(`${this._storagePrefix}player.${auth}`, JSON.stringify(player));
		}
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {boolean}
	 */
	isConnected(player) {
		return this._store[this.getPlayerAuth(player)].connected;
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {boolean}
	 */
	isAfk(player) {
		return this._store[this.getPlayerAuth(player)].afk;
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {number}
	 */
	getTotalTimeOnServer(player) {
		return this._store[this.getPlayerAuth(player)].totalTimeOnServer / 1000 + this.getTodayTimeOnServer(player);
	}

	/**
	 * @param {string|number|PlayerObject} player
	 *
	 * @return {number}
	 */
	getTodayTimeOnServer(player) {
		const playerId = this.getPlayerAuth(player);

		return this.isConnected(playerId) ?
			(Date.now() - this._store[playerId].loggedInAt) / 1000 :
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

		if ("string" === typeof player && this._store.hasOwnProperty(player)) {
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

	get auth() {
		return this._auth;
	}

	set auth(value) {
		this._auth = value;
	}

	get connected() {
		return this._connected;
	}

	set connected(value) {
		this._connected = value;
	}

	get afk() {
		return this._afk;
	}

	set afk(value) {
		this._afk = value;
	}

	get loggedInAt() {
		return this._loggedInAt;
	}

	set loggedInAt(value) {
		this._loggedInAt = value;
	}

	get totalTimeOnServer() {
		return this._totalTimeOnServer;
	}

	set totalTimeOnServer(value) {
		this._totalTimeOnServer = value;
	}

	get name() {
		return this._name;
	}

	set name(value) {
		this._name = value;
	}

	get goals() {
		return this._goals;
	}

	set goals(value) {
		this._goals = value;
	}

	get ownGoals() {
		return this._ownGoals;
	}

	set ownGoals(value) {
		this._ownGoals = value;
	}

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
		const parsed = JSON.parse(serialized),
		      player = new PlayerInfo();

		for (const key in parsed) {
			if (parsed.hasOwnProperty(key)) {
				player[key] = parsed[key];
			}
		}

		return player;
	}

	toJSON() {
		return {
			auth: this._auth,
			connected: this._connected,
			afk: this._afk,
			loggedInAt: this._loggedInAt,
			totalTimeOnServer: this._totalTimeOnServer,
			name: this._name,
			goals: this._goals,
			ownGoals: this._ownGoals,
			assists: this._assists,
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

	get password() {
		return this._password;
	}

	set password(value) {
		this._password = value;
	}

	get username() {
		return this._username;
	}

	set username(value) {
		this._username = value;
	}

	get auth() {
		return this._auth;
	}

	set auth(value) {
		this._auth = value;
	}
}
