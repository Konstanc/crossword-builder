import { readField, readWords } from './input';
import { solve } from './solver';
import { printStateValues, printValues } from './output';
import { getArgValue } from './utils';

let dictFileName = getArgValue('-w') || 'words.txt';
let fieldFileName = getArgValue('-f') || 'field.txt';

function main() {
    try {
        const initialState = readField(fieldFileName);

        const words = readWords(dictFileName);

        const solveState = solve(words, initialState);
        if (solveState) printStateValues(solveState);
        else console.log('Could not find valid crossword.');
    } catch (e) {
        console.error('Error');
        console.error(e);
    }
}

main();
