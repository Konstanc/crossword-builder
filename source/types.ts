/** Represents free space for one word  */
export type WordPlace = {
    id: number;
    horizontal: boolean;
    x: number;
    y: number;
    //** Start in linear field coords */
    start: number;
    length: number;
    intersections: WordPlace[]; // Used only for first step sorting
};

//** Linearized representation of a crossword field reading from left to right from top to bottom */
export type Field = {
    width: number;
    length: number;
    values: string[];
};

export type Cell = {
    used: boolean;
    wordPlaces: WordPlace[];
};

//** 2d Field model. Used only on the parsing stage */
export type Field2D = Cell[][];

export type Conditions = {
    field: Field;
    wordPlaces: WordPlace[];
};

/** Indexed words list */
export type MatchIndex = {
    name: string;
    wordToKey: (word: string) => string;
    wordShouldBeIndexed: (word: string) => boolean;
    wordPlaceToKey: (field: Field, wp: WordPlace) => string;
    index?: Map<string, number[]>;
};

/** One step (one word) in search path */
export type SolveStep = {
    wordPlace: WordPlace;
    matchIndex: MatchIndex;
};
