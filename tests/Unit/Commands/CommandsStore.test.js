import {Command}       from "../../../src/Commands/Command";
import {CommandsStore} from "../../../src/Commands/CommandsStore";

jest.mock("../../../src/Commands/Command");

const playerDummy = {};

beforeEach(() => {
	Command.mockClear();
});

test('CommandsStore can be constructed without commands', () => {
	const commandsStore = new CommandsStore();

	expect(commandsStore.getCommandsNames(playerDummy)).toHaveLength(0);
});

test('Commands can be added to store', () => {
	Command.mockImplementationOnce(() => {
		return {
			getName: () => 'lorem',
			isVisible: () => true,
		};
	}).mockImplementationOnce(() => {
		return {
			getName: () => 'ipsum',
			isVisible: () => true,
		};
	});

	const commandsStore = new CommandsStore();

	expect(commandsStore.getCommandsNames(playerDummy)).toHaveLength(0);
	expect(commandsStore.has('lorem')).toBe(false);
	expect(commandsStore.has('ipsum')).toBe(false);

	const command1 = new Command(),
	      command2 = new Command();

	commandsStore.add(command1);
	commandsStore.add(command2);

	assertCommandsNamesAre(commandsStore.getCommandsNames(playerDummy), ['lorem', 'ipsum']);
	assertCommandStoreHasCommand(commandsStore, 'lorem', command1);
	assertCommandStoreHasCommand(commandsStore, 'ipsum', command2);
});

test('CommandsStore can be constructed with Commands', () => {
	Command.mockImplementationOnce(() => {
		return {
			getName: () => 'foo',
			isVisible: () => true,
		};
	}).mockImplementationOnce(() => {
		return {
			getName: () => 'bar',
			isVisible: () => true,
		};
	}).mockImplementationOnce(() => {
		return {
			getName: () => 'baz',
			isVisible: () => true,
		};
	});

	const command1 = new Command(),
	      command2 = new Command(),
	      command3 = new Command();

	const commandsStore = new CommandsStore([command1, command2, command3]);

	assertCommandsNamesAre(commandsStore.getCommandsNames(playerDummy), ['foo', 'bar', 'baz']);
	assertCommandStoreHasCommand(commandsStore, 'foo', command1);
	assertCommandStoreHasCommand(commandsStore, 'bar', command2);
	assertCommandStoreHasCommand(commandsStore, 'baz', command3);
});

test('CommandsStore does not list not visible Commands', () => {
	Command.mockImplementationOnce(() => {
		return {
			getName: () => 'foo',
			isVisible: () => true,
		};
	}).mockImplementationOnce(() => {
		return {
			getName: () => 'bar',
			isVisible: () => false,
		};
	}).mockImplementationOnce(() => {
		return {
			getName: () => 'baz',
			isVisible: () => true,
		};
	});

	const command1 = new Command(),
	      command2 = new Command(),
	      command3 = new Command();

	const commandsStore = new CommandsStore([command1, command2, command3]);

	assertCommandsNamesAre(commandsStore.getCommandsNames(playerDummy), ['foo', 'baz']);
	assertCommandStoreHasCommand(commandsStore, 'foo', command1);
	assertCommandStoreHasCommand(commandsStore, 'bar', command2);
	assertCommandStoreHasCommand(commandsStore, 'baz', command3);
});

test('Commands names are case-insensitive, but can be overridden', () => {
	Command.mockImplementationOnce(() => {
		return {
			getName: () => 'foo',
			isVisible: () => true,
		};
	}).mockImplementationOnce(() => {
		return {
			getName: () => 'FOO',
			isVisible: () => true,
		};
	});

	const command1 = new Command(),
	      command2 = new Command();

	const commandsStore = new CommandsStore([command1]);

	assertCommandsNamesAre(commandsStore.getCommandsNames(playerDummy), ['foo']);
	assertCommandStoreHasCommand(commandsStore, 'foo', command1);

	commandsStore.add(command2);

	assertCommandsNamesAre(commandsStore.getCommandsNames(playerDummy), ['foo']);
	assertCommandStoreHasCommand(commandsStore, 'foo', command2);
});

describe('CommandsStore.execute tests', () => {
	test('CommandsStore skips execution of non-existent Command', () => {
		const commandsStore = new CommandsStore();

		expect(commandsStore.has('foo')).toBe(false);
		expect(commandsStore.execute('foo', playerDummy, undefined, '')).toBe(true);
	});

	test('CommandsStore skips execution of not visible Command', () => {
		Command.mockImplementationOnce(() => {
			return {
				getName: () => 'foo',
				isVisible: () => false,
				call: () => null,
			};
		});

		const commandsStore = new CommandsStore([new Command]);

		expect(commandsStore.has('foo')).toBe(true);
		expect(commandsStore.execute('foo', playerDummy, undefined, '')).toBe(true);
	});

	test.each([true, false])('CommandsStore executes visible Command, which returns %p', (expected) => {
		Command.mockImplementationOnce(() => {
			return {
				getName: () => 'foo',
				isVisible: () => true,
				execute: (player, arg, message) => {
					expect(player).toBe(playerDummy);
					expect(arg).toBe('lorem');
					expect(message).toBe('ipsum');

					return expected;
				},
			};
		});

		const commandsStore = new CommandsStore([new Command]);

		expect(commandsStore.has('foo')).toBe(true);
		expect(commandsStore.execute('foo', playerDummy, 'lorem', 'ipsum')).toBe(expected);
	});
});

/**
 * @param {string[]} commandsNames
 * @param {string[]} names
 */
function assertCommandsNamesAre(commandsNames, names) {
	expect(commandsNames).toHaveLength(names.length);
	expect(commandsNames).toStrictEqual(names);
}

/**
 * @param {CommandsStore} commandsStore
 * @param {string} name
 * @param {Command} command
 */
function assertCommandStoreHasCommand(commandsStore, name, command) {
	expect(commandsStore.has(name)).toBe(true);
	expect(commandsStore.get(name)).toBe(command);
}
