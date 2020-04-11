import {InMemoryStorage} from "../../../src/Storage/InMemoryStorage";
import {AbstractStorage} from "../../../src/Storage/AbstractStorage";

test('InMemoryStorage can be constructed', () => {
	const storage = new InMemoryStorage();

	expect(storage).toBeInstanceOf(AbstractStorage);
	expect(storage._storage).toStrictEqual({});
});

test('null is returned when item does not exist', () => {
	const storage = new InMemoryStorage(),
	      key     = 'non-existent';

	expect(storage.has(key)).toStrictEqual(false);
	expect(storage.get(key)).toStrictEqual(null);
});

test('item is successfully stored', () => {
	const storage = new InMemoryStorage(),
	      key     = 'new-item',
	      value   = 'Some value';

	expect(storage.has(key)).toStrictEqual(false);

	storage.set(key, value);

	expect(storage.has(key)).toStrictEqual(true);
	expect(storage.get(key)).toStrictEqual(value);
});

describe('InMemoryStorage.all', () => {
	test('all items are returned when no prefix is provided', () => {
		const storage = new InMemoryStorage();

		storage.set('item', 1);
		storage.set('prefixItem', 2);

		expect(storage.all()).toStrictEqual({
			item: 1,
			prefixItem: 2
		});
	});

	test('all matching items are returned when string prefix is provided', () => {
		const storage = new InMemoryStorage();

		storage.set('item', 1);
		storage.set('prefixItem', 2);

		expect(storage.all('prefix')).toStrictEqual({
			prefixItem: 2
		});
	});

	test('all matching items are returned when RegExp prefix is provided', () => {
		const storage = new InMemoryStorage();

		storage.set('item', 1);
		storage.set('prefixItem', 2);

		expect(storage.all(/^prefix/)).toStrictEqual({
			prefixItem: 2
		});

		expect(storage.all(/item/i)).toStrictEqual({
			item: 1,
			prefixItem: 2
		});
	});
});
