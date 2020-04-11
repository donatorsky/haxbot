import {Command} from "../../../src/Commands/Command";

/**
 * @return {PlayerObject}
 */
function newPlayerObjectMock(id = null) {
	return {id};
}

test('Command can be constructed with default parameters', () => {
	const command = new Command('name', () => true);

	expect(command.getName()).toBe('name');
	expect(command.hasDescription()).toBe(false);
	expect(command.getDescription()).toBe(null);
	expect(command.isVisible(newPlayerObjectMock())).toBe(true);
});

test('Command can be constructed with custom description', () => {
	const command = new Command('name', () => true, 'Lorem ipsum');

	expect(command.getName()).toBe('name');
	expect(command.hasDescription()).toBe(true);
	expect(command.getDescription()).toBe('Lorem ipsum');
	expect(command.isVisible(newPlayerObjectMock())).toBe(true);
});

test('Command can be constructed with visibility set to false', () => {
	const command = new Command('name', () => true, null, false);

	expect(command.getName()).toBe('name');
	expect(command.hasDescription()).toBe(false);
	expect(command.getDescription()).toBe(null);
	expect(command.isVisible(newPlayerObjectMock())).toBe(false);
});

test('Command can be constructed with custom visibility handler', () => {
	const command                    = new Command('name', () => true, null, player => 1 === player.id),
	      playerThatCanUseCommand    = newPlayerObjectMock(1),
	      playerThatCannotUseCommand = newPlayerObjectMock(2);

	expect(command.getName()).toBe('name');
	expect(command.hasDescription()).toBe(false);
	expect(command.getDescription()).toBe(null);
	expect(command.isVisible(playerThatCanUseCommand)).toBe(true);
	expect(command.isVisible(playerThatCannotUseCommand)).toBe(false);
});

test('Command execution is skipped when it is not visible', () => {
	const handler     = jest.fn(),
	      command     = new Command('name', handler, null, false),
	      playerDummy = newPlayerObjectMock(1);

	expect(command.isVisible(playerDummy)).toBe(false);
	expect(command.execute(playerDummy, undefined, '')).toBe(true);
	expect(handler).not.toHaveBeenCalled();
});

test.each([true, false])('Command is executed when it is visible and returns %p', (expected) => {
	const handler     = jest.fn(() => expected),
	      command     = new Command('name', handler, null, true),
	      playerDummy = newPlayerObjectMock(1),
	      arg         = 'lorem',
	      message     = 'ipsum';

	expect(command.isVisible(playerDummy)).toBe(true);
	expect(command.execute(playerDummy, arg, message)).toBe(expected);
	expect(handler).toHaveBeenCalledTimes(1);
	expect(handler).toHaveBeenCalledWith(playerDummy, arg, message);
	expect(handler).toHaveReturnedWith(expected);
});
