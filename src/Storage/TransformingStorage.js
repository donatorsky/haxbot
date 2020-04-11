import {AbstractStorage} from "./AbstractStorage";

/**
 * @template T
 * @extends {AbstractStorage<T>}
 */
export class TransformingStorage extends AbstractStorage {

	/**
	 * @param {AbstractStorage<T>} decorated
	 * @param {Array.<StoreItemTransformer>} transformers
	 */
	constructor(decorated, transformers) {
		super();

		if (0 === transformers.length) {
			throw new Error('The list of transformers cannot be empty when constructing TransformingStorage');
		}

		this._decorated = decorated;
		this._transformers = transformers;
	}

	get(key) {
		const item = this._decorated.get(key);

		for (const transformer of this._transformers) {
			if (transformer.supports(key, item)) {
				return transformer.decode(item);
			}
		}

		return item;
	}

	set(key, value) {
		for (const transformer of this._transformers) {
			if (transformer.supports(key, value)) {
				this._decorated.set(key, transformer.encode(value));

				return;
			}
		}

		this._decorated.set(key, value);
	}

	has(key) {
		return this._decorated.has(key);
	}

	all(prefix = undefined) {
		const items = this._decorated.all(prefix);

		for (const [key, value] of Object.entries(items)) {
			for (const transformer of this._transformers) {
				if (transformer.supports(key, value)) {
					items[key] = transformer.decode(value);
				}
			}
		}

		return items;
	}
}

/**
 * @interface
 * @template T
 */
export class StoreItemTransformer {
	/**
	 * @param {T} item
	 *
	 * @return {string}
	 */
	encode(item) {
	}

	/**
	 * @param {string} item
	 *
	 * @return {T}
	 */
	decode(item) {
	}

	/**
	 * @param {string} key
	 * @param {*} item
	 *
	 * @return {boolean}
	 */
	supports(key, item) {
	}
}
