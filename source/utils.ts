import { Field, WordPlace } from './types';

// TODO: Switch to correct typed import
declare var require: any;
const { argv } = require('node:process');

export function getArgValue(arg: string): string | undefined {
    const argList = argv as string[];
    const argIndex = argList.indexOf(arg);
    if (argIndex >= 0 && argIndex + 1 < argList.length) {
        return argList[argIndex + 1];
    }
}

export function getCleanField(field: Field): Field {
    return { ...field, values: Array.from({ length: field.length }, () => '') };
}

//** Get wordPlaceValues from the field */
export function getWordPlaceValues(field: Field, wp: WordPlace): string[] {
    const res: string[] = [];
    for (let i = 0; i < wp.length; i++) {
        res.push(field.values[wpToFieldIndex(field, wp, i)]);
    }
    return res;
}

export const wpToField2dXY = (wp: WordPlace, i: number) =>
    wp.horizontal ? { x: wp.x + i, y: wp.y } : { x: wp.x, y: wp.y + i };

export const wpToFieldIndex = (field: Field, wp: WordPlace, i: number) =>
    wp.start + i * (wp.horizontal ? 1 : field.width);

export function fillFieldWordPlace(
    field: Field,
    wp: WordPlace,
    word = 'XXXXXXXXXX',
) {
    for (let i = 0; i < wp.length; i++) {
        const letter = word[i];
        field.values[wpToFieldIndex(field, wp, i)] = letter;
    }
}
