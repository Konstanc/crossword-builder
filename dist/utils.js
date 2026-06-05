"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wpToFieldIndex = exports.wpToField2dXY = void 0;
exports.getArgValue = getArgValue;
exports.getCleanField = getCleanField;
exports.getWordPlaceValues = getWordPlaceValues;
exports.fillFieldWordPlace = fillFieldWordPlace;
const { argv } = require('node:process');
function getArgValue(arg) {
    const argList = argv;
    const argIndex = argList.indexOf(arg);
    if (argIndex >= 0 && argIndex + 1 < argList.length) {
        return argList[argIndex + 1];
    }
}
function getCleanField(field) {
    return { ...field, values: Array.from({ length: field.length }, () => '') };
}
//** Get wordPlaceValues from the field */
function getWordPlaceValues(field, wp) {
    const res = [];
    for (let i = 0; i < wp.length; i++) {
        res.push(field.values[(0, exports.wpToFieldIndex)(field, wp, i)]);
    }
    return res;
}
const wpToField2dXY = (wp, i) => wp.horizontal ? { x: wp.x + i, y: wp.y } : { x: wp.x, y: wp.y + i };
exports.wpToField2dXY = wpToField2dXY;
const wpToFieldIndex = (field, wp, i) => wp.start + i * (wp.horizontal ? 1 : field.width);
exports.wpToFieldIndex = wpToFieldIndex;
//** Put the word to the field values in wordplace */
function fillFieldWordPlace(field, wp, word = 'XXXXXXXXXX') {
    for (let i = 0; i < wp.length; i++) {
        const letter = word[i];
        field.values[(0, exports.wpToFieldIndex)(field, wp, i)] = letter;
    }
}
//# sourceMappingURL=utils.js.map