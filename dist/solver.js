"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solve = solve;
const utils_1 = require("./utils");
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
function buildSolvePath(state) {
    const { field, wordPlaces } = (0, utils_1.cleanCopyState)(state);
    // Starting with the most connected word place as a basic optimization.
    wordPlaces.sort((a, b) => b.intersections.length - a.intersections.length);
    const solvePath = [];
    while (wordPlaces.length) {
        const wp = wordPlaces.shift();
        solvePath.push(wordPlaceToStep(wp));
        (0, utils_1.fillWordPlaceWithIntersections)(wp);
        wordPlaces.sort((a, b) => b.values.filter((v) => v).length -
            a.values.filter((v) => v).length);
    }
    return solvePath;
}
function connectStateToSteps(state, solveSteps) {
    return solveSteps.map((step) => {
        const wordPlace = state.wordPlaces.find((wp) => wp.id === step.wordPlace.id) ||
            step.wordPlace;
        return { ...step, wordPlace };
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
        (0, utils_1.fillWordPlaceWithIntersections)(wp, candidateWord); // Overfilling, optimize?
        if (selectedWords.indexOf(candidateWord) < 0 &&
            solveStepsFrom(words, [...selectedWords, candidateWord], solveSteps, stepN + 1))
            return true;
    }
    return false;
}
function doSolve(words, solveSteps) {
    return solveStepsFrom(words, [], solveSteps, 0);
}
function solve(words, initialState) {
    let solvePath = buildSolvePath(initialState);
    buildIndices(words, solvePath);
    const solveState = (0, utils_1.cleanCopyState)(initialState);
    solvePath = connectStateToSteps(solveState, solvePath);
    const solved = doSolve(words, solvePath);
    return solved ? solveState : false;
}
//# sourceMappingURL=solver.js.map