import { wpToFieldXY } from './utils';
import { readField, readWords } from './input';
import { solve } from './solver';
import { Cell, Field, MatchIndex, SolveStep, State, WordPlace } from './types';
import { printStateValues, printValues } from './output';

// TODO: Read from params
let dictFileName = 'words.txt';
let fieldFileName = 'field.txt';


function main() {
    const initialState = readField(fieldFileName);

    const words = readWords(dictFileName);

    const solveState = solve(words, initialState);
    printStateValues(solveState)
    
}

main();
