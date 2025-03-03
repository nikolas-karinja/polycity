import { EVENTS, OCTAVIA } from "@little-island/octavia-engine";
import * as THREE from 'three'
import { COLORINDEX_OBJECT_DIRECTIONS, COLORINDEX_PATH_MODEL_TYPES, GAME_OBJECT_DIRECTIONS, GAME_PATH_MODEL_TYPES, GAME_SETTINGS } from "../core/game";

class CityPathingController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.PathPlacementCanvas = null
        this.PathStylesCanvas = null
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
        this.PathPlacementCanvas = OCTAVIA.Managers.Canvases.Create("Path Placement",
            GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)
        this.PathPlacementCanvas.Clear("#f00")

        this.PathStylesCanvas = OCTAVIA.Managers.Canvases.Create("Path Styles",
            GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)
        this.PathStylesCanvas.Clear("#000")

        this.PathDirectionsCanvas = OCTAVIA.Managers.Canvases.Create("Path Directions",
            GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)
        this.PathDirectionsCanvas.Clear("#000")
    }

    GetTileStyleColor (tx, ty)
    {
        return this.PathStylesCanvas.GetPixelColorHex(tx, ty)
    }

    GetTileDirectionColor (tx, ty)
    {
        return this.PathDirectionsCanvas.GetPixelColorHex(tx, ty)
    }

    CheckTileStyle (tx, ty, colorIndex)
    {
        return this.PathStylesCanvas.CheckPixelColorHex(tx, ty, colorIndex)
    }

    CheckTileDirection (tx, ty, colorIndex)
    {
        return this.PathDirectionsCanvas.CheckPixelColorHex(tx, ty, colorIndex)
    }

    CheckTileOccupied (tx, ty)
    {
        return this.PathPlacementCanvas.CheckPixelColorHex(tx, ty, "#0f0")
    }

    SetTileOccupied (tx, ty, value = true)
    {
        if (value)
            this.PathPlacementCanvas.SetPixelColorHex(tx, ty, "#0f0")
        else
            this.PathPlacementCanvas.SetPixelColorHex(tx, ty, "#f00")
    }

    ClearTile (tx, ty)
    {
        this.SetTileOccupied(tx, ty, false)

        this.PathStylesCanvas.SetPixelColorHex(tx, ty, 
            COLORINDEX_PATH_MODEL_TYPES.NONE)
        this.PathDirectionsCanvas.SetPixelColorHex(tx, ty, 
            COLORINDEX_OBJECT_DIRECTIONS.NORTH)

        // update neighbors
        this.UpdateTileNeighbors(tx, ty)
    }

    UpdateTileAndNeighbors (tx, ty)
    {
        // center
        this.UpdateTile(tx, ty)

        // neighbors
        this.UpdateTileNeighbors(tx, ty)
    }

    UpdateTileNeighbors (tx, ty)
    {
        this.UpdateTile(tx, ty - 1)
        this.UpdateTile(tx + 1, ty)
        this.UpdateTile(tx, ty + 1)
        this.UpdateTile(tx - 1, ty)
    }

    UpdateTile (tx, ty)
    {
        let _occupiedCount = 0

        if (this.CheckTileOccupied(tx, ty))
        {
            const _N = this.CheckTileOccupied(tx, ty - 1)
        const _W = this.CheckTileOccupied(tx + 1, ty)
        const _S = this.CheckTileOccupied(tx, ty + 1)
        const _E = this.CheckTileOccupied(tx - 1, ty)

        let _pathModelType = "SINGLE"
        let _pathDirection = "NORTH"

        if (_N) _occupiedCount++
        if (_W) _occupiedCount++
        if (_S) _occupiedCount++
        if (_E) _occupiedCount++

        if (_occupiedCount === 4)
            _pathModelType = "JUNCTION"
        if (_occupiedCount === 3)
        {
            _pathModelType = "TSPLIT"

            if (_N && _W && _S && !_E)
                _pathDirection = "SOUTH"
            if (_W && _S && _E && !_N)
                _pathDirection = "WEST"
            if (_S && _E && _N && !_W)
                _pathDirection = "NORTH"
            if (_E && _N && _W && !_S)
                _pathDirection = "EAST"
        }
        if (_occupiedCount === 2)
        {
            if ((_N && _S && !_E && !_W) ||
                (!_N && !_S && _E && _W))
            {
                _pathModelType = "STRAIGHT"

                if (_N && _S && !_E && !_W)
                    _pathDirection = "NORTH"
                if (!_N && !_S && _E && _W)
                    _pathDirection = "WEST"
            }
            else
            {
                _pathModelType = "CORNER"

                if (_N && _W && !_S && !_E)
                    _pathDirection = "NORTH"
                if (!_N && _W && _S && !_E)
                    _pathDirection = "EAST"
                if (!_N && !_W && _S && _E)
                    _pathDirection = "SOUTH"
                if (_N && !_W && !_S && _E)
                    _pathDirection = "WEST"
            }
        }
        if (_occupiedCount === 1)
        {
            _pathModelType = "CAP"

            if (_N && !_W && !_S && !_E)
                _pathDirection = "NORTH"
            if (!_N && _W && !_S && !_E)
                _pathDirection = "WEST"
            if (!_N && !_W && _S && !_E)
                _pathDirection = "SOUTH"
            if (!_N && !_W && !_S && _E)
                _pathDirection = "EAST"
        }

        this.PathStylesCanvas.SetPixelColorHex(tx, ty, 
            COLORINDEX_PATH_MODEL_TYPES[_pathModelType])
        this.PathDirectionsCanvas.SetPixelColorHex(tx, ty, 
            COLORINDEX_OBJECT_DIRECTIONS[_pathDirection])
        }
        else
        {
            this.PathStylesCanvas.SetPixelColorHex(tx, ty, 
                COLORINDEX_PATH_MODEL_TYPES.NONE)
            this.PathDirectionsCanvas.SetPixelColorHex(tx, ty, 
                COLORINDEX_OBJECT_DIRECTIONS.NORTH)
        }
    }
}

export { CityPathingController }