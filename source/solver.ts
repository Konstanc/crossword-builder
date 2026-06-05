import { fillFieldWordPlace, getCleanField, getWordPlaceValues } from './utils';
import { Field, MatchIndex, SolveStep, State, WordPlace } from './types';

function buildIndices(words: string[], solveSteps: SolveStep[]) {
    const indices = new Map<string, MatchIndex>();
    solveSteps.forEach(
        (step) =>
            !indices.has(step.matchIndex.name) &&
            indices.set(step.matchIndex.name, step.matchIndex),
    );
    indices.forEach(
        (matchIndex) => (matchIndex.index = new Map<string, number[]>()),
    );
    words.forEach((word, i) => {
        indices.forEach((matchIndex) => {
            if (matchIndex.wordShouldBeIndexed(word)) {
                const key = matchIndex.wordToKey(word);
                let indexWords = matchIndex.index!.get(key);
                if (!indexWords) {
                    indexWords = [];
                    matchIndex.index!.set(key, indexWords);
                }
                // Randomizing order to have different crosswords on each run.
                const placeTo = Math.floor(
                    Math.random() * (indexWords.length + 1),
                );
                indexWords.splice(placeTo, 0, i);
            }
        });
    });
    solveSteps.forEach((step) => {
        const matchIndex = indices.get(step.matchIndex.name);
        if (matchIndex) step.matchIndex = matchIndex;
    });

    return indices;
}

function wordPlaceToStep(field: Field, stepWordPlace: WordPlace): SolveStep {
    const filledCharIndexes: number[] = [];
    getWordPlaceValues(field, stepWordPlace).forEach(
        (char, i) => char && filledCharIndexes.push(i),
    );

    const name = stepWordPlace.length + filledCharIndexes.join('');
    const wordToKey = (word: string) =>
        word.length + filledCharIndexes.map((i) => word[i]).join('');
    const wordShouldBeIndexed = (word: string) =>
        word.length === stepWordPlace.length;
    const wordPlaceToKey = (inField: Field, wp: WordPlace) =>
        wp.length +
        filledCharIndexes
            .map((i) => getWordPlaceValues(inField, wp)[i])
            .join('');

    return {
        wordPlace: stepWordPlace,
        matchIndex: { name, wordToKey, wordPlaceToKey, wordShouldBeIndexed },
    };
}

function buildSolvePath(state: State): SolveStep[] {
    const { wordPlaces } = state;
    const field = getCleanField(state.field);
    // Starting with the most connected word place as a basic optimization.
    wordPlaces.sort((a, b) => b.intersections.length - a.intersections.length);
    const solvePath: SolveStep[] = [];
    while (wordPlaces.length) {
        const wp = wordPlaces.shift()!;
        solvePath.push(wordPlaceToStep(field, wp));
        fillFieldWordPlace(field, wp);
        wordPlaces.sort(
            (a, b) =>
                getWordPlaceValues(field, b).filter((v) => v).length -
                getWordPlaceValues(field, a).filter((v) => v).length,
        );
    }
    return solvePath;
}

// Mutating the state is not ideal but fast and good enough for the first version
function solveStepsFrom(
    words: string[],
    selectedWords: string[],
    field: Field,
    solveSteps: SolveStep[],
    stepN: number,
): boolean {
    if (stepN >= solveSteps.length) return true;
    const solveStep = solveSteps[stepN];
    const wp = solveStep.wordPlace;
    const key = solveStep.matchIndex.wordPlaceToKey(field, solveStep.wordPlace);
    const candidates: number[] = solveStep.matchIndex.index?.get(key) || [];
    // Not using candidates.find() to avoid confusion because we are mutating field here.
    // TODO: can we make this true functional?
    for (let i = 0; i < candidates.length; i++) {
        const candidateWord = words[candidates[i]];
        fillFieldWordPlace(field, wp, candidateWord);
        if (
            selectedWords.indexOf(candidateWord) < 0 &&
            solveStepsFrom(
                words,
                [...selectedWords, candidateWord],
                field,
                solveSteps,
                stepN + 1,
            )
        )
            return true;
    }
    return false;
}

function doSolve(words: string[], field: Field, solveSteps: SolveStep[]) {
    return solveStepsFrom(words, [], field, solveSteps, 0);
}

export function solve(words: string[], state: State) {
    const solvePath = buildSolvePath(state);
    buildIndices(words, solvePath);
    const field = getCleanField(state.field);
    const solved = doSolve(words, field, solvePath);
    return solved ? field : false;
}
