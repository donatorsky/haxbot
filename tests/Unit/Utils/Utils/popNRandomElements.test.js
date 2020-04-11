import {popNRandomElements} from "../../../../src/Utils/Utils";

test('empty array is returned when empty data is provided', () => {
	expect(popNRandomElements([], 123)).toHaveLength(0);
});

test('empty array is returned when expected number of elements is less than 1', () => {
	expect(popNRandomElements([1, 2, 3], 0)).toHaveLength(0);
	expect(popNRandomElements([1, 2, 3], -1)).toHaveLength(0);
	expect(popNRandomElements([1, 2, 3], Math.random() * -1000 + 1)).toHaveLength(0);
});

test('returned array has exactly 1 element when 1 element is expected', () => {
	expect(popNRandomElements([1, 2, 3], 1)).toHaveLength(1);
});

test('returned array has exactly n elements when n elements are expected', () => {
	const data   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
	      number = Math.floor(Math.random() * (data.length - 2)) + 2;

	expect(popNRandomElements(data, number)).toHaveLength(number);
});

test('input data is reduced by exactly 1 element when 1 element is expected', () => {
	const data   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
	      length = data.length;

	popNRandomElements(data, 1);

	expect(data).toHaveLength(length - 1);
});

test('input data is reduced by exactly n elements when n elements are expected', () => {
	const data   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
	      number = Math.floor(Math.random() * (data.length - 2)) + 2,
	      length = data.length;

	popNRandomElements(data, number);

	expect(data).toHaveLength(length - number);
});

test('2 elements are returned when expected number of elements is in (2; 3) range', () => {
	const data   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
	      number = Math.random() * 0.9999999999999 + 2.0000000000001;

	expect(popNRandomElements(data, 2.0000000000001)).toHaveLength(2);
	expect(popNRandomElements(data, 2.9999999999999)).toHaveLength(2);
	expect(popNRandomElements(data, number)).toHaveLength(2);
});
