export const GAME_SETTINGS = {
    City: {
        geometryChunkSize : 16,
        active : false,
        mapSize : 64,
        ready : false,
        placingStructure : false,
        placingPath : false,
        structure : null,
        path : null,
        tileSet : "Default City",
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
    "create city pathing",
    "update tile cursor",
    /** city ui */
    "show city state",
    "hide city paths menu",
    "show city paths menu",
    "hide city structures menu",
    "show city structures menu",
]

export const GAME_STRUCTURE_RULES = {
    SINGLE : 0,
}

export const GAME_GEOMETRY_CHUNK_TYPES ={
    PATHING : 0,
    STRUCTURES : 1,
}

export const GAME_TILESETS ={
    "Default City": {
        model: "Default City Tile Set",
        scale: 0.5,
        Paths: {
            "City Road": {
                cars: true,
                Models: {
                    corner: "road_corner_curved",
                    junction: "road_junction",
                    straight: "road_straight",
                    tsplit: "road_tsplit",
                },
            }
        },
        Structures: {
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
    }
}