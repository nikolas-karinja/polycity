import { CANVASES, GAME_SCENES, INPUT, OCTAVIA } from "@little-island/octavia-engine";
import { COLORINDEX_OBJECT_DIRECTIONS, COLORINDEX_PATH_MODEL_TYPES, COLORINDEX_STRUCTURE_TYPE, COLORINDEX_TILE_TYPE, GAME_OBJECT_DIRECTIONS, GAME_OBJECT_DIRECTIONS_MULT, GAME_SETTINGS, GAME_STRUCTURE_RULES, GAME_STRUCTURE_TYPES } from "../core/game";
import * as THREE from 'three'
import * as UTILS from '../core/utils'
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

class StructurePlacementData
{
    constructor (tx, ty, name, cityTileController)
    {
        this.tx = tx
        this.ty = ty
        this.sx = 0
        this.sy = 0
        this.width = 0
        this.length = 0
        this.ptx = 0
        this.pty = 0
        this.name = name
        this.direction = GAME_OBJECT_DIRECTIONS.NORTH
        this.Data = UTILS.getStructureData(name)
        this.CityTileController = cityTileController
        this.tilesClear = false
    }

    GetNearestPathDirections ()
    {
        const _directions = []

        // north
        if (CANVASES.Find("Tile Type").CheckPixelColorHex(this.tx, this.ty - 1, COLORINDEX_TILE_TYPE.PATH))
            _directions.push(GAME_OBJECT_DIRECTIONS.NORTH)
        // west
        if (CANVASES.Find("Tile Type").CheckPixelColorHex(this.tx + 1, this.ty, COLORINDEX_TILE_TYPE.PATH))
            _directions.push(GAME_OBJECT_DIRECTIONS.WEST)
        // south
        if (CANVASES.Find("Tile Type").CheckPixelColorHex(this.tx, this.ty + 1, COLORINDEX_TILE_TYPE.PATH))
            _directions.push(GAME_OBJECT_DIRECTIONS.SOUTH)
        // east
        if (CANVASES.Find("Tile Type").CheckPixelColorHex(this.tx - 1, this.ty, COLORINDEX_TILE_TYPE.PATH))
            _directions.push(GAME_OBJECT_DIRECTIONS.EAST)

        return _directions
    }

    Calculate ()
    {
        const _directions = this.GetNearestPathDirections()

        if (_directions.length === 0)
        {
            this.width = this.Data.width
            this.length = this.Data.length

            this.sx = this.tx - this.Data.entrance
            this.sy = this.ty
            this.direction = GAME_OBJECT_DIRECTIONS.NORTH
            this.ptx = this.tx
            this.pty = this.ty - 1

            return false
        }

        if (_directions.includes(GAME_OBJECT_DIRECTIONS.NORTH))
        {
            this.width = this.Data.width
            this.length = this.Data.length

            this.sx = this.tx - this.Data.entrance
            this.sy = this.ty
            this.direction = GAME_OBJECT_DIRECTIONS.NORTH
            this.ptx = this.tx
            this.pty = this.ty - 1

            if (!this.CityTileController.CheckTilesOccupiedRect(this.sx, this.sy, this.width, this.length))
                return true
        }
        if (_directions.includes(GAME_OBJECT_DIRECTIONS.WEST))
        {
            this.width = this.Data.length
            this.length = this.Data.width

            this.sx = (this.tx - (this.width - 1))
            this.sy = this.ty - this.Data.entrance
            this.direction = GAME_OBJECT_DIRECTIONS.WEST
            this.ptx = this.tx + 1
            this.pty = this.ty

            if (!this.CityTileController.CheckTilesOccupiedRect(this.sx, this.sy, this.width, this.length))
                return true
        }
        if (_directions.includes(GAME_OBJECT_DIRECTIONS.SOUTH))
        {
            this.width = this.Data.width
            this.length = this.Data.length

            this.sx = (this.tx - (this.width - 1)) + this.Data.entrance
            this.sy = this.ty - (this.length - 1)
            this.direction = GAME_OBJECT_DIRECTIONS.SOUTH
            this.ptx = this.tx
            this.pty = this.ty + 1

            if (!this.CityTileController.CheckTilesOccupiedRect(this.sx, this.sy, this.width, this.length))
                return true
        }
        if (_directions.includes(GAME_OBJECT_DIRECTIONS.EAST))
        {
            this.width = this.Data.length
            this.length = this.Data.width

            this.sx = this.tx
            this.sy = (this.ty - (this.length - 1)) + this.Data.entrance
            this.direction = GAME_OBJECT_DIRECTIONS.EAST
            this.ptx = this.tx - 1
            this.pty = this.ty

            if (!this.CityTileController.CheckTilesOccupiedRect(this.sx, this.sy, this.width, this.length))
                return true
        }

        return false
    }
}

class CityTileObjectController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.TilePosition = new THREE.Vector3()
        this.CurrentTile = new THREE.Vector2()
        this.TerrainMesh = null
        this.cursorReady = false
        this.mouseDown = false
        this.TileA = null
        this.TileB = null
        this.drawAlongX = false
        this.firstDraw = true
        this.tilesToDraw = []
        this.pathRouteClear = true
        this.RectStartTile = null
        this.RectEndTile = null

        this.TCMaterialGood = OCTAVIA.FindMaterial("Object Cursor (Good)")
        this.TCMaterialBad = OCTAVIA.FindMaterial("Object Cursor (Bad)")

        this.TileCursorMesh = new OCTAVIA.Core.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25),
            this.TCMaterialGood)
        this.TileArrowMesh = OCTAVIA.FindModel("Tile Arrow").FindMesh("Arrow")
        this.PathLayoutMesh = new OCTAVIA.Core.Mesh(new THREE.BoxGeometry(0, 0, 0),
            this.TCMaterialGood)
        // area-of-effect
        this.AOEMesh = new OCTAVIA.Core.Mesh(new THREE.PlaneGeometry(),
            this.TCMaterialGood)
        this.RectAreaMesh = new OCTAVIA.Core.Mesh(new THREE.PlaneGeometry(),
            this.TCMaterialBad)
    }

    Start ()
    {
        this.SetupEvents()
        this.SetupTileCursor()
        this.SetupTileArrow()
        this.SetupPathLayout()
        this.SetupAOEMesh()
        this.SetupRectAreaMesh()
    }

    SetTileCursorPosition (x, z)
    {
        this.TilePosition.set(x, 0, z)
        this.TileCursorMesh.position.set(x, 0, z)
    }

    SetupTileCursor ()
    {
        this.TileCursorMesh.visible = false
        this.TileCursorMesh.renderOrder = 2  
        this.TileCursorMesh.raycastEnabled = false

        this.AddGLObjectToScene(this.TileCursorMesh)
    }

    SetupTileArrow ()
    {
        this.TileArrowMesh.visible = false
        this.TileArrowMesh.scale.setScalar(0.5)
        this.TileArrowMesh.renderOrder = 999
        this.TileArrowMesh.raycastEnabled = false
        this.TileArrowMesh.material.transparent = true
        this.TileArrowMesh.material.depthWrite = false
        this.TileArrowMesh.material.depthTest = false

        this.AddGLObjectToScene(this.TileArrowMesh)
    }

    SetupPathLayout ()
    {
        this.PathLayoutMesh.visible = false
        this.PathLayoutMesh.raycastEnabled = false

        this.AddGLObjectToScene(this.PathLayoutMesh)
    }

    SetupAOEMesh ()
    {
        this.AOEMesh.visible = false
        this.AOEMesh.raycastEnabled = false
        this.AOEMesh.rotation.x = Math.PI / -2

        this.AddGLObjectToScene(this.AOEMesh)
    }

    SetupRectAreaMesh ()
    {
        this.RectAreaMesh.visible = false
        this.RectAreaMesh.rotation.x = Math.PI / -2
        this.RectAreaMesh.raycastEnabled = false

        this.AddGLObjectToScene(this.RectAreaMesh)
    }

    SetupEvents ()
    {
        OCTAVIA.AddEventListener("update tile cursor", () =>
        {
            if (GAME_SETTINGS.City.active && 
                GAME_SETTINGS.City.ready && 
                this.TerrainMesh)
            {
                if (GAME_SETTINGS.City.placingStructure && 
                    GAME_SETTINGS.City.structure)
                {
                    const _Structure = UTILS.getStructureData(GAME_SETTINGS.City.structure)

                    const _tileCursorGeo = OCTAVIA.FindModel(UTILS.getCityTileSetData().model)
                        .FindMesh(_Structure.model).geometry.clone()

                    this.TileCursorMesh.geometry.dispose()
                    this.TileCursorMesh.geometry = _tileCursorGeo
                    this.TileCursorMesh.scale.setScalar(UTILS.getCityTileSetData().scale)
                }

                if (GAME_SETTINGS.City.placingPath &&
                    GAME_SETTINGS.City.path)
                {
                    const _tileCursorGeo = OCTAVIA.FindModel(UTILS.getCityTileSetData().model)
                        .FindMesh(UTILS.getPathData(GAME_SETTINGS.City.path)
                        .Models["single"]).geometry.clone()

                    this.TileCursorMesh.geometry.dispose()
                    this.TileCursorMesh.geometry = _tileCursorGeo
                    this.TileCursorMesh.scale.setScalar(UTILS.getCityTileSetData().scale)
                }

                if (GAME_SETTINGS.City.bulldozing)
                {
                    this.TileCursorMesh.geometry.dispose()
                    this.TileCursorMesh.geometry = new THREE.PlaneGeometry()
                    this.TileCursorMesh.material = this.TCMaterialBad
                    this.TileCursorMesh.rotation.y = 0
                    this.TileCursorMesh.rotation.x = Math.PI / -2
                    this.TileCursorMesh.scale.setScalar(1)
                }
            }
        })
    }

    GeneratePathMesh ()
    {
        const _geoChunks = []

        for (let t of this.tilesToDraw)
        {
            this.GetComponent("City Pathing Controller")
                .SetTileOccupied(t[0], t[1], true)

            this.GetComponent("City Pathing Controller")
                .UpdateTileAndNeighbors(t[0], t[1])

            const _GeoChunk = this.GetComponent("City Tile Controller")
                .FindTilePathGeometryChunk(t[0], t[1])

            if (!_geoChunks.includes(_GeoChunk))
                _geoChunks.push(_GeoChunk)
        }

        OCTAVIA.DispatchEvent("update power grids")

        for (let g of _geoChunks)
            g.Redraw()
    }

    BulldozeRectArea ()
    {
        const _geoChunksToUpdate = []

        const _gcsx = Math.floor(this.RectStartTile.x / GAME_SETTINGS.City.geometryChunkSize)
        const _gcsy = Math.floor(this.RectStartTile.y / GAME_SETTINGS.City.geometryChunkSize)
        const _gcex = Math.floor(this.RectEndTile.x / GAME_SETTINGS.City.geometryChunkSize)
        const _gcey = Math.floor(this.RectEndTile.y / GAME_SETTINGS.City.geometryChunkSize)
    
        _geoChunksToUpdate.push([_gcsx, _gcsy])

        for (let y = _gcsy; y <= _gcey; y++)
            for (let x = _gcsx; x <= _gcex; x++)
                if (!_geoChunksToUpdate.includes([x, y]))
                    _geoChunksToUpdate.push([x, y])

        const _structureIdColors = []

        for (let y = this.RectStartTile.y; y <= this.RectEndTile.y; y++)
            for (let x = this.RectStartTile.x; x <= this.RectEndTile.x; x++)
            {
                const _pixelColor = OCTAVIA.FindCanvas("Structure ID").GetPixelColorHex(x, y)

                if (_pixelColor !== "#000000" && 
                    !_structureIdColors.includes(_pixelColor))
                    _structureIdColors.push(_pixelColor)

                this.GetComponent("City Pathing Controller")
                    .ClearTile(x, y)
            }

        for (let s of _structureIdColors)
        {
            this.GetComponent("City Structure Controller")
                .RemoveStructure(s)
        }

        for (let g of _geoChunksToUpdate)
        {
            this.GetComponent("City Tile Controller")
                .FindPathGeometryChunk(g[0], g[1])
                .Redraw()

            this.GetComponent("City Tile Controller")
                .FindStructureGeometryChunk(g[0], g[1])
                .Redraw()
        }

        OCTAVIA.DispatchEvent("update power grids")
    }

    GetTilesPathLayoutX (tilesToDraw)
    {
        const _ttd = tilesToDraw
        let _sx = this.TileA.x
        let _ex = this.TileB.x

        if (this.TileB.x > this.TileA.x)
        {
            _sx = this.TileA.x
            _ex = this.TileB.x
        }
        else if (this.TileB.x < this.TileA.x)
        {
            _sx = this.TileB.x
            _ex = this.TileA.x
        }

        for (let x = _sx; x <= _ex; x++)
            if (!_ttd.includes([x, this.TileA.y]))
                _ttd.push([x, this.TileA.y])

        return _ttd
    }

    GetTilesPathLayoutY (tilesToDraw)
    {
        const _ttd = tilesToDraw
        let _sy = this.TileA.y
        let _ey = this.TileB.y

        if (this.TileB.y > this.TileA.y)
        {
            _sy = this.TileA.y
            _ey = this.TileB.y
        }
        else if (this.TileB.y < this.TileA.y)
        {
            _sy = this.TileB.y
            _ey = this.TileA.y
        }

        for (let y = _sy; y <= _ey; y++)
            if (!_ttd.includes([this.TileB.x, y]))
                _ttd.push([this.TileB.x, y])

        return _ttd
    }

    DrawPathLayout ()
    {
        let _tilesToDraw = []
        const _geometries = []

        if (this.TileA && this.TileB)
        {
            if (this.drawAlongX)
            {
                _tilesToDraw = this.GetTilesPathLayoutX(_tilesToDraw)
                _tilesToDraw = this.GetTilesPathLayoutY(_tilesToDraw)
            }
            else
            {
                _tilesToDraw = this.GetTilesPathLayoutY(_tilesToDraw)
                _tilesToDraw = this.GetTilesPathLayoutX(_tilesToDraw)
            }

            if (_tilesToDraw.length > 0)
            {
                for (let t of _tilesToDraw)
                {
                    const _G = new THREE.PlaneGeometry()
                    _G.rotateX(Math.PI / -2)
                    _G.translate((GAME_SETTINGS.City.mapSize / -2) + (t[0] + 0.5), 0,
                        (GAME_SETTINGS.City.mapSize / -2) + (t[1] + 0.5))

                    _geometries.push(_G)

                    if (this.GetComponent("City Tile Controller").CheckTileForTypes(t[0], t[1], [COLORINDEX_TILE_TYPE.STRUCTURE]))
                        this.pathRouteClear = false
                }

                this.tilesToDraw = _tilesToDraw

                this.PathLayoutMesh.geometry.dispose()
                this.PathLayoutMesh.geometry = mergeGeometries(_geometries)

                if (this.pathRouteClear)
                    this.PathLayoutMesh.material = this.TCMaterialGood
                else
                    this.PathLayoutMesh.material = this.TCMaterialBad
            }
        }
    }

    DrawRectArea ()
    {
        if (this.TileA && this.TileB)
        {
            const _sx = Math.min(this.TileA.x, this.TileB.x)
            const _sy = Math.min(this.TileA.y, this.TileB.y)
            const _ex = Math.max(this.TileA.x, this.TileB.x)
            const _ey = Math.max(this.TileA.y, this.TileB.y)

            this.RectStartTile = new THREE.Vector2(_sx, _sy)
            this.RectEndTile = new THREE.Vector2(_ex, _ey)

            const _width = (_ex - _sx) + 1
            const _length = (_ey - _sy) + 1

            const _G = new THREE.PlaneGeometry(_width, _length)

            this.RectAreaMesh.geometry.dispose()
            this.RectAreaMesh.geometry = _G
            this.RectAreaMesh.position.set((GAME_SETTINGS.City.mapSize / -2) + (_sx + (_width / 2)), 0,
                (GAME_SETTINGS.City.mapSize / -2) + (_sy + (_length / 2)))
        }
    }

    Update ()
    {
        if (GAME_SETTINGS.City.active && 
            GAME_SETTINGS.City.ready && 
            this.TerrainMesh)
        {
            if ((GAME_SETTINGS.City.placingStructure && 
                GAME_SETTINGS.City.structure) ||
                (GAME_SETTINGS.City.placingPath && 
                GAME_SETTINGS.City.path) ||
                GAME_SETTINGS.City.bulldozing)
            {
                if (!this.cursorReady)
                {
                    OCTAVIA.SetRaycastGroup("City Terrain")
    
                    this.TileCursorMesh.visible = true
                    this.TileCursorMesh.rotation.y = 0
                    
                    if (!GAME_SETTINGS.City.bulldozing)
                    {
                        this.TileCursorMesh.material = this.TCMaterialGood
                        this.TileCursorMesh.rotation.x = 0
                    }

                    this.TileArrowMesh.visible = true
                    this.TileArrowMesh.rotation.y = 0
                    this.AOEMesh.visible = false

                    if (GAME_SETTINGS.City.placingStructure && 
                        GAME_SETTINGS.City.structure)
                    {
                        const _SD = UTILS.getStructureData(GAME_SETTINGS.City.structure)

                        this.AOEMesh.rotation.z = 0

                        if (_SD.pollutionRadius)
                            this.AOEMesh.visible = true
                    }
    
                    this.cursorReady = true
                }

                if (GAME_SETTINGS.City.placingStructure)
                {
                    const _Structure = UTILS.getStructureData(GAME_SETTINGS.City.structure)
                    let _SPD = null // structure placement data

                    if (!_Structure.pollutionRadius && this.AOEMesh.visible)
                        this.AOEMesh.visible = false
                    else if (_Structure.pollutionRadius && !this.AOEMesh.visible)
                        this.AOEMesh.visible = true
                        
                    if (GAME_SCENES.IsFirstObjectIntersected(this.TerrainMesh))
                    {
                        const _ID = GAME_SCENES.IntersectData

                        this.CurrentTile.set(Math.floor(_ID.point.x) + (GAME_SETTINGS.City.mapSize / 2), 
                            Math.floor(_ID.point.z) + (GAME_SETTINGS.City.mapSize / 2))

                        this.TileArrowMesh.position.set(Math.floor(_ID.point.x) + 0.5, 0,
                            Math.floor(_ID.point.z) + 0.5)

                        _SPD = new StructurePlacementData(this.CurrentTile.x, this.CurrentTile.y, GAME_SETTINGS.City.structure, this.GetComponent("City Tile Controller"))
                        const _safeToPlace = _SPD.Calculate()

                        if (_Structure.pollutionRadius)
                        {
                            this.AOEMesh.geometry.dispose()
                            this.AOEMesh.geometry = new THREE.PlaneGeometry((_Structure.pollutionRadius * 2) + _Structure.width,
                                (_Structure.pollutionRadius * 2) + _Structure.length)
                            this.AOEMesh.material = OCTAVIA.FindMaterial("AOE (Pollution)")
                        }

                        if (_safeToPlace)
                        {
                            const _rotation = GAME_OBJECT_DIRECTIONS_MULT[_SPD.direction] * (Math.PI / -2)

                            this.TileCursorMesh.rotation.y = _rotation
                            this.TileArrowMesh.rotation.y = _rotation
                            this.AOEMesh.rotation.z = _rotation
                        }
                        else
                        {
                            this.TileCursorMesh.rotation.y = 0
                            this.TileArrowMesh.rotation.y = 0
                            this.AOEMesh.rotation.z = 0
                        }
                            
                        this.SetTileCursorPosition(((GAME_SETTINGS.City.mapSize / -2) + _SPD.sx) + (_SPD.width / 2), 
                            ((GAME_SETTINGS.City.mapSize / -2) + _SPD.sy) + (_SPD.length / 2))
                        this.AOEMesh.position.copy(this.TileCursorMesh.position)

                        if (_safeToPlace && _SPD)
                            this.TileCursorMesh.material = this.TCMaterialGood
                        else
                            this.TileCursorMesh.material = this.TCMaterialBad

                        if (INPUT.IsPointerButtonUp(0) &&
                            _safeToPlace &&
                            _SPD &&
                            INPUT.PointerData.target.id === "game")
                        {
                            if (_Structure.rule === GAME_STRUCTURE_RULES.SINGLE)
                            {
                                this.GetComponent("City Tile Controller").SetTilesOccupiedRect(_SPD.sx, _SPD.sy, 
                                    _SPD.width, _SPD.length, GAME_SETTINGS.City.structure, this.TilePosition)

                                this.GetComponent("City Structure Controller").GenerateStructureMesh(this.CurrentTile.x, this.CurrentTile.y, 
                                    GAME_SETTINGS.City.structure,
                                    this.TilePosition,
                                    _SPD)
                            }
                        }
                    }
                }
                
                if (GAME_SETTINGS.City.placingPath || 
                    GAME_SETTINGS.City.bulldozing)
                {
                    if (this.TileArrowMesh.visible)
                        this.TileArrowMesh.visible = false
                    if (this.AOEMesh.visible)
                        this.AOEMesh.visible = false

                    if (GAME_SCENES.IsFirstObjectIntersected(this.TerrainMesh))
                    {
                        const _ID = GAME_SCENES.IntersectData

                        this.SetTileCursorPosition(Math.floor(_ID.point.x) + 0.5, 
                            Math.floor(_ID.point.z) + 0.5)

                        this.CurrentTile.set(Math.floor(_ID.point.x) + (GAME_SETTINGS.City.mapSize / 2), 
                            Math.floor(_ID.point.z) + (GAME_SETTINGS.City.mapSize / 2))

                        if (INPUT.IsPointerButtonUp(0) &&
                            INPUT.PointerData.target.id === "game")
                        {
                            if (this.mouseDown)
                            {
                                this.mouseDown = false
                                this.firstDraw = true
                                
                                if (GAME_SETTINGS.City.placingPath)
                                {
                                    this.PathLayoutMesh.visible = false

                                    if (this.pathRouteClear)
                                        this.GeneratePathMesh(GAME_SETTINGS.City.path)

                                    this.pathRouteClear = true
                                }
                                else if (GAME_SETTINGS.City.bulldozing)
                                {
                                    this.RectAreaMesh.visible = false
                                    this.TileCursorMesh.visible = true

                                    this.BulldozeRectArea()
                                }
                            }
                        }

                        if (INPUT.IsPointerButtonDown(0) &&
                            INPUT.PointerData.target.id === "game")
                        {
                            if (!this.mouseDown)
                            {
                                this.mouseDown = true

                                this.TileA = new THREE.Vector2().copy(this.CurrentTile)
                                this.TileB = new THREE.Vector2().copy(this.CurrentTile)

                                if (GAME_SETTINGS.City.placingPath)
                                {
                                    this.PathLayoutMesh.visible = true

                                    this.DrawPathLayout()
                                }
                                else if (GAME_SETTINGS.City.bulldozing)
                                {
                                    this.RectAreaMesh.visible = true
                                    this.TileCursorMesh.visible = false

                                    this.DrawRectArea()
                                }
                            }
                            else
                            {
                                if (!this.CurrentTile.equals(this.TileB))
                                {
                                    this.TileB.copy(this.CurrentTile)

                                    if (this.firstDraw)
                                    {
                                        this.firstDraw = false

                                        if (this.TileA.x !== this.TileB.x)
                                            this.drawAlongX = true
                                        else
                                            this.drawAlongX = false
                                    }

                                    if (GAME_SETTINGS.City.placingPath)
                                    {
                                        this.pathRouteClear = true

                                        this.DrawPathLayout()
                                    }
                                    else if (GAME_SETTINGS.City.bulldozing)
                                    {
                                        this.DrawRectArea()
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else
            {
                if (this.cursorReady)
                {
                    OCTAVIA.SetRaycastGroup()

                    this.TileCursorMesh.visible = false
                    this.TileArrowMesh.visible = false
                    this.AOEMesh.visible = false

                    this.cursorReady = false
                }
            }
        }
    }
}

export { CityTileObjectController }