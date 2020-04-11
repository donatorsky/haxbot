import {AbstractStorage} from "./AbstractStorage";

/**
 * @extends {AbstractStorage<string>}
 */
export class LocalStorageStorage extends AbstractStorage {
	/**
	 * @inheritDoc
	 */
	get(key) {
		return localStorage.getItem(key);
	}

	/**
	 * @inheritDoc
	 */
	set(key, value) {
		localStorage.setItem(key, value);
	}

	/**
	 * @inheritDoc
	 */
	has(key) {
		return localStorage.hasOwnProperty(key);
	}

	/**
	 * @inheritDoc
	 */
	all(prefix = undefined) {
		if (undefined === prefix || null === prefix) {
			return Object.entries(localStorage);
		}

		const all = {};

		if (typeof (prefix) === 'string') {
			for (const [key, value] of Object.entries(localStorage)) {
				if (key.startsWith(prefix)) {
					all[key] = value;
				}
			}
		} else {
			for (const [key, value] of Object.entries(localStorage)) {
				if (null !== prefix.exec(key)) {
					all[key] = value;
				}
			}
		}

		return all;
	}
}
