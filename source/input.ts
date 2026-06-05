import { wpToFieldXY } from './utils';
import { Cell, Field, State, WordPlace } from './types';

// TODO: Switch to correct typed import
declare var require: any;
const fs = require('fs');

// TODO: Looks like it's time to use classes and move this to a method. :\
// TODO: make this links in WordPlace instead?
function getWPCells({ field }: State, wp: WordPlace): Cell[] {
    const res: Cell[] = [];
    for (let i = 0; i < wp.length; i++) {
        const { x, y } = wpToFieldXY(wp, i);
        res.push(field[y][x]);
    }
    return res;
}

// Putting links everywhere for ease of processing
function connectWordPlaces(state: State) {
    const { field, wordPlaces } = state;
    wordPlaces.forEach((wp) =>
        getWPCells(state, wp).forEach((cell) => cell.wordPlaces.push(wp)),
    );

    wordPlaces.forEach((wp) =>
        getWPCells(state, wp).forEach((cell) =>
            cell.wordPlaces
                .filter((w) => w.id !== wp.id)
                .forEach((w) => {
                    if (!wp.intersections.includes(w)) {
                        wp.intersections.push(w);
                    }
                }),
        ),
    );
}

// A bit cumbersome. Sure there is more elegant way.
// Not worth optimization so leaving it as is.
function lineToWordPlaces(line: Cell[]): { start: number; end: number }[] {
    const res: { start: number; end: number }[] = [];

    let pos = -1;
    do {
        const start = line.findIndex((cell, i) => i > pos && cell.used);
        if (start >= 0) {
            let end = line.findIndex((cell, i) => i > start && !cell.used);
            if (end < 0) end = line.length;

            if (end - start > 1) {
                // should be a word
                res.push({ start, end });
            }

            pos = end;
        } else {
            pos = line.length;
        }
    } while (pos < line.length);
    return res;
}

function detectWordPlaces(field: Field): WordPlace[] {
    const wordPlaces: WordPlace[] = [];
    let id = 0;
    for (let row = 0; row < field.length; row++) {
        wordPlaces.push(
            ...lineToWordPlaces(field[row]).map(({ start, end }) => ({
                id: id++,
                horizontal: true,
                x: start,
                y: row,
                length: end - start,
                intersections: [],
                values: [],
            })),
        );
    }
    const columns = field[0].map((_, i) => field.map((row) => row[i]));
    for (let col = 0; col < field[0].length; col++) {
        wordPlaces.push(
            ...lineToWordPlaces(columns[col]).map(({ start, end }) => ({
                id: id++,
                horizontal: false,
                x: col,
                y: start,
                length: end - start,
                intersections: [],
                values: Array.from({ length: end - start }, () => ''),
            })),
        );
    }
    return wordPlaces;
}

export function readField(fileName: string): {
    field: Field;
    wordPlaces: WordPlace[];
} {
    const field = (fs.readFileSync(fileName, { encoding: 'utf8' }) as string)
        .split('\n')
        .map((line) => line.trim())
        .map((line) =>
            line.split('').map((c) => ({ used: c !== '*', wordPlaces: [] })),
        );
    const state: State = { field, wordPlaces: detectWordPlaces(field) };
    connectWordPlaces(state);

    return state;
}


export function readWords(fileName: string) {
    const words = (fs.readFileSync(fileName, { encoding: 'utf8' }) as string)
        .split('\n')
        .map((line) => line.trim())
        .filter((word) => word.length <= 7);
    return words;
}