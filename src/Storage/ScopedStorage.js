import {AbstractStorage} from "./AbstractStorage";

/**
 * @template T
 * @extends {AbstractStorage<T>}
 */
export class ScopedStorage extends AbstractStorage {
	/**
	 * @param {AbstractStorage<T>} decorated
	 * @param {string} prefix
	 */
	constructor(decorated, prefix) {
		super();

		this._decorated = decorated;
		this._prefix = prefix;
	}

	get(key) {
		return this._decorated.get(this._prefix + key);
	}

	set(key, value) {
		this._decorated.set(this._prefix + key, value);
	}

	has(key) {
		return this._decorated.has(this._prefix + key);
	}

	all(prefix = undefined) {
		if (null === prefix) {
			return this._decorated.all(null);
		}

		if (undefined === prefix) {
			return this._decorated.all(this._prefix);
		}

		if ('string' === typeof prefix) {
			return this._decorated.all(this._prefix + prefix);
		}

		return this._decorated.all(prefix);
	}
}
