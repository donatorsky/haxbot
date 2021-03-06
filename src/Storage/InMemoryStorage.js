import {AbstractStorage} from "./AbstractStorage";

/**
 * @template T
 * @extends {AbstractStorage<T>}
 */
export class InMemoryStorage extends AbstractStorage {

	constructor() {
		super();

		/**
		 * @type {!Object.<string, T>}
		 * @private
		 */
		this._storage = {};
	}

	/**
	 * @inheritDoc
	 *
	 * @return {?T}
	 */
	get(key) {
		return this._storage[key] ?? null;
	}

	/**
	 * @inheritDoc
	 *
	 * @param {string} key
	 * @param {T} value
	 */
	set(key, value) {
		this._storage[key] = value;
	}

	/**
	 * @inheritDoc
	 */
	has(key) {
		return this._storage.hasOwnProperty(key);
	}

	/**
	 * @inheritDoc
	 *
	 * @return {!Object.<string, T>}
	 */
	all(prefix = undefined) {
		if (undefined === prefix || null === prefix) {
			return this._storage;
		}

		const all = {};

		if (typeof (prefix) === 'string') {
			for (const [key, value] of Object.entries(this._storage)) {
				if (key.startsWith(prefix)) {
					all[key] = value;
				}
			}
		} else {
			for (const [key, value] of Object.entries(this._storage)) {
				if (null !== prefix.exec(key)) {
					all[key] = value;
				}
			}
		}

		return all;
	}
}
