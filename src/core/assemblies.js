import { OCTAVIA } from "@little-island/octavia-engine";

export const ASSEMBLIES = {
    "City Camera": {
        gameScene: "City",
        components: {
            "Camera": {},
            "City View Controls": {}
        },
    },
    "City Generator": {
        gameScene: "City",
        components: {
            "City Controller" : {},
            "City Terrain Controller" : {},
            "City Tile Controller" : {},
            "City Pathing Controller" : {},
            "City Structure Controller" : {},
            "City Tile Object Controller" : {},
        },
    }
}