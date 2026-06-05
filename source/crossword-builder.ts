import { readField, readWords } from './input';
import { solve } from './solver';
import { printFieldValues, printValues } from './output';
import { getArgValue, getBoolArgValue } from './utils';

const DICT_FILE = getArgValue('-w') || 'words.txt';
const FIELD_FILE = getArgValue('-f') || 'field.txt';
export const OPTIONS = {
    verbose: getBoolArgValue('-v'),
    noRandom: getBoolArgValue('-nr'),
};

function main() {
    try {
        const conditions = readField(FIELD_FILE);

        const words = readWords(DICT_FILE);

        const solvedField = solve(words, conditions);
        if (solvedField) printFieldValues(solvedField);
        else console.log('Could not find valid crossword.');
    } catch (e) {
        console.error('Error');
        console.error(e);
    }
}

main();
