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

export const GAME_OBJECT_DIRECTIONS = {
    NORTH : "NORTH",
    WEST  : "WEST",
    SOUTH : "SOUTH",
    EAST  : "EAST",
}

export const GAME_OBJECT_DIRECTIONS_MULT = {
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

export const GAME_STRUCTURE_TYPES = {
    RESIDENTIAL   : "RESIDENTIAL",
    COMMERCIAL    : "COMMERCIAL",
    INDUSTRIAL    : "INDUSTRIAL",
    POWER         : "POWER",
    WATER         : "WATER",
    WASTE         : "WASTE",
    ENTERTAINMENT : "ENTERTAINMENT",
    PARK          : "PARK",
}

export const GAME_GEOMETRY_CHUNK_TYPES = {
    PATHING : 0,
    STRUCTURES : 1,
}

export const GAME_PATH_MODEL_TYPES = {
    CAP      : "cap",
    CORNER   : "corner",
    JUNCTION : "junction",
    SINGLE   : "single",
    STRAIGHT : "straight",
    TSPLIT   : "tsplit",
}

export const COLORINDEX_PATH_MODEL_TYPES = {
    NONE     : "#000000",
    SINGLE   : "#111111",
    CAP      : "#222222",
    STRAIGHT : "#333333",
    CORNER   : "#444444",
    TSPLIT   : "#555555",
    JUNCTION : "#666666",
}

export const COLORINDEX_OBJECT_DIRECTIONS = {
    NORTH : "#000000",
    WEST  : "#ff0000",
    SOUTH : "#222222",
    EAST  : "#00ff00",
}

export const COLORINDEX_TILE_TYPE = {
    NONE : "#000000",
    PATH  : "#111111",
    STRUCTURE : "#222222",
}

export const COLORINDEX_STRUCTURE_TYPE = {
    RESIDENTIAL   : "#00ff00",
    COMMERCIAL    : "#0000ff",
    INDUSTRIAL    : "#ffff00",
    POWER         : "#ff00ff",
    WATER         : "#00ffff",
    WASTE         : "#ff0000",
    ENTERTAINMENT : "#ffaa00",
    PARK          : "#557711",
}

export const GAME_TILESETS ={
    "Default City": {
        model: "Default City Tile Set",
        scale: 0.5,
        Paths: {
            "City Road": {
                cars: true,
                Models: {
                    cap: "road_cap",
                    corner: "road_corner",
                    junction: "road_junction",
                    single: "road_single",
                    straight: "road_straight",
                    tsplit: "road_tsplit",
                },
            }
        },
        Structures: {
            "Coal Power Plant": {
                width: 3,
                length: 3,
                rule: GAME_STRUCTURE_RULES.SINGLE,
                entrance: 1, // along x
                model: "coal_power_plant",
                type: GAME_STRUCTURE_TYPES.POWER,
                requiresPower: false,
            },
            "Small Residence": {
                width: 1,
                length: 1,
                rule: GAME_STRUCTURE_RULES.SINGLE,
                entrance: 0, // along x
                model: "small_residence",
                type: GAME_STRUCTURE_TYPES.RESIDENTIAL,
                requiresPower: true,
                popCapacity: 2,
            },
            "Large Complex": {
                width: 3,
                length: 2,
                rule: GAME_STRUCTURE_RULES.SINGLE,
                entrance: 2,
                model: "large_complex",
                type: GAME_STRUCTURE_TYPES.RESIDENTIAL,
                requiresPower: true,
                popCapacity: 6,
            },
        }
    }
}