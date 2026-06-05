export type WordPlace = {
    id: number;
    horizontal: boolean;
    x: number;
    y: number;
    length: number;
    intersections: WordPlace[];
    /** Actual or potential values */
    values: string[];
};

export type Cell = {
    used: boolean;
    wordPlaces: WordPlace[];
};

export type Field = Cell[][];

export type State = {
    field: Field;
    wordPlaces: WordPlace[];
};

export type MatchIndex = {
    name: string;
    wordToKey: (word: string) => string;
    wordShouldBeIndexed: (word: string) => boolean;
    wordPlaceToKey: (wp: WordPlace) => string;
    index?: Map<string, number[]>;
};

export type SolveStep = {
    wordPlace: WordPlace;
    matchIndex: MatchIndex;
};