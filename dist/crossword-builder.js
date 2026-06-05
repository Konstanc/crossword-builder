"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const input_1 = require("./input");
const solver_1 = require("./solver");
const output_1 = require("./output");
const utils_1 = require("./utils");
let dictFileName = (0, utils_1.getArgValue)('-w') || 'words.txt';
let fieldFileName = (0, utils_1.getArgValue)('-f') || 'field.txt';
function main() {
    try {
        const conditions = (0, input_1.readField)(fieldFileName);
        const words = (0, input_1.readWords)(dictFileName);
        const solvedField = (0, solver_1.solve)(words, conditions);
        if (solvedField)
            (0, output_1.printFieldValues)(solvedField);
        else
            console.log('Could not find valid crossword.');
    }
    catch (e) {
        console.error('Error');
        console.error(e);
    }
}
main();
//# sourceMappingURL=crossword-builder.js.map