import {AbstractStorage} from "./AbstractStorage";

/**
 * @template T
 * @extends {AbstractStorage<T>}
 */
export class CachingStorage extends AbstractStorage {
	/**
	 * @param {AbstractStorage<T>} decorated
	 */
	constructor(decorated) {
		super();

		this._decorated = decorated;

		/**
		 * @type {Object.<string, T>}
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
		if (this._storage.hasOwnProperty(key) && undefined !== this._storage[key]) {
			return this._storage[key];
		}

		return this._storage[key] = this._decorated.get(key);
	}

	/**
	 * @inheritDoc
	 *
	 * @param {string} key
	 * @param {T} value
	 */
	set(key, value) {
		this._decorated.set(key, value);

		this._storage[key] = value;
	}

	/**
	 * @inheritDoc
	 */
	has(key) {
		if (this._storage.hasOwnProperty(key)) {
			return null !== this._storage[key];
		}

		if (this._decorated.has(key)) {
			this._storage[key] = undefined;

			return true;
		}

		this._storage[key] = null;

		return false;
	}

	/**
	 * @inheritDoc
	 *
	 * @return {!Object.<string, T>}
	 */
	all(prefix = undefined) {
		const all = this._decorated.all(prefix);

		for (const [key, value] of Object.entries(all)) {
			if (this._storage.hasOwnProperty(key)) {
				all[key] = this._storage[key];
			} else {
				this._storage[key] = value;
			}
		}

		return all;
	}
}
