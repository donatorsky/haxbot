import {getTime} from "../../../../src/Utils/Utils";

test('formatted time for 0 is 00:00', () => {
	expect(getTime(0)).toBe('00:00');
});

test('formatted time for 1 to 9 seconds is 00:0x', () => {
	const time = Math.round(Math.random() * 8) + 1;
	
	expect(getTime(time)).toBe(`00:0${time}`);
});

test('formatted time for 10 to 59 seconds is 00:xx', () => {
	const time = Math.round(Math.random() * 49) + 10;
	
	expect(getTime(time)).toBe(`00:${time}`);
});

test('formatted time for 60 seconds is 01:00', () => {
	expect(getTime(60)).toBe('01:00');
});

test('formatted time for 1 to 9 minutes + random seconds is 0x:xx', () => {
	const seconds = Math.round(Math.random() * 59);
	const minutes = Math.round(Math.random() * 8) + 1;
	
	expect(getTime(60 * minutes + seconds)).toBe(`0${minutes}:${seconds.toString().padStart(2, '0')}`);
});

test('formatted time for 10 to 59 minutes + random seconds is xx:xx', () => {
	const seconds = Math.round(Math.random() * 59);
	const minutes = Math.round(Math.random() * 49) + 10;
	
	expect(getTime(60 * minutes + seconds)).toBe(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
});

test('formatted time for 1 hour is 01:00:00', () => {
	expect(getTime(3600)).toBe('01:00:00');
});

test('formatted time for 1 to 9 hours + random minutes + random seconds is 0x:xx:xx', () => {
	const seconds = Math.round(Math.random() * 59),
	      minutes = Math.round(Math.random() * 8) + 1,
	      hours   = Math.round(Math.random() * 8) + 1;
	
	expect(getTime(3600 * hours + 60 * minutes + seconds)).toBe(`0${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
});

test('formatted time for 25 hours is 25:xx:xx', () => {
	expect(getTime(3600 * 25)).toBe('25:00:00');
});

test('formatted time for 100 hours is 100:xx:xx', () => {
	expect(getTime(3600 * 100)).toBe('100:00:00');
});
