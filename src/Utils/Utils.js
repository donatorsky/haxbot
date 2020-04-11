/**
 * Retrieves N elements from data array randomly.
 *
 * @param {Array} data
 * @param {number} number
 */
export function popNRandomElements(data, number) {
	if (0 === data.length || number < 1) {
		return [];
	}
	
	const randomElements = [];
	let randomElementIndex;
	
	while ((number--) >= 1) {
		randomElementIndex = Math.floor(Math.random() * data.length);
		
		randomElements.push(data[randomElementIndex]);
		data.splice(randomElementIndex, 1)
	}
	
	return randomElements;
}

/**
 * @param {number} time
 *
 * @return {string}
 */
export function getTime(time) {
	const s = (time % 60) | 0;
	
	time = (time - s) / 60;
	
	const i = time >= 1 ?
		(time % 60) | 0 :
		0;
	
	time = (time - i) / 60;
	
	const h = time | 0;
	
	return (h > 0 ? `${h.toString().padStart(2, '0')}:` : "") + `${i.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * @param {Position|DiscPropertiesObject} objectA
 * @param {Position|DiscPropertiesObject} objectB
 *
 * @return {number}
 */
export function calculateDistance(objectA, objectB) {
	return Math.sqrt(Math.pow(objectA.x - objectB.x, 2) + Math.pow(objectA.y - objectB.y, 2));
}

/**
 * @param {Array.<string>} headers
 * @param {Array.<Array>} data
 *
 * @return {string}
 */
export function table(headers, data) {
	if (data.length === 0) {
		return '';
	}
	
	const cols = headers.length,
	      rows = [];
	let i, length, line;
	
	for (const item of data) {
		line = new Array(cols).fill('');
		length = Math.min(cols, item.length);
		
		for (i = length - 1; i >= 0; --i) {
			line[i] = `${headers[i]} (${item[i]})`;
		}
		
		for (i = length; i < cols; ++i) {
			line[i] = `${headers[i]} (---)`;
		}
		
		rows.push(line.join(", "));
	}
	
	return ' - ' + rows.join("\n - ");
}

// /**
//  * Better, but currently unusable version of tabler. Valid only when HaxBall will add constant width fonts.
//  *
//  * @param {Array.<string>} headers
//  * @param {Array.<Array>} data
//  *
//  * @return {string}
//  */
// export function table2(headers, data) {
// 	const cols       = headers.length,
// 	      colsWidths = (new Array(cols)).fill(0);
//
// 	for (const idx in headers) {
// 		colsWidths[idx] = headers[idx].length;
// 	}
//
// 	let i, length;
//
// 	for (const item of data) {
// 		for (i = Math.min(cols, item.length) - 1; i >= 0; --i) {
// 			length = item[i].length;
//
// 			if (length > colsWidths[i]) {
// 				colsWidths[i] = length;
// 			}
// 		}
// 	}
//
// 	let line;
// 	const rows = [
// 		headers.map((value, index) => value.toString().padEnd(colsWidths[index], ' ')).join(" │ "),
// 		colsWidths.map(value => ''.padEnd(value, '─')).join("─┼─")
// 	];
//
// 	for (const item of data) {
// 		line = new Array(cols).fill('');
// 		length = Math.min(cols, item.length);
//
// 		for (i = length - 1; i >= 0; --i) {
// 			line[i] = item[i].toString().padEnd(colsWidths[i], ' ');
// 		}
//
// 		for (i = length; i < cols; ++i) {
// 			line[i] = ''.padEnd(colsWidths[i], ' ');
// 		}
//
// 		rows.push(line.join(" │ "));
// 	}
//
// 	return rows.join("\n");
// }
