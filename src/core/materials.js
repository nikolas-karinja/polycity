export const GAME_MATERIALS = {
    "Basic Terrain": {
        type: "MeshPhong",
        options: {
            color: 0xa1df50,
        }
    },
    "Object Cursor (Good)": {
        type: "MeshBasic",
        options: {
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            depthTest: false,
        }
    },
    "Object Cursor (Bad)": {
        type: "MeshBasic",
        options: {
            color: 0xff0000,
            transparent: true,
            opacity: 0.5,
            depthTest: false,
        }
    }
}