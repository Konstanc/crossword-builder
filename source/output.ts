import { Field } from './types';

function fieldTo2D(field: Field): string[][] {
    const res: string[][] = [];
    for (let i = 0; i < field.length; i += field.width) {
        res.push(field.values.slice(i, i + field.width).map((v) => v || '*'));
    }
    return res;
}

export function printValues(values: string[][]) {
    values.forEach((line) => {
        console.log(line.join(''));
    });
}

export function printFieldValues(field: Field) {
    printValues(fieldTo2D(field));
}
