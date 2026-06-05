import { readField, readWords } from './input';
import { solve } from './solver';
import { printFieldValues, printValues } from './output';
import { getArgValue } from './utils';

let dictFileName = getArgValue('-w') || 'words.txt';
let fieldFileName = getArgValue('-f') || 'field.txt';

function main() {
    try {
        const conditions = readField(fieldFileName);

        const words = readWords(dictFileName);

        const solvedField = solve(words, conditions);
        if (solvedField) printFieldValues(solvedField);
        else console.log('Could not find valid crossword.');
    } catch (e) {
        console.error('Error');
        console.error(e);
    }
}

main();
