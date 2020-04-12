import {AbstractStorage}                           from "../../../src/Storage/AbstractStorage";
import {StoreItemTransformer, TransformingStorage} from "../../../src/Storage/TransformingStorage";

jest.mock("../../../src/Storage/AbstractStorage");

const getMock = jest.fn(),
      setMock = jest.fn(),
      hasMock = jest.fn(),
      allMock = jest.fn();

beforeEach(() => {
	AbstractStorage.mockClear();
	getMock.mockClear();
	setMock.mockClear();
	hasMock.mockClear();
	allMock.mockClear();
});

/**
 * @extends {StoreItemTransformer<string>}
 */
class FooStoreItemTransformer extends StoreItemTransformer {

	encode(item) {
		return `[${item}]`;
	}

	decode(item) {
		return `{${item}}`;
	}

	supports(key, item) {
		return 'foo' === key;
	}
}

/**
 * @extends {StoreItemTransformer<string>}
 */
class BazStoreItemTransformer extends StoreItemTransformer {

	encode(item) {
		return `baz.${item}`;
	}

	decode(item) {
		return item.substr(4);
	}

	supports(key, item) {
		return 'baz' === key;
	}
}

describe('TransformingStorage.constructor', () => {
	test('TransformingStorage cannot be constructed with empty list of transformers', () => {
		AbstractStorage.mockImplementationOnce(() => {
			return {};
		});

		expect(() => new TransformingStorage(new AbstractStorage, [])).toThrow(/^The list of transformers cannot be empty when constructing TransformingStorage$/);
	});

	test('TransformingStorage can be constructed with non-empty transformers list', () => {
		AbstractStorage.mockImplementationOnce(() => {
			return {};
		});

		const storage = new TransformingStorage(new AbstractStorage, [
			new FooStoreItemTransformer(),
			new BazStoreItemTransformer(),
		]);

		expect(storage._transformers).toHaveLength(2);
	});
});

describe('TransformingStorage.get', () => {
	test('get does not decode unsupported items', () => {
		AbstractStorage.mockImplementationOnce(() => {
			return {
				get: getMock,
			};
		});

		getMock.mockImplementationOnce(() => 'BAR');

		const storage = new TransformingStorage(new AbstractStorage, [
			new FooStoreItemTransformer(),
			new BazStoreItemTransformer(),
		]);

		expect(storage.get('bar')).toStrictEqual('BAR');

		expect(getMock).toHaveBeenCalledTimes(1);
		expect(getMock).toHaveBeenCalledWith('bar');
	});

	test('get decodes supported items', () => {
		AbstractStorage.mockImplementationOnce(() => {
			return {
				get: getMock,
			};
		});

		getMock.mockImplementationOnce(() => 'foo');

		const storage = new TransformingStorage(new AbstractStorage, [
			new FooStoreItemTransformer(),
			new BazStoreItemTransformer(),
		]);

		expect(storage.get('foo')).toStrictEqual('{foo}');

		expect(getMock).toHaveBeenCalledTimes(1);
		expect(getMock).toHaveBeenCalledWith('foo');
	});
});

describe('TransformingStorage.set', () => {
	test('set does not encode unsupported items', () => {
		AbstractStorage.mockImplementationOnce(() => {
			return {
				set: setMock,
			};
		});

		setMock.mockImplementationOnce(() => null);

		const storage = new TransformingStorage(new AbstractStorage, [
			new FooStoreItemTransformer(),
			new BazStoreItemTransformer(),
		]);

		storage.set('bar', 'BAR');

		expect(setMock).toHaveBeenCalledTimes(1);
		expect(setMock).toHaveBeenCalledWith('bar', 'BAR');
	});

	test('set encodes supported items', () => {
		AbstractStorage.mockImplementationOnce(() => {
			return {
				set: setMock,
			};
		});

		setMock.mockImplementationOnce(() => 'foo');

		const storage = new TransformingStorage(new AbstractStorage, [
			new FooStoreItemTransformer(),
			new BazStoreItemTransformer(),
		]);

		storage.set('foo', 'FOO');

		expect(setMock).toHaveBeenCalledTimes(1);
		expect(setMock).toHaveBeenCalledWith('foo', '[FOO]');
	});
});

test('has passes call to the target storage', () => {
	AbstractStorage.mockImplementationOnce(() => {
		return {
			has: hasMock,
		};
	});

	hasMock.mockImplementationOnce(() => true)
		.mockImplementationOnce(() => false);

	const storage = new TransformingStorage(new AbstractStorage, [
		new FooStoreItemTransformer(),
		new BazStoreItemTransformer(),
	]);

	expect(storage.has('foo')).toStrictEqual(true);
	expect(storage.has('baz')).toStrictEqual(false);

	expect(hasMock).toHaveBeenCalledTimes(2);
	expect(hasMock).toHaveBeenCalledWith('foo');
	expect(hasMock).toHaveBeenCalledWith('baz');
});

test('all decodes only supported items', () => {
	AbstractStorage.mockImplementationOnce(() => {
		return {
			all: allMock,
		};
	});

	allMock.mockImplementationOnce(() => {
		return {
			foo: 'foo',
			bar: 'bar',
		};
	});

	const storage = new TransformingStorage(new AbstractStorage, [
		new FooStoreItemTransformer(),
		new BazStoreItemTransformer(),
	]);

	expect(storage.all()).toStrictEqual({
		foo: "{foo}",
		bar: "bar",
	});

	expect(allMock).toHaveBeenCalledTimes(1);
});
