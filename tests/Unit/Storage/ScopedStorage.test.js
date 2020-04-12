import {AbstractStorage} from "../../../src/Storage/AbstractStorage";
import {ScopedStorage}   from "../../../src/Storage/ScopedStorage";

jest.mock("../../../src/Storage/AbstractStorage");

beforeEach(() => {
	AbstractStorage.mockClear();
});

test('ScopedStorage can be constructed', () => {
	AbstractStorage.mockImplementationOnce(() => {
		return {};
	});

	const storage = new ScopedStorage(new AbstractStorage, 'some-prefix');

	expect(storage).toBeInstanceOf(AbstractStorage);
});

test('null is returned when item does not exist', () => {
	const getMock = jest.fn(() => null),
	      hasMock = jest.fn(() => false);

	AbstractStorage.mockImplementationOnce(() => {
		return {
			get: getMock,
			has: hasMock,
		};
	});

	const prefix  = 'some-prefix',
	      storage = new ScopedStorage(new AbstractStorage, prefix),
	      key     = 'non-existent';

	expect(storage.has(key)).toStrictEqual(false);
	expect(hasMock).toHaveBeenCalledTimes(1);
	expect(hasMock).toHaveBeenCalledWith(prefix + key);

	expect(storage.get(key)).toStrictEqual(null);
	expect(getMock).toHaveBeenCalledTimes(1);
	expect(getMock).toHaveBeenCalledWith(prefix + key);
});

test('item is successfully stored', () => {
	const key     = 'new-item',
	      value   = 'Some value',
	      getMock = jest.fn(() => value),
	      setMock = jest.fn(),
	      hasMock = jest.fn()
		      .mockImplementationOnce(() => false)
		      .mockImplementationOnce(() => true);

	AbstractStorage.mockImplementationOnce(() => {
		return {
			get: getMock,
			set: setMock,
			has: hasMock,
		};
	});

	const prefix  = 'some-prefix',
	      storage = new ScopedStorage(new AbstractStorage, prefix);

	expect(storage.has(key)).toStrictEqual(false);

	storage.set(key, value);
	expect(setMock).toHaveBeenCalledTimes(1);
	expect(setMock).toHaveBeenCalledWith(prefix + key, value);

	expect(storage.has(key)).toStrictEqual(true);
	expect(hasMock).toHaveBeenCalledWith(prefix + key);
	expect(hasMock).toHaveBeenCalledTimes(2);

	expect(storage.get(key)).toStrictEqual(value);
	expect(getMock).toHaveBeenCalledTimes(1);
	expect(getMock).toHaveBeenCalledWith(prefix + key);
});

describe('ScopedStorage.all', () => {
	test('null prefix is passed when is provided', () => {
		const all     = {item: Math.random()},
		      allMock = jest.fn(() => all);

		AbstractStorage.mockImplementationOnce(() => {
			return {
				all: allMock,
			};
		});

		const storage = new ScopedStorage(new AbstractStorage, Math.random().toFixed(12));

		expect(storage.all(null)).toStrictEqual(all);
		expect(allMock).toHaveBeenCalledTimes(1);
		expect(allMock).toHaveBeenCalledWith(null);
	});

	test('storage prefix is used when undefined is passed', () => {
		const all     = {item: Math.random()},
		      allMock = jest.fn(() => all);

		AbstractStorage.mockImplementationOnce(() => {
			return {
				all: allMock,
			};
		});

		const prefix  = Math.random().toFixed(12),
		      storage = new ScopedStorage(new AbstractStorage, prefix);

		expect(storage.all(undefined)).toStrictEqual(all);
		expect(allMock).toHaveBeenCalledTimes(1);
		expect(allMock).toHaveBeenCalledWith(prefix);
	});

	test('provided prefix is extended by storage prefix, when string is passed', () => {
		const all     = {item: Math.random()},
		      allMock = jest.fn(() => all);

		AbstractStorage.mockImplementationOnce(() => {
			return {
				all: allMock,
			};
		});

		const storagePrefix = Math.random().toFixed(12),
		      prefix        = Math.random().toFixed(12),
		      storage       = new ScopedStorage(new AbstractStorage, storagePrefix);

		expect(storage.all(prefix)).toStrictEqual(all);
		expect(allMock).toHaveBeenCalledTimes(1);
		expect(allMock).toHaveBeenCalledWith(storagePrefix + prefix);
	});

	test('RegExp prefix is used when is provided', () => {
		const all     = {item: Math.random()},
		      allMock = jest.fn(() => all);

		AbstractStorage.mockImplementationOnce(() => {
			return {
				all: allMock,
			};
		});

		const storage = new ScopedStorage(new AbstractStorage, Math.random().toFixed(12)),
		      prefix  = /^my-prefix/i;

		expect(storage.all(prefix)).toStrictEqual(all);
		expect(allMock).toHaveBeenCalledTimes(1);
		expect(allMock).toHaveBeenCalledWith(prefix);
	});
});
