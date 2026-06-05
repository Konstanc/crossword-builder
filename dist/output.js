"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printValues = printValues;
exports.printFieldValues = printFieldValues;
function fieldTo2D(field) {
    const res = [];
    for (let i = 0; i < field.length; i += field.width) {
        res.push(field.values.slice(i, i + field.width).map((v) => v || '*'));
    }
    return res;
}
function printValues(values) {
    values.forEach((line) => {
        console.log(line.join(''));
    });
}
function printFieldValues(field) {
    printValues(fieldTo2D(field));
}
//# sourceMappingURL=output.js.map