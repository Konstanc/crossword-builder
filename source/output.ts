import { State, WordPlace } from './types';
import { wpToFieldXY } from './utils';

function wordPlaceValuesToArray(state: State) {
    const { field, wordPlaces } = state;
    const res: string[][] = Array.from({ length: field.length }, () =>
        Array.from({ length: field[0].length }, () => '*'),
    );
    wordPlaces.forEach((wp) => {
        for (let i = 0; i < wp.length; i++) {
            const { x, y } = wpToFieldXY(wp, i);
            res[y][x] = wp.values[i] || '*';
        }
    });
    return res;
}

export function printValues(values: string[][]) {
    values.forEach((line) => {
        console.log(line.join(''));
    });
}

export function printStateValues(state: State) {
    printValues(wordPlaceValuesToArray(state));
}

//** Print wordPlaces list for debug purpose */
export function printWordPlaces(wordPlaces: WordPlace[]) {
    wordPlaces.forEach((wp) => {
        console.log(
            wp.id,
            wp.horizontal ? 'h' : 'v',
            [wp.x, wp.y].join(', '),
            wp.values.map((v) => v || '*').join(''),
        );
    });
}
