"use strict";
// TODO: Copied obsolete template. Switch to modern typed modules if needed.
const fs = require('fs');
// TODO: Read from params
let dictFileName = 'words.txt';
let fieldFileName = 'field.txt';
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
function connectStateToSteps(state, solveSteps) {
    return solveSteps.map((step) => {
        const wordPlace = state.wordPlaces.find((wp) => wp.id === step.wordPlace.id) ||
            step.wordPlace;
        return { ...step, wordPlace };
    });
}
function wordPlaceToStep(stepWordPlace) {
    const filledCharIndexes = [];
    stepWordPlace.values.forEach((char, i) => char && filledCharIndexes.push(i));
    const name = stepWordPlace.length + filledCharIndexes.join('');
    // TODO: No need to add length to key
    const wordToKey = (word) => word.length + filledCharIndexes.map((i) => word[i]).join('');
    const wordShouldBeIndexed = (word) => word.length === stepWordPlace.length;
    const wordPlaceToKey = (wp) => wp.length + filledCharIndexes.map((i) => wp.values[i]).join('');
    return {
        wordPlace: stepWordPlace,
        matchIndex: { name, wordToKey, wordPlaceToKey, wordShouldBeIndexed },
    };
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
function detectWordPlaces(field) {
    const wordPlaces = [];
    let id = 0;
    for (let row = 0; row < field.length; row++) {
        wordPlaces.push(...lineToWordPlaces(field[row]).map(({ start, end }) => ({
            id: id++,
            horizontal: true,
            x: start,
            y: row,
            length: end - start,
            intersections: [],
            values: [],
        })));
    }
    const columns = field[0].map((_, i) => field.map((row) => row[i]));
    for (let col = 0; col < field[0].length; col++) {
        wordPlaces.push(...lineToWordPlaces(columns[col]).map(({ start, end }) => ({
            id: id++,
            horizontal: false,
            x: col,
            y: start,
            length: end - start,
            intersections: [],
            values: Array.from({ length: end - start }, () => ''),
        })));
    }
    return wordPlaces;
}
const wpToFieldXY = (wp, i) => wp.horizontal ? { x: wp.x + i, y: wp.y } : { x: wp.x, y: wp.y + i };
// TODO: Looks like it's time to use classes and move this to a method. :\
// TODO: make this links in WordPlace instead?
function getWPCells({ field }, wp) {
    const res = [];
    for (let i = 0; i < wp.length; i++) {
        const { x, y } = wpToFieldXY(wp, i);
        res.push(field[y][x]);
    }
    return res;
}
// Putting links everywhere for ease of processing
function connectWordPlaces(state) {
    const { field, wordPlaces } = state;
    wordPlaces.forEach((wp) => getWPCells(state, wp).forEach((cell) => cell.wordPlaces.push(wp)));
    wordPlaces.forEach((wp) => getWPCells(state, wp).forEach((cell) => cell.wordPlaces
        .filter((w) => w.id !== wp.id)
        .forEach((w) => {
        if (!wp.intersections.includes(w)) {
            wp.intersections.push(w);
        }
    })));
}
function wordPlaceValuesToArray(state) {
    const { field, wordPlaces } = state;
    const res = Array.from({ length: field.length }, () => Array.from({ length: field[0].length }, () => '*'));
    wordPlaces.forEach((wp) => {
        for (let i = 0; i < wp.length; i++) {
            const { x, y } = wpToFieldXY(wp, i);
            res[y][x] = wp.values[i] || '*';
        }
    });
    return res;
}
function readField(fileName) {
    const field = fs.readFileSync(fileName, { encoding: 'utf8' })
        .split('\n')
        .map((line) => line.trim())
        .map((line) => line.split('').map((c) => ({ used: c !== '*', wordPlaces: [] })));
    const state = { field, wordPlaces: detectWordPlaces(field) };
    connectWordPlaces(state);
    return state;
}
function fillWordPlaceWithIntersections(wp, word = 'XXXXXXXXXX') {
    for (let i = 0; i < wp.length; i++) {
        const letter = word[i];
        const { x, y } = wpToFieldXY(wp, i);
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
function buildSolvePath(state) {
    const { field, wordPlaces } = cleanCopyState(state);
    // Starting with the most connected word place as a basic optimization.
    wordPlaces.sort((a, b) => b.intersections.length - a.intersections.length);
    const solvePath = [];
    while (wordPlaces.length) {
        const wp = wordPlaces.shift();
        solvePath.push(wordPlaceToStep(wp));
        fillWordPlaceWithIntersections(wp);
        wordPlaces.sort((a, b) => b.values.filter((v) => v).length -
            a.values.filter((v) => v).length);
    }
    return solvePath;
}
// Assuming we have enough memory for all the indices. Otherwise everything gets much more complicated and interesting.
function buildIndices(words, solveSteps) {
    const indices = new Map();
    solveSteps.forEach((step) => !indices.has(step.matchIndex.name) &&
        indices.set(step.matchIndex.name, step.matchIndex));
    indices.forEach((matchIndex) => (matchIndex.index = new Map()));
    words.forEach((word, i) => {
        indices.forEach((matchIndex) => {
            if (matchIndex.wordShouldBeIndexed(word)) {
                const key = matchIndex.wordToKey(word);
                let indexWords = matchIndex.index.get(key);
                if (!indexWords) {
                    indexWords = [];
                    matchIndex.index.set(key, indexWords);
                }
                // Randomizing order to have different crosswords on each run.
                const placeTo = Math.floor(Math.random() * (indexWords.length + 1));
                indexWords.splice(placeTo, 0, i);
            }
        });
    });
    solveSteps.forEach((step) => {
        const matchIndex = indices.get(step.matchIndex.name);
        if (matchIndex)
            step.matchIndex = matchIndex;
    });
    return indices;
}
function readWords(fileName) {
    const words = fs.readFileSync(fileName, { encoding: 'utf8' })
        .split('\n')
        .map((line) => line.trim())
        .filter((word) => word.length <= 7);
    return words;
}
function printValues(values) {
    values.forEach((line) => {
        console.log(line.join(''));
    });
}
function printWordPlaces(wordPlaces) {
    wordPlaces.forEach((wp) => {
        console.log(wp.id, wp.horizontal ? 'h' : 'v', [wp.x, wp.y].join(', '), wp.values.map((v) => v || '*').join(''));
    });
}
// Mutating the state is not ideal but fast and good enough for the first version
function solveStepsFrom(words, selectedWords, solveSteps, stepN) {
    var _a;
    if (stepN >= solveSteps.length)
        return true;
    const solveStep = solveSteps[stepN];
    const wp = solveStep.wordPlace;
    const key = solveStep.matchIndex.wordPlaceToKey(solveStep.wordPlace);
    const candidates = ((_a = solveStep.matchIndex.index) === null || _a === void 0 ? void 0 : _a.get(key)) || [];
    // Not using candidates.find() to avoid confusion because we are mutating wordPlaces here.
    // TODO: make this true functional?
    for (let i = 0; i < candidates.length; i++) {
        const candidateWord = words[candidates[i]];
        fillWordPlaceWithIntersections(wp, candidateWord); // Overfilling, optimize?
        if (selectedWords.indexOf(candidateWord) < 0 &&
            solveStepsFrom(words, [...selectedWords, candidateWord], solveSteps, stepN + 1))
            return true;
    }
    return false;
}
function solve(words, solveSteps) {
    let stepN = 0;
    return solveStepsFrom(words, [], solveSteps, stepN);
}
function main() {
    const initialState = readField(fieldFileName);
    let solvePath = buildSolvePath(initialState);
    const words = readWords(dictFileName);
    buildIndices(words, solvePath);
    const solveState = cleanCopyState(initialState);
    solvePath = connectStateToSteps(solveState, solvePath);
    const solved = solve(words, solvePath);
    printValues(wordPlaceValuesToArray(solveState));
}
main();
//# sourceMappingURL=crossword-builder.js.map