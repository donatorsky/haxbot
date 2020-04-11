/**
 * @abstract
 * @template T
 */
export class AbstractStorage {
	/**
	 * Returns item from storage by its key.
	 *
	 * @param {string} key
	 *
	 * @return {?T}
	 */
	get(key) {
		throw new Error('Method get() not implemented');
	}

	/**
	 * Stores item in the storage under the given key.
	 *
	 * @param {string} key
	 * @param {T} value
	 */
	set(key, value) {
		throw new Error('Method set() not implemented');
	}

	/**
	 * Checks whether the storage has item with given key.
	 *
	 * @param {string} key
	 *
	 * @return {boolean}
	 */
	has(key) {
		throw new Error('Method has() not implemented');
	}

	/**
	 * @param {string|RegExp|null|undefined} prefix `null` prefix should clear prefix preference.
	 *                                              `undefined` prefix should apply default behaviour.
	 *                                              `string` prefix should match the beginning of store keys.
	 *                                              `RegExp` prefix should match whole storage keys' value.
	 *
	 * @return {Object.<string, T>}
	 */
	all(prefix = undefined) {
		throw new Error('Method all() not implemented');
	}
}
