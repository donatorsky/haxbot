import {calculateDistance} from "../../../../src/Utils/Utils";

/**
 * @param {number} x
 * @param {number} y
 *
 * @return {Position}
 */
function newPosition(x, y) {
	return {x, y};
}

/**
 * @param {number} x
 * @param {number} y
 *
 * @return {DiscPropertiesObject}
 */
function newDiscPropertiesObject(x, y) {
	return {x, y};
}

test('distance between two Position objects is 5', () => {
	expect(calculateDistance(
		newPosition(0, 3),
		newPosition(4, 0),
	)).toBe(5.0);
});

test('distance between two DiscPropertiesObject objects is 13', () => {
	expect(calculateDistance(
		newDiscPropertiesObject(5, 0),
		newDiscPropertiesObject(0, 12),
	)).toBe(13.0);
});

test('distance between Position and DiscPropertiesObject objects is 25', () => {
	expect(calculateDistance(
		newPosition(7, 0),
		newDiscPropertiesObject(0, 24),
	)).toBe(25.0);
});

test('distance between DiscPropertiesObject and Position objects is 17', () => {
	expect(calculateDistance(
		newDiscPropertiesObject(8, 0),
		newPosition(0, 15),
	)).toBe(17.0);
});
