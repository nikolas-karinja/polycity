export const GAME_SETTINGS = {
    City: {
        active : false,
        mapSize : 64,
        ready : false,
        placingStructure : false,
        structure: null,
    }
}

export const GAME_STRUCTURE_DIRECTIONS = {
    NORTH : 0,
    WEST  : 1,
    SOUTH : 2,
    EAST  : 3,
}

export const GAME_EVENTS = [
    "create city",
    "create city terrain",
    "create city tiles",
    /** city ui */
    "show city state",
    "hide city structures menu",
    "show city structures menu",
]

export const GAME_STRUCTURE_RULES = {
    SINGLE : 0,
}

export const GAME_TILESETS ={
    "Default City": {
        model: "Default City Tile Set",
        scale: 0.5,
    }
}

export const GAME_STRUCTURES = {
    "Test (1x1)": {
        width: 1,
        length: 1,
        rule: GAME_STRUCTURE_RULES.SINGLE,
    },
    "General Store": {
        width: 1,
        length: 1,
        rule: GAME_STRUCTURE_RULES.SINGLE,
        tileSet: "Default City",
        model: "building_A",
    },
    "Townhouse": {
        width: 1,
        length: 1,
        rule: GAME_STRUCTURE_RULES.SINGLE,
        tileSet: "Default City",
        model: "building_B",
    },
    "Tiny Apartment Complex": {
        width: 1,
        length: 1,
        rule: GAME_STRUCTURE_RULES.SINGLE,
        tileSet: "Default City",
        model: "building_C",
    },
    "Small Apartment Complex": {
        width: 1,
        length: 1,
        rule: GAME_STRUCTURE_RULES.SINGLE,
        tileSet: "Default City",
        model: "building_D",
    },
    "Small Bussiness Storefront": {
        width: 1,
        length: 1,
        rule: GAME_STRUCTURE_RULES.SINGLE,
        tileSet: "Default City",
        model: "building_E",
    },
    "Modest Apartment Complex": {
        width: 1,
        length: 1,
        rule: GAME_STRUCTURE_RULES.SINGLE,
        tileSet: "Default City",
        model: "building_F",
    },
    "Small Commune": {
        width: 1,
        length: 1,
        rule: GAME_STRUCTURE_RULES.SINGLE,
        tileSet: "Default City",
        model: "building_G",
    },
    "Urban Residence": {
        width: 1,
        length: 1,
        rule: GAME_STRUCTURE_RULES.SINGLE,
        tileSet: "Default City",
        model: "building_H",
    },
}