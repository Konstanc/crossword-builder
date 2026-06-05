"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const input_1 = require("./input");
const solver_1 = require("./solver");
const output_1 = require("./output");
// TODO: Read from params
let dictFileName = 'words.txt';
let fieldFileName = 'field.txt';
function main() {
    const initialState = (0, input_1.readField)(fieldFileName);
    const words = (0, input_1.readWords)(dictFileName);
    const solveState = (0, solver_1.solve)(words, initialState);
    (0, output_1.printStateValues)(solveState);
}
main();
//# sourceMappingURL=crossword-builder.js.map