import { EVENTS, OCTAVIA } from "@little-island/octavia-engine";
import * as THREE from 'three'
import { GAME_SETTINGS } from "../core/game";

class CityTile
{
    constructor (mapX, mapY, structureChunkX, structureChunkY)
    {
        this.mapX = mapX
        this.mapY = mapY
        this.structureChunkX = structureChunkX
        this.structureChunkY = structureChunkY
        this.structure = null
    }

    SetStructure (name)
    {
        this.structure = name
    }
}

class CityTileController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.tiles = []
        this.tilesReady = false
        this.TilesOccupiedCanvas = null
    }

    Start ()
    {
        this.SetupEvents()
    }

    SetupEvents ()
    {
        EVENTS.AddListener('create city tiles', () =>
        {
            this.InitTiles()

            GAME_SETTINGS.City.ready = true
        })
    }

    CheckTilesOccupiedRect (sx, sy, w, l)
    {
        let _result = false

        if (this.tilesReady)
        {
            const _Data = this.TilesOccupiedCanvas.GetImageData(sx, sy, w, l)

            // search for any green pixels
            for (let i = 0; i < _Data.data.length; i += 4) 
                if (_Data.data[i] === 0 && 
                    _Data.data[i + 1] === 255 && 
                    _Data.data[i + 2] === 0) 
                {
                    _result = true; // tile is occupied
                    break
                }
        }

        return _result
    }

    SetTilesOccupiedRect (sx, sy, w, l, structure = null)
    {
        if (this.tilesReady)
        {
            this.TilesOccupiedCanvas.FillRectHex(sx, sy, w, l, "#0f0")

            if (structure)
            {
                for (let y = sy; y < l; y++)
                    for (let x = sx; x < w; x++)
                    {
                        this.tiles[y][x].SetStructure(structure)
                    }
            }
        }
    }

    InitTiles ()
    {
        // create canvas
        this.TilesOccupiedCanvas = OCTAVIA.Managers.Canvases.Create("Tiles Occupied",
            GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)
        this.TilesOccupiedCanvas.Clear("#f00")

        // create tile data
        for (let y = 0; y < GAME_SETTINGS.City.mapSize; y++)
        {
            this.tiles.push([])

            for (let x = 0; x < GAME_SETTINGS.City.mapSize; x++)
            {
                this.tiles[y][x] = new CityTile(x, y, 0, 0)
            }
        }

        this.tilesReady = true
    }
}

export { CityTileController }