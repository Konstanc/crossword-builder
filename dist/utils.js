"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wpToFieldXY = void 0;
exports.getArgValue = getArgValue;
exports.cleanCopyState = cleanCopyState;
exports.fillWordPlaceWithIntersections = fillWordPlaceWithIntersections;
const { argv } = require('node:process');
function getArgValue(arg) {
    const argList = argv;
    const argIndex = argList.indexOf(arg);
    if (argIndex >= 0 && argIndex + 1 < argList.length) {
        return argList[argIndex + 1];
    }
}
//** Get clean copy of state with empty values */
function cleanCopyState(state) {
    const field = state.field.map((line) => line.map((cell) => ({ ...cell })));
    const wordPlaces = state.wordPlaces.map((wp) => ({
        ...wp,
        values: Array.from({ length: wp.length }, () => ''),
    }));
    wordPlaces.forEach((wp) => {
        wp.intersections = wp.intersections.map((intersection) => wordPlaces.find((w) => w.id === intersection.id));
    });
    field.forEach((line) => line.forEach((cell) => {
        cell.wordPlaces = cell.wordPlaces.map((wp) => wordPlaces.find((w) => w.id === wp.id));
    }));
    return { field, wordPlaces };
}
const wpToFieldXY = (wp, i) => wp.horizontal ? { x: wp.x + i, y: wp.y } : { x: wp.x, y: wp.y + i };
exports.wpToFieldXY = wpToFieldXY;
function fillWordPlaceWithIntersections(wp, word = 'XXXXXXXXXX') {
    for (let i = 0; i < wp.length; i++) {
        const letter = word[i];
        const { x, y } = (0, exports.wpToFieldXY)(wp, i);
        wp.values[i] = letter;
        // TODO: Optimize this
        wp.intersections.forEach((intersectingWP) => {
            if (wp.horizontal &&
                !intersectingWP.horizontal &&
                intersectingWP.x === x) {
                intersectingWP.values[y - intersectingWP.y] = letter;
            }
            else if (!wp.horizontal &&
                intersectingWP.horizontal &&
                intersectingWP.y === y) {
                intersectingWP.values[x - intersectingWP.x] = letter;
            }
        });
    }
}
//# sourceMappingURL=utils.js.map