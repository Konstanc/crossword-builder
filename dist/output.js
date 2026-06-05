"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printValues = printValues;
exports.printStateValues = printStateValues;
exports.printWordPlaces = printWordPlaces;
const utils_1 = require("./utils");
function wordPlaceValuesToArray(state) {
    const { field, wordPlaces } = state;
    const res = Array.from({ length: field.length }, () => Array.from({ length: field[0].length }, () => '*'));
    wordPlaces.forEach((wp) => {
        for (let i = 0; i < wp.length; i++) {
            const { x, y } = (0, utils_1.wpToFieldXY)(wp, i);
            res[y][x] = wp.values[i] || '*';
        }
    });
    return res;
}
function printValues(values) {
    values.forEach((line) => {
        console.log(line.join(''));
    });
}
function printStateValues(state) {
    printValues(wordPlaceValuesToArray(state));
}
//** Print wordPlaces list for debug purpose */
function printWordPlaces(wordPlaces) {
    wordPlaces.forEach((wp) => {
        console.log(wp.id, wp.horizontal ? 'h' : 'v', [wp.x, wp.y].join(', '), wp.values.map((v) => v || '*').join(''));
    });
}
//# sourceMappingURL=output.js.map