"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTIONS = void 0;
const input_1 = require("./input");
const solver_1 = require("./solver");
const output_1 = require("./output");
const utils_1 = require("./utils");
const DICT_FILE = (0, utils_1.getArgValue)('-w') || 'words.txt';
const FIELD_FILE = (0, utils_1.getArgValue)('-f') || 'field.txt';
exports.OPTIONS = {
    verbose: (0, utils_1.getBoolArgValue)('-v'),
    noRandom: (0, utils_1.getBoolArgValue)('-nr'),
};
function main() {
    try {
        const conditions = (0, input_1.readField)(FIELD_FILE);
        const words = (0, input_1.readWords)(DICT_FILE);
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