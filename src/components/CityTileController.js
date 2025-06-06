import { EVENTS, MATERIALS, OCTAVIA } from "@little-island/octavia-engine";
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { COLORINDEX_OBJECT_DIRECTIONS, COLORINDEX_PATH_MODEL_TYPES, COLORINDEX_TILE_TYPE, GAME_GEOMETRY_CHUNK_TYPES, GAME_OBJECT_DIRECTIONS_MULT, GAME_PATH_MODEL_TYPES, GAME_SETTINGS, GAME_STRUCTURE_TYPES, GAME_TILESETS } from "../core/data/game";
import * as UTILS from '../core/utils'

class CityTileStructure 
{
    constructor (name, sx, sy, w, l, position)
    {
        this.name = name
        this.sx = sx
        this.sy = sy
        this.ex = sx + (w - 1)
        this.ey = sy + (l - 1)
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
        this.path = null
        this.Structure = null
    }

    SetPath (name)
    {
        this.path = name
    }

    SetStructure (name, sx, sy, w, l, position)
    {
        if (name)
        {
            this.Structure = new CityTileStructure(name, sx, sy, w, l, position)

            return
        }

        this.Structure = null
    }
}

class StructureGeometryChunk_Geometry
{
    constructor (idColor, tileSetName, position, direction)
    {
        this.idColor = idColor
        this.tileSetName = tileSetName
        this.Position = position
        this.direction = direction
    }
}

class StructureGeometryChunk
{
    constructor (chunkX, chunkY, tileStartX, tileStartY, tileController, structureController)
    {
        this.chunkX = chunkX
        this.chunkY = chunkY
        this.tileStartX = tileStartX
        this.tileStartY = tileStartY
        this.TileController = tileController
        this.StructureContoller = structureController
        this.Geometries = {}
        this.Position = new THREE.Vector3((GAME_SETTINGS.City.mapSize / -2) + (this.tileStartX + GAME_SETTINGS.City.geometryChunkSize / 2), 0,
            (GAME_SETTINGS.City.mapSize / -2) + (this.tileStartY + GAME_SETTINGS.City.geometryChunkSize / 2))

        this.Material = OCTAVIA.FindMaterial(GAME_TILESETS[GAME_SETTINGS.City.tileSet].model)
        
        this.Mesh = new OCTAVIA.Core.Mesh(new THREE.BoxGeometry(0, 0, 0), this.Material)
        this.Mesh.position.copy(this.Position)

        this.NoPowerIconsMesh = new THREE.Points(new THREE.BufferGeometry(), 
            OCTAVIA.FindMaterial("No Power (Icon)"))
        this.NoPowerIconsMesh.position.copy(this.Position)

        OCTAVIA.AddToThreeGroup("City Structures", this.Mesh)
        OCTAVIA.AddToThreeGroup("City Structures", this.NoPowerIconsMesh)

        this.Init()
    }

    Init ()
    {
        this.SetupEvents()
    }

    SetupEvents ()
    {
        OCTAVIA.AddEventListener("update power grids", () => this.UpdateIcons())
    }

    AddGeometry (idColor, tileSetName, position, direction)
    {
        this.Geometries[idColor] = new StructureGeometryChunk_Geometry(idColor, tileSetName, position, direction)

        this.Redraw()
    }

    RemoveGeometry (idColor, redraw = true)
    {
        console.log(this.Geometries)

        let _result = null

        for (const g in this.Geometries)
            if (g === idColor)
            {
                _result = g

                break
            }

        if (_result)
            delete this.Geometries[_result]

        if (redraw)
            this.Redraw()
    }

    Redraw ()
    {
        const _geometriesToMerge = []
        const _scale = UTILS.getCityTileSetData().scale

        for (const g in this.Geometries)
        {
            const _G = this.Geometries[g]

            const _StructureData = UTILS.getStructureData(_G.tileSetName)
            const _StructureGeo = OCTAVIA.FindModel(UTILS.getCityTileSetData().model).FindMesh(_StructureData.model).geometry.clone()
            _StructureGeo.rotateY(GAME_OBJECT_DIRECTIONS_MULT[_G.direction] * (Math.PI / -2))
            _StructureGeo.scale(_scale, _scale, _scale)
            _StructureGeo.translate(_G.Position.x, 0, _G.Position.z)

            _geometriesToMerge.push(_StructureGeo)
        }

        // this.Mesh.geometry.dispose()
        this.Mesh.geometry.dispose()
        this.Mesh.geometry = _geometriesToMerge.length > 0 ? 
            mergeGeometries(_geometriesToMerge) : new THREE.BoxGeometry(0, 0, 0)

        this.UpdateIcons()
    }

    UpdateIcons ()
    {
        const _noPowerPos = []
        const _Geo_noPower = new THREE.BufferGeometry()

        for (const g in this.Geometries)
        {
            const _G = this.Geometries[g]
            const _S = this.StructureContoller.FindStructure(_G.idColor)

            if (_S.type !== GAME_STRUCTURE_TYPES.POWER)
            {
                if (!_S.hasPower)
                    _noPowerPos.push(_G.Position.x, 1, _G.Position.z)
            }
        }

        _Geo_noPower.setAttribute("position", 
            new THREE.Float32BufferAttribute(_noPowerPos, 3))

        // update geometries
        this.NoPowerIconsMesh.geometry.dispose()
        this.NoPowerIconsMesh.geometry = _Geo_noPower
    }
}

class PathGeometryChunk
{
    constructor (chunkX, chunkY, tileStartX, tileStartY, tileController, pathingController)
    {
        this.chunkX = chunkX
        this.chunkY = chunkY
        this.tileStartX = tileStartX
        this.tileStartY = tileStartY
        this.TileController = tileController
        this.PathingController = pathingController
        this.Position = new THREE.Vector3((GAME_SETTINGS.City.mapSize / -2) + (this.tileStartX + GAME_SETTINGS.City.geometryChunkSize / 2), 0,
            (GAME_SETTINGS.City.mapSize / -2) + (this.tileStartY + GAME_SETTINGS.City.geometryChunkSize / 2))

        this.Material = OCTAVIA.FindMaterial(GAME_TILESETS[GAME_SETTINGS.City.tileSet].model)
        
        this.Mesh = new OCTAVIA.Core.Mesh(new THREE.BoxGeometry(0, 0, 0), this.Material)
        this.Mesh.position.copy(this.Position)

        OCTAVIA.AddToThreeGroup("City Pathing", this.Mesh)
    }

    AddPath (tx, ty, pathName)
    {

    }

    Redraw (once = false)
    {
        const _geometriesToMerge = []
        const _scale = UTILS.getCityTileSetData().scale

        for (let y = this.tileStartY; y < this.tileStartY + GAME_SETTINGS.City.geometryChunkSize; y++)
            for (let x = this.tileStartX; x < this.tileStartX + GAME_SETTINGS.City.geometryChunkSize; x++)
            {
                if (this.PathingController.CheckTileOccupied(x, y))
                {
                    let _modelType = GAME_PATH_MODEL_TYPES.STRAIGHT
                    let _direction = GAME_OBJECT_DIRECTIONS_MULT.NORTH

                    const _styleColor = this.PathingController.GetTileStyleColor(x, y)
                    const _directionColor = this.PathingController.GetTileDirectionColor(x, y)

                    switch (_styleColor)
                    {
                        case COLORINDEX_PATH_MODEL_TYPES.SINGLE:
                            _modelType = GAME_PATH_MODEL_TYPES.SINGLE
                            break
                        case COLORINDEX_PATH_MODEL_TYPES.CAP:
                            _modelType = GAME_PATH_MODEL_TYPES.CAP
                            break
                        case COLORINDEX_PATH_MODEL_TYPES.STRAIGHT:
                            _modelType = GAME_PATH_MODEL_TYPES.STRAIGHT
                            break
                        case COLORINDEX_PATH_MODEL_TYPES.CORNER:
                            _modelType = GAME_PATH_MODEL_TYPES.CORNER
                            break
                        case COLORINDEX_PATH_MODEL_TYPES.TSPLIT:
                            _modelType = GAME_PATH_MODEL_TYPES.TSPLIT
                            break
                        case COLORINDEX_PATH_MODEL_TYPES.JUNCTION:
                            _modelType = GAME_PATH_MODEL_TYPES.JUNCTION
                            break
                        default:
                            break
                    }

                    switch (_directionColor)
                    {
                        case COLORINDEX_OBJECT_DIRECTIONS.NORTH:
                            _direction = GAME_OBJECT_DIRECTIONS_MULT.NORTH
                            break
                        case COLORINDEX_OBJECT_DIRECTIONS.WEST:
                            _direction = GAME_OBJECT_DIRECTIONS_MULT.WEST
                            break
                        case COLORINDEX_OBJECT_DIRECTIONS.SOUTH:
                            _direction = GAME_OBJECT_DIRECTIONS_MULT.SOUTH
                            break
                        case COLORINDEX_OBJECT_DIRECTIONS.EAST:
                            _direction = GAME_OBJECT_DIRECTIONS_MULT.EAST
                            break
                        default:
                            break
                    }

                    const _trueX = ((GAME_SETTINGS.City.geometryChunkSize / -2) + (x - this.tileStartX)) + 0.5 
                    const _trueZ = ((GAME_SETTINGS.City.geometryChunkSize / -2) + (y - this.tileStartY)) + 0.5 

                    const _PathGeo = OCTAVIA.FindModel(UTILS.getCityTileSetData().model)
                        .FindMesh(UTILS.getPathData("City Road").Models[_modelType]).geometry.clone()
                    _PathGeo.rotateY(_direction * (Math.PI / -2))
                    _PathGeo.scale(_scale, _scale, _scale)
                    _PathGeo.translate(_trueX, 0, _trueZ)

                    _geometriesToMerge.push(_PathGeo)
                }
            }
            
        this.Mesh.geometry.dispose()
        this.Mesh.geometry = _geometriesToMerge.length > 0 ? 
            mergeGeometries(_geometriesToMerge) : new THREE.BoxGeometry(0, 0, 0)
            
        if (!once)
        {
            const _max = Math.floor(GAME_SETTINGS.City.mapSize / GAME_SETTINGS.City.geometryChunkSize)

            //` `    update the surrounding chunks and up[date them only once]
            if (this.chunkX > 0)
                this.TileController.pathGeometryChunks[this.chunkX - 1][this.chunkY].Redraw(true)
            if (this.chunkY > 0)
                this.TileController.pathGeometryChunks[this.chunkX][this.chunkY - 1].Redraw(true)
            if (this.chunkX < _max - 1)
                this.TileController.pathGeometryChunks[this.chunkX + 1][this.chunkY].Redraw(true)
            if (this.chunkY < _max - 1)
                this.TileController.pathGeometryChunks[this.chunkX][this.chunkY + 1].Redraw(true)
        }
    }
}

class CityTileController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.tiles = []
        this.pathGeometryChunks = []
        this.structureGeometryChunks = []
        this.tilesReady = false
        this.TilesOccupiedCanvas = null
        this.TileTypeCanvas = null
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

    FindPathGeometryChunk (cx, cy)
    {
        return this.pathGeometryChunks[cy][cx]
    }

    FindTilePathGeometryChunk (tx, ty)
    {
        const _tile = this.tiles[ty][tx]

        return this.pathGeometryChunks[_tile.geometryChunkY][_tile.geometryChunkX]
    }

    FindStructureGeometryChunk (cx, cy)
    {
        return this.structureGeometryChunks[cy][cx]
    }

    FindTileStructureGeometryChunk (tx, ty)
    {
        const _tile = this.tiles[ty][tx]

        return this.structureGeometryChunks[_tile.geometryChunkY][_tile.geometryChunkX]
    }

    CheckTileForTypes (tx, ty, list = [])
    {
        let _result = false

        if (this.tilesReady)
        {
            for (let c of list)
                if (this.TileTypeCanvas.CheckPixelColorHex(tx, ty, c))
                {
                    _result = true

                    break
                }
        }

        return _result
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

    SetTileOccupiedRect (tx, ty, path = null)
    {
        if (this.tilesReady)
        {
            this.TilesOccupiedCanvas.SetPixelColorHex(tx, ty, "#0f0")

            if (path)
            {
                this.tiles[ty][tx].SetPath(path)

                this.TileTypeCanvas.SetPixelColorHex(tx, ty, COLORINDEX_TILE_TYPE.PATH)
            }
        }
    }

    SetTilesOccupiedRect (sx, sy, w, l, )
    {
        if (this.tilesReady)
        {
            this.TilesOccupiedCanvas.FillRectHex(sx, sy, w, l, "#0f0")
            this.TileTypeCanvas.FillRectHex(sx, sy, w, l, COLORINDEX_TILE_TYPE.STRUCTURE)
        }
    }

    InitTiles ()
    {
        // create canvases
        this.TilesOccupiedCanvas = OCTAVIA.Managers.Canvases.Create("Tiles Occupied",
            GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)
        this.TilesOccupiedCanvas.Clear("#f00")

        this.TileTypeCanvas = OCTAVIA.Managers.Canvases.Create("Tile Type",
            GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)
        this.TileTypeCanvas.Clear(COLORINDEX_TILE_TYPE.NONE)

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

            this.structureGeometryChunks.push([])
            this.pathGeometryChunks.push([])

            for (let x = 0; x < GAME_SETTINGS.City.mapSize; x += GAME_SETTINGS.City.geometryChunkSize)
            {
                this.structureGeometryChunks[_my][_mx] = new StructureGeometryChunk(_mx, _my, x, y, this, this.GetComponent("City Structure Controller"))
                this.pathGeometryChunks[_my][_mx] = new PathGeometryChunk(_mx, _my, x, y, this, this.GetComponent("City Pathing Controller"))

                _mx++
            }

            _my++
        }
    }
}

export { CityTileController }