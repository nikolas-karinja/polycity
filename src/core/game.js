export const GAME_SETTINGS = {
    City: {
        active : false,
        mapSize : 64,
        placingStructure : false,
        structure: null,
    }
}

export const GAME_EVENTS = [
    "create city",
    "create city terrain",
    /** city ui */
    "show city state",
    "hide city structures menu",
    "show city structures menu",
]

export const GAME_STRUCTURE_RULES = {
    SINGLE : 0,
}

export const GAME_STRUCTURES = {
    "Test (1x1)": {
        width: 1,
        length: 1,
        rule: GAME_STRUCTURE_RULES.SINGLE,
    },
    "Test (3x3)": {
        width: 3,
        length: 3,
        rule: GAME_STRUCTURE_RULES.SINGLE,
    },
}