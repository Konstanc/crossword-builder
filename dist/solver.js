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
function wordPlaceToStep(field, stepWordPlace) {
    const filledCharIndexes = [];
    (0, utils_1.getWordPlaceValues)(field, stepWordPlace).forEach((char, i) => char && filledCharIndexes.push(i));
    const name = stepWordPlace.length + filledCharIndexes.join('');
    const wordToKey = (word) => word.length + filledCharIndexes.map((i) => word[i]).join('');
    const wordShouldBeIndexed = (word) => word.length === stepWordPlace.length;
    const wordPlaceToKey = (inField, wp) => wp.length +
        filledCharIndexes
            .map((i) => (0, utils_1.getWordPlaceValues)(inField, wp)[i])
            .join('');
    return {
        wordPlace: stepWordPlace,
        matchIndex: { name, wordToKey, wordPlaceToKey, wordShouldBeIndexed },
    };
}
function buildSolvePath(state) {
    const { wordPlaces } = state;
    const field = (0, utils_1.getCleanField)(state.field);
    // Starting with the most connected word place as a basic optimization.
    wordPlaces.sort((a, b) => b.intersections.length - a.intersections.length);
    const solvePath = [];
    while (wordPlaces.length) {
        const wp = wordPlaces.shift();
        solvePath.push(wordPlaceToStep(field, wp));
        (0, utils_1.fillFieldWordPlace)(field, wp);
        wordPlaces.sort((a, b) => (0, utils_1.getWordPlaceValues)(field, b).filter((v) => v).length -
            (0, utils_1.getWordPlaceValues)(field, a).filter((v) => v).length);
    }
    return solvePath;
}
// Mutating the state is not ideal but fast and good enough for the first version
function solveStepsFrom(words, selectedWords, field, solveSteps, stepN) {
    var _a;
    if (stepN >= solveSteps.length)
        return true;
    const solveStep = solveSteps[stepN];
    const wp = solveStep.wordPlace;
    const key = solveStep.matchIndex.wordPlaceToKey(field, solveStep.wordPlace);
    const candidates = ((_a = solveStep.matchIndex.index) === null || _a === void 0 ? void 0 : _a.get(key)) || [];
    // Not using candidates.find() to avoid confusion because we are mutating field here.
    // TODO: can we make this true functional?
    for (let i = 0; i < candidates.length; i++) {
        const candidateWord = words[candidates[i]];
        (0, utils_1.fillFieldWordPlace)(field, wp, candidateWord);
        if (selectedWords.indexOf(candidateWord) < 0 &&
            solveStepsFrom(words, [...selectedWords, candidateWord], field, solveSteps, stepN + 1))
            return true;
    }
    return false;
}
function doSolve(words, field, solveSteps) {
    return solveStepsFrom(words, [], field, solveSteps, 0);
}
function solve(words, state) {
    const solvePath = buildSolvePath(state);
    buildIndices(words, solvePath);
    const field = (0, utils_1.getCleanField)(state.field);
    const solved = doSolve(words, field, solvePath);
    return solved ? field : false;
}
//# sourceMappingURL=solver.js.map