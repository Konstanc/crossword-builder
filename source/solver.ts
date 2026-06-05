import { cleanCopyState, fillWordPlaceWithIntersections } from './utils';
import { MatchIndex, SolveStep, State, WordPlace } from './types';

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

function wordPlaceToStep(stepWordPlace: WordPlace): SolveStep {
    const filledCharIndexes: number[] = [];
    stepWordPlace.values.forEach(
        (char, i) => char && filledCharIndexes.push(i),
    );

    const name = stepWordPlace.length + filledCharIndexes.join('');
    // TODO: No need to add length to key
    const wordToKey = (word: string) =>
        word.length + filledCharIndexes.map((i) => word[i]).join('');
    const wordShouldBeIndexed = (word: string) =>
        word.length === stepWordPlace.length;
    const wordPlaceToKey = (wp: WordPlace) =>
        wp.length + filledCharIndexes.map((i) => wp.values[i]).join('');

    return {
        wordPlace: stepWordPlace,
        matchIndex: { name, wordToKey, wordPlaceToKey, wordShouldBeIndexed },
    };
}

function buildSolvePath(state: State): SolveStep[] {
    const { field, wordPlaces } = cleanCopyState(state);
    // Starting with the most connected word place as a basic optimization.
    wordPlaces.sort((a, b) => b.intersections.length - a.intersections.length);
    const solvePath: SolveStep[] = [];
    while (wordPlaces.length) {
        const wp = wordPlaces.shift()!;
        solvePath.push(wordPlaceToStep(wp));
        fillWordPlaceWithIntersections(wp);
        wordPlaces.sort(
            (a, b) =>
                b.values.filter((v) => v).length -
                a.values.filter((v) => v).length,
        );
    }
    return solvePath;
}

function connectStateToSteps(state: State, solveSteps: SolveStep[]) {
    return solveSteps.map((step) => {
        const wordPlace =
            state.wordPlaces.find((wp) => wp.id === step.wordPlace.id) ||
            step.wordPlace;
        return { ...step, wordPlace };
    });
}

// Mutating the state is not ideal but fast and good enough for the first version
function solveStepsFrom(
    words: string[],
    selectedWords: string[],
    solveSteps: SolveStep[],
    stepN: number,
): boolean {
    if (stepN >= solveSteps.length) return true;
    const solveStep = solveSteps[stepN];
    const wp = solveStep.wordPlace;
    const key = solveStep.matchIndex.wordPlaceToKey(solveStep.wordPlace);
    const candidates: number[] = solveStep.matchIndex.index?.get(key) || [];
    // Not using candidates.find() to avoid confusion because we are mutating wordPlaces here.
    // TODO: make this true functional?
    for (let i = 0; i < candidates.length; i++) {
        const candidateWord = words[candidates[i]];
        fillWordPlaceWithIntersections(wp, candidateWord); // Overfilling, optimize?
        if (
            selectedWords.indexOf(candidateWord) < 0 &&
            solveStepsFrom(
                words,
                [...selectedWords, candidateWord],
                solveSteps,
                stepN + 1,
            )
        )
            return true;
    }
    return false;
}

function doSolve(words: string[], solveSteps: SolveStep[]) {
    return solveStepsFrom(words, [], solveSteps, 0);
}

export function solve(words: string[], initialState: State) {
    let solvePath = buildSolvePath(initialState);
    buildIndices(words, solvePath);
    const solveState = cleanCopyState(initialState);
    solvePath = connectStateToSteps(solveState, solvePath);
    const solved = doSolve(words, solvePath);
    return solveState;
}
