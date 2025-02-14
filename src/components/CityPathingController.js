import { EVENTS, OCTAVIA } from "@little-island/octavia-engine";
import * as THREE from 'three'
import { GAME_SETTINGS } from "../core/game";

class CityPathingController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.PathTypesCanvas = null
        this.PathDirectionsCanvas = null
        this.TerrainMesh = null
    }

    Start ()
    {
        this.SetupEvents()
    }

    SetupEvents ()
    {
        OCTAVIA.AddEventListener("create city pathing", () =>
        {
            this.InitCanvases()

            GAME_SETTINGS.City.ready = true
        })
    }

    InitCanvases ()
    {
        this.PathTypesCanvas = OCTAVIA.Managers.Canvases.Create("Path Types",
            GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)
        this.PathTypesCanvas.Clear("#f00")

        this.PathDirectionsCanvas = OCTAVIA.Managers.Canvases.Create("Path Directions",
            GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)
        this.PathDirectionsCanvas.Clear("#f00")
    }

    Update ()
    {
        
    }
}

export { CityPathingController }