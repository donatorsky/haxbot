import {CachingStorage} from "../../../src/Storage/CachingStorage";
import {AbstractStorage} from "../../../src/Storage/AbstractStorage";

jest.mock("../../../src/Storage/AbstractStorage");

beforeEach(() => {
	AbstractStorage.mockClear();
});

test('CachingStorage can be constructed', () => {
	AbstractStorage.mockImplementationOnce(() => {
		return {};
	});

	const storage = new CachingStorage(new AbstractStorage);

	expect(storage).toBeInstanceOf(AbstractStorage);
});

describe('CachingStore.get', () => {
	test('get calls target store only once when target item exists', () => {
		const value   = Math.random().toFixed(12),
		      getMock = jest.fn(() => value);

		AbstractStorage.mockImplementationOnce(() => {
			return {
				get: getMock
			};
		});

		const storage = new CachingStorage(new AbstractStorage),
		      key     = 'non-existent';

		expect(storage._storage).not.toHaveProperty(key);
		expect(storage.get(key)).toStrictEqual(value);
		expect(storage._storage).toHaveProperty(key);
		expect(storage.get(key)).toStrictEqual(value);
		expect(storage.get(key)).toStrictEqual(value);

		expect(getMock).toHaveBeenCalledTimes(1);
		expect(getMock).toHaveBeenCalledWith(key);
	});

	test('get calls target store only once when target item does not exist', () => {
		const getMock = jest.fn(() => null);

		AbstractStorage.mockImplementationOnce(() => {
			return {
				get: getMock
			};
		});

		const storage = new CachingStorage(new AbstractStorage),
		      key     = 'non-existent';

		expect(storage._storage).not.toHaveProperty(key);
		expect(storage.get(key)).toStrictEqual(null);
		expect(storage._storage).toHaveProperty(key);
		expect(storage.get(key)).toStrictEqual(null);
		expect(storage.get(key)).toStrictEqual(null);

		expect(getMock).toHaveBeenCalledTimes(1);
		expect(getMock).toHaveBeenCalledWith(key);
	});
});

test('set is called each time', () => {
	const setMock = jest.fn(() => true);

	AbstractStorage.mockImplementationOnce(() => {
		return {
			set: setMock
		};
	});

	const storage = new CachingStorage(new AbstractStorage),
	      key     = 'non-existent';

	expect(storage._storage).not.toHaveProperty(key);

	storage.set(key, '1');

	expect(storage._storage).toHaveProperty(key);

	storage.set(key, '2');
	storage.set(key, '3');

	expect(setMock).toHaveBeenCalledTimes(3);
	expect(setMock).toHaveBeenCalledWith(key, '1');
	expect(setMock).toHaveBeenCalledWith(key, '2');
	expect(setMock).toHaveBeenCalledWith(key, '3');
});

describe('CachingStorage.has', () => {
	test('has calls target store only once when target item exists', () => {
		const hasMock = jest.fn(() => true);

		AbstractStorage.mockImplementationOnce(() => {
			return {
				has: hasMock
			};
		});

		const storage = new CachingStorage(new AbstractStorage),
		      key     = 'non-existent';

		expect(storage._storage).not.toHaveProperty(key);
		expect(storage.has(key)).toStrictEqual(true);
		expect(storage._storage).toHaveProperty(key);
		expect(storage.has(key)).toStrictEqual(true);
		expect(storage.has(key)).toStrictEqual(true);

		expect(hasMock).toHaveBeenCalledTimes(1);
		expect(hasMock).toHaveBeenCalledWith(key);
	});

	test('has calls target store only once when target item does not exist', () => {
		const hasMock = jest.fn(() => false);

		AbstractStorage.mockImplementationOnce(() => {
			return {
				has: hasMock
			};
		});

		const storage = new CachingStorage(new AbstractStorage),
		      key     = 'non-existent';

		expect(storage._storage).not.toHaveProperty(key);
		expect(storage.has(key)).toStrictEqual(false);
		expect(storage._storage).toHaveProperty(key);
		expect(storage.has(key)).toStrictEqual(false);
		expect(storage.has(key)).toStrictEqual(false);

		expect(hasMock).toHaveBeenCalledTimes(1);
		expect(hasMock).toHaveBeenCalledWith(key);
	});
});

