import { COLORINDEX_STRUCTURE_TYPE } from "./game";
import icon_noPower from "../../img/icons/no_power.png"
import * as THREE from "three"

export const GAME_TEXTURES = {
    "No Power": {
        url: icon_noPower,
    }
}

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
    },
    "AOE (Pollution)": {
        type: "MeshBasic",
        options: {
            color: 0x000000,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            depthTest: false,
        }
    },

    // icons
    "No Power (Icon)": {
        type: "Points",
        options: {
            size: 48,
            sizeAttenuation: false,
            map: "No Power",
            depthTest: false,
            depthWrite: false, 
            transparent: true, 
            fog: false, 
            toneMapped: false,
        }
    }
}