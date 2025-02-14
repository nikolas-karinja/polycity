import { EVENTS, OCTAVIA } from "@little-island/octavia-engine";
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { GAME_GEOMETRY_CHUNK_TYPES, GAME_SETTINGS, GAME_TILESETS } from "../core/game";
import * as UTILS from '../core/utils'

class CityTileStructure 
{
    constructor (name, sx, sy, position)
    {
        this.name = name
        this.sx = sx
        this.sy = sy
        this.ex = sx + UTILS.getStructureData(name).width
        this.ey = sy + UTILS.getStructureData(name).length
        this.Position = position
    }
}

class CityTile
{
    constructor (mapX, mapY, geometryChunkX, geometryChunkY)
    {
        this.mapX = mapX
        this.mapY = mapY
        this.geometryChunkX = geometryChunkX
        this.geometryChunkY = geometryChunkY
        this.Structure = null
    }

    SetStructure (name, sx, sy, position)
    {
        if (name)
        {
            this.Structure = new CityTileStructure(name, sx, sy, position)

            return
        }

        this.Structure = null
    }
}

class GeometryChunk_Geometry
{
    constructor (tileX, tileY, structureName, position)
    {
        this.tileX = tileX
        this.tileY = tileY
        this.structureName = structureName
        this.Position = position
    }
}

class GeometryChunk 
{
    constructor (tileStartX, tileStartY, tileController)
    {
        this.tileStartX = tileStartX
        this.tileStartY = tileStartY
        this.TileController = tileController
        this.geometries = []
        this.Position = new THREE.Vector3((GAME_SETTINGS.City.mapSize / -2) + (this.tileStartX + GAME_SETTINGS.City.geometryChunkSize / 2), 0,
            (GAME_SETTINGS.City.mapSize / -2) + (this.tileStartY + GAME_SETTINGS.City.geometryChunkSize / 2))

        this.Material = OCTAVIA.FindMaterial(GAME_TILESETS[GAME_SETTINGS.City.tileSet].model)
        
        this.Mesh = new OCTAVIA.Core.Mesh(new THREE.BoxGeometry(0, 0, 0), this.Material)
        this.Mesh.position.copy(this.Position)

        OCTAVIA.AddToThreeGroup("City Structures", this.Mesh)
    }

    AddGeometry (tx, ty, structureName, position)
    {
        this.geometries.push(new GeometryChunk_Geometry(tx, ty, structureName, position))

        this.Redraw()
    }

    RemoveGeometry (tx, ty)
    {
        let _result = null

        for (let g of this.geometries)
            if (g.tileX === tx && g.tileY === ty)
            {
                _result = g

                break
            }

        if (_result)
            OCTAVIA.ArrayUtils.removeItemByValue(this.geometries, _result)

        this.Redraw()
    }

    Redraw ()
    {
        const _geometriesToMerge = []
        const _scale = UTILS.getCityTileSetData().scale

        for (let g of this.geometries)
        {
            const _StructureData = UTILS.getStructureData(g.structureName)
            const _StructureGeo = OCTAVIA.FindModel(UTILS.getCityTileSetData().model).FindMesh(_StructureData.model).geometry.clone()
            _StructureGeo.scale(_scale, _scale, _scale)
            _StructureGeo.translate(g.Position.x, 0, g.Position.z)

            _geometriesToMerge.push(_StructureGeo)
        }

        this.Mesh.geometry = mergeGeometries(_geometriesToMerge)
    }
}

class CityTileController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.tiles = []
        this.geometryChunks = []
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
            this.InitChunkGeometries()

            OCTAVIA.DispatchEvent("create city pathing")
        })
    }

    FindTileGeometryChunk (tx, ty)
    {
        const _tile = this.tiles[ty][tx]

        return this.geometryChunks[_tile.geometryChunkY][_tile.geometryChunkX]
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

    SetTilesOccupiedRect (sx, sy, w, l, structure = null, tilePosition)
    {
        if (this.tilesReady)
        {
            this.TilesOccupiedCanvas.FillRectHex(sx, sy, w, l, "#0f0")

            if (structure)
            {

            if (!OCTAVIA.MathUtils.isOdd(w))
                tilePosition.x += 0.5
            if (!OCTAVIA.MathUtils.isOdd(l))
                tilePosition.z += 0.5

                for (let y = sy; y < l; y++)
                    for (let x = sx; x < w; x++)
                    {
                        this.tiles[y][x].SetStructure(structure, sx, sy, tilePosition)
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
                this.tiles[y][x] = new CityTile(x, y, Math.floor(x / GAME_SETTINGS.City.geometryChunkSize), Math.floor(y / GAME_SETTINGS.City.geometryChunkSize))
            }
        }

        this.tilesReady = true
    }

    InitChunkGeometries ()
    {
        let _my = 0

        for (let y = 0; y < GAME_SETTINGS.City.mapSize; y += GAME_SETTINGS.City.geometryChunkSize)
        {
            let _mx = 0

            this.geometryChunks.push([])

            for (let x = 0; x < GAME_SETTINGS.City.mapSize; x += GAME_SETTINGS.City.geometryChunkSize)
            {
                this.geometryChunks[_my][_mx] = new GeometryChunk(x, y, this)

                _mx++
            }

            _my++
        }
    }
}

export { CityTileController }