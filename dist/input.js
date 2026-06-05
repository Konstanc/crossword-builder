"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readField = readField;
exports.readWords = readWords;
const utils_1 = require("./utils");
const fs = require('fs');
function getWPCells(field, wp) {
    const res = [];
    for (let i = 0; i < wp.length; i++) {
        const { x, y } = (0, utils_1.wpToField2dXY)(wp, i);
        res.push(field[y][x]);
    }
    return res;
}
//** Calculate intersections */
function connectWordPlaces(field, wordPlaces) {
    wordPlaces.forEach((wp) => getWPCells(field, wp).forEach((cell) => cell.wordPlaces.push(wp)));
    wordPlaces.forEach((wp) => getWPCells(field, wp).forEach((cell) => cell.wordPlaces
        .filter((w) => w.id !== wp.id)
        .forEach((w) => {
        if (!wp.intersections.includes(w)) {
            wp.intersections.push(w);
        }
    })));
}
// A bit cumbersome. Sure there is more elegant way.
// Not worth optimization so leaving it as is.
function lineToWordPlaces(line) {
    const res = [];
    let pos = -1;
    do {
        const start = line.findIndex((cell, i) => i > pos && cell.used);
        if (start >= 0) {
            let end = line.findIndex((cell, i) => i > start && !cell.used);
            if (end < 0)
                end = line.length;
            if (end - start > 1) {
                // should be a word
                res.push({ start, end });
            }
            pos = end;
        }
        else {
            pos = line.length;
        }
    } while (pos < line.length);
    return res;
}
function detectWordPlaces(field2d) {
    const fieldWidth = field2d[0].length;
    const wordPlaces = [];
    let id = 0;
    for (let row = 0; row < field2d.length; row++) {
        wordPlaces.push(...lineToWordPlaces(field2d[row]).map(({ start, end }) => ({
            id: id++,
            horizontal: true,
            x: start,
            y: row,
            start: start + row * fieldWidth,
            length: end - start,
            intersections: [],
        })));
    }
    const columns = field2d[0].map((_, i) => field2d.map((row) => row[i]));
    for (let col = 0; col < field2d[0].length; col++) {
        wordPlaces.push(...lineToWordPlaces(columns[col]).map(({ start, end }) => ({
            id: id++,
            horizontal: false,
            x: col,
            y: start,
            start: col + start * fieldWidth,
            length: end - start,
            intersections: [],
        })));
    }
    return wordPlaces;
}
function readField(fileName) {
    const field2d = fs.readFileSync(fileName, { encoding: 'utf8' })
        .split('\n')
        .map((line) => line.trim())
        .map((line) => line.split('').map((c) => ({ used: c !== '*', wordPlaces: [] })));
    const wordPlaces = detectWordPlaces(field2d);
    connectWordPlaces(field2d, wordPlaces);
    const fieldLength = field2d[0].length * field2d.length;
    const field = {
        width: field2d[0].length,
        length: fieldLength,
        values: Array.from({ length: fieldLength }, () => '')
    };
    return { field, wordPlaces };
}
function readWords(fileName) {
    const words = fs.readFileSync(fileName, { encoding: 'utf8' })
        .split('\n')
        .map((line) => line.trim())
        .filter((word) => word.length <= 7);
    return words;
}
//# sourceMappingURL=input.js.map