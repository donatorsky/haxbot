import {LocalStorageStorage} from "../../../src/Storage/LocalStorageStorage";

const getItem        = jest.fn(),
      setItem        = jest.fn(),
      hasOwnProperty = jest.fn();

beforeAll(() => {
	Object.defineProperty(window, 'localStorage', {
		value: {getItem, setItem, hasOwnProperty}
	});
});

beforeEach(() => {
	getItem.mockClear();
	setItem.mockClear();
	hasOwnProperty.mockClear();
});

test('null is returned when item does not exist', () => {
	const storage = new LocalStorageStorage(),
	      key     = 'non-existent';

	hasOwnProperty.mockImplementationOnce(() => false);
	getItem.mockImplementationOnce(() => null);

	expect(storage.has(key)).toStrictEqual(false);
	expect(storage.get(key)).toStrictEqual(null);

	expect(hasOwnProperty).toHaveBeenCalledTimes(1);
	expect(hasOwnProperty).toHaveBeenCalledWith(key);

	expect(getItem).toHaveBeenCalledTimes(1);
	expect(getItem).toHaveBeenCalledWith(key);
});

test('item is successfully stored', () => {
	const storage = new LocalStorageStorage(),
	      key     = 'new-item',
	      value   = Math.random().toFixed(12);

	hasOwnProperty.mockImplementationOnce(() => false)
		.mockImplementationOnce(() => true);

	setItem.mockImplementationOnce(() => null);
	getItem.mockImplementationOnce(() => value);

	expect(storage.has(key)).toStrictEqual(false);

	storage.set(key, value);

	expect(storage.has(key)).toStrictEqual(true);
	expect(storage.get(key)).toStrictEqual(value);

	expect(hasOwnProperty).toHaveBeenCalledTimes(2);
	expect(hasOwnProperty).toHaveBeenCalledWith(key);

	expect(setItem).toHaveBeenCalledTimes(1);
	expect(setItem).toHaveBeenCalledWith(key, value);

	expect(getItem).toHaveBeenCalledTimes(1);
	expect(getItem).toHaveBeenCalledWith(key);
});

describe('LocalStorageStorage.all', () => {
	test('all items are returned when no prefix is provided', () => {
		const storage = new LocalStorageStorage();

		expect(storage.all().map(item => item[0])).toStrictEqual(['getItem', 'setItem', 'hasOwnProperty']);
	});

	test('all matching items are returned when string prefix is provided', () => {
		const storage = new LocalStorageStorage();

		expect(Object.keys(storage.all('get'))).toStrictEqual(['getItem']);
	});

	test('all matching items are returned when RegExp prefix is provided', () => {
		const storage = new LocalStorageStorage();

		expect(Object.keys(storage.all(/^get/))).toStrictEqual(['getItem']);
		expect(Object.keys(storage.all(/item/i))).toStrictEqual(['getItem', 'setItem']);
	});
});
