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
		this._storage = {};
	}

	get(key) {
		if (this._storage.hasOwnProperty(key) && undefined !== this._storage[key]) {
			return this._storage[key];
		}

		return this._storage[key] = this._decorated.get(key);
	}

	set(key, value) {
		this._decorated.set(key, value);

		this._storage[key] = value;
	}

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

	all(prefix = undefined) {
		const all = this._decorated.all(prefix);

		for (const [key, value] of Object.entries(all)) {
			this._storage[key] = value;
		}

		return all;
	}
}