describe('CachingStorage.all', () => {
	test('all calls target store, passes prefix and returns empty object', () => {
		const allMock = jest.fn(() => {
			return {};
		});

		AbstractStorage.mockImplementationOnce(() => {
			return {
				all: allMock
			};
		});

		const storage = new CachingStorage(new AbstractStorage);

		expect(storage._storage).toStrictEqual({});
		expect(storage.all()).toStrictEqual({});
		expect(storage._storage).toStrictEqual({});
		expect(storage.all(null)).toStrictEqual({});
		expect(storage._storage).toStrictEqual({});
		expect(storage.all('prefix')).toStrictEqual({});
		expect(storage._storage).toStrictEqual({});

		expect(allMock).toHaveBeenCalledTimes(3);
		expect(allMock).toHaveBeenCalledWith(undefined);
		expect(allMock).toHaveBeenCalledWith(null);
		expect(allMock).toHaveBeenCalledWith('prefix');
	});

	test('all calls target store, passes string prefix and returns key-value object with items', () => {
		const allMock = jest.fn()
			.mockImplementationOnce(() => {
				return {
					prefixItem: 2
				};
			})
			.mockImplementationOnce(() => {
				return {
					item: 1,
					prefixItem: 2
				};
			});

		AbstractStorage.mockImplementationOnce(() => {
			return {
				all: allMock
			};
		});

		const storage = new CachingStorage(new AbstractStorage);

		expect(storage._storage).not.toHaveProperty('item');
		expect(storage._storage).not.toHaveProperty('prefixItem');

		expect(storage.all('prefix')).toStrictEqual({prefixItem: 2});
		expect(storage._storage).not.toHaveProperty('item');
		expect(storage._storage).toHaveProperty('prefixItem');

		expect(storage.all()).toStrictEqual({item: 1, prefixItem: 2});
		expect(storage._storage).toHaveProperty('item');
		expect(storage._storage).toHaveProperty('prefixItem');

		expect(allMock).toHaveBeenCalledTimes(2);
		expect(allMock).toHaveBeenCalledWith('prefix');
		expect(allMock).toHaveBeenCalledWith(undefined);
	});

	test('all calls target store, passes RegExp prefix and returns key-value object with items', () => {
		const allMock = jest.fn()
			.mockImplementationOnce(() => {
				return {
					prefixItem: 2
				};
			})
			.mockImplementationOnce(() => {
				return {
					item: 1,
					prefixItem: 2
				};
			});

		AbstractStorage.mockImplementationOnce(() => {
			return {
				all: allMock
			};
		});

		const storage = new CachingStorage(new AbstractStorage);

		expect(storage._storage).not.toHaveProperty('item');
		expect(storage._storage).not.toHaveProperty('prefixItem');

		expect(storage.all(/^prefix/)).toStrictEqual({prefixItem: 2});
		expect(storage._storage).not.toHaveProperty('item');
		expect(storage._storage).toHaveProperty('prefixItem');

		expect(storage.all()).toStrictEqual({item: 1, prefixItem: 2});
		expect(storage._storage).toHaveProperty('item');
		expect(storage._storage).toHaveProperty('prefixItem');

		expect(allMock).toHaveBeenCalledTimes(2);
		expect(allMock).toHaveBeenCalledWith(/^prefix/);
		expect(allMock).toHaveBeenCalledWith(undefined);
	});
});

test('has -> set -> get', () => {
	const key   = 'non-existent-yet',
	      value = Math.random().toFixed(12);

	const setMock = jest.fn(),
	      hasMock = jest.fn()
		      .mockImplementationOnce(() => false);

	AbstractStorage.mockImplementationOnce(() => {
		return {
			set: setMock,
			has: hasMock
		};
	});

	const storage = new CachingStorage(new AbstractStorage);

	expect(storage.has(key)).toStrictEqual(false);

	storage.set(key, value);

	expect(storage.has(key)).toStrictEqual(true);
	expect(storage.get(key)).toStrictEqual(value);

	expect(hasMock).toHaveBeenCalledTimes(1);
	expect(hasMock).toHaveBeenCalledWith(key);

	expect(setMock).toHaveBeenCalledTimes(1);
	expect(setMock).toHaveBeenCalledWith(key, value);
});

test('has -> get', () => {
	const key   = 'non-existent-yet',
	      value = Math.random().toFixed(12);

	const getMock = jest.fn(() => null)
		.mockImplementationOnce(() => value),
	      hasMock = jest.fn(() => false)
		      .mockImplementationOnce(() => true);

	AbstractStorage.mockImplementationOnce(() => {
		return {
			get: getMock,
			has: hasMock
		};
	});

	const storage = new CachingStorage(new AbstractStorage);

	expect(storage.has(key)).toStrictEqual(true);
	expect(storage.get(key)).toStrictEqual(value);
	expect(storage.has(key)).toStrictEqual(true);
	expect(storage.get(key)).toStrictEqual(value);

	expect(hasMock).toHaveBeenCalledTimes(1);
	expect(hasMock).toHaveBeenCalledWith(key);

	expect(getMock).toHaveBeenCalledTimes(1);
	expect(getMock).toHaveBeenCalledWith(key);
});

test('get -> set', () => {
	const key   = 'already-existing',
	      value = Math.random().toFixed(12);

	const getMock = jest.fn(() => null)
		.mockImplementationOnce(() => value),
	      setMock = jest.fn(),
	      hasMock = jest.fn(() => false)
		      .mockImplementationOnce(() => true);

	AbstractStorage.mockImplementationOnce(() => {
		return {
			get: getMock,
			set: setMock,
			has: hasMock
		};
	});

	const storage = new CachingStorage(new AbstractStorage);

	expect(storage.has(key)).toStrictEqual(true);
	expect(storage.get(key)).toStrictEqual(value);

	const newValue = Math.random().toFixed(12);
	storage.set(key, newValue);

	expect(storage.get(key)).toStrictEqual(newValue);
	expect(storage.has(key)).toStrictEqual(true);

	expect(hasMock).toHaveBeenCalledTimes(1);
	expect(hasMock).toHaveBeenCalledWith(key);

	expect(getMock).toHaveBeenCalledTimes(1);
	expect(getMock).toHaveBeenCalledWith(key);

	expect(setMock).toHaveBeenCalledTimes(1);
	expect(setMock).toHaveBeenCalledWith(key, newValue);
});
