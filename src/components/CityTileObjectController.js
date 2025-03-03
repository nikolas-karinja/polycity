import { GAME_SCENES, INPUT, OCTAVIA } from "@little-island/octavia-engine";
import { GAME_SETTINGS, GAME_STRUCTURE_RULES } from "../core/game";
import * as THREE from 'three'
import * as UTILS from '../core/utils'
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

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

        this.TCMaterialGood = OCTAVIA.FindMaterial("Object Cursor (Good)")
        this.TCMaterialBad = OCTAVIA.FindMaterial("Object Cursor (Bad)")

        this.TileCursorMesh = new OCTAVIA.Core.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25),
            this.TCMaterialGood)
        this.TileCursorMesh.raycastEnabled = false

        this.PathLayoutMesh = new OCTAVIA.Core.Mesh(new THREE.BoxGeometry(0, 0, 0),
            this.TCMaterialGood)
        this.PathLayoutMesh.raycastEnabled = false

    }

    Start ()
    {
        this.SetupEvents()
        this.SetupTileCursor()
        this.SetupPathLayout()
    }

    SetTileCursorPosition (x, z)
    {
        this.TilePosition.set(x, 0, z)
        this.TileCursorMesh.position.set(x, 0, z)
    }

    SetupTileCursor ()
    {
        this.TileCursorMesh.visible = false

        this.AddGLObjectToScene(this.TileCursorMesh)
    }

    SetupPathLayout ()
    {
        this.PathLayoutMesh.visible = false

        this.AddGLObjectToScene(this.PathLayoutMesh)
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

                    this.TileCursorMesh.geometry = _tileCursorGeo
                    this.TileCursorMesh.scale.setScalar(UTILS.getCityTileSetData().scale)
                }
            }
        })
    }

    PlaceStructure (tx, ty, structure)
    {
        const _Structure = UTILS.getStructureData(structure)

        const _sx = OCTAVIA.MathUtils.isOdd(_Structure.width) ? tx - (Math.floor(_Structure.width / 2)) :
            tx - ((_Structure.width / 2) - 1)
        const _sy = OCTAVIA.MathUtils.isOdd(_Structure.length) ? ty - (Math.floor(_Structure.length / 2)) :
            ty - ((_Structure.length / 2) - 1)

        this.GetComponent("City Tile Controller").SetTilesOccupiedRect(_sx, _sy, 
            _Structure.width, _Structure.length, structure)
    }

    GenerateStructureMesh (tx, ty, structureName, tilePosition)
    {
        const _StructureData = UTILS.getStructureData(structureName)
        const _GeoChunk = this.GetComponent("City Tile Controller").FindTileStructureGeometryChunk(tx, ty)
        const _TruePosition = new THREE.Vector3()

        _TruePosition.x = ((GAME_SETTINGS.City.geometryChunkSize / -2) + (tx - _GeoChunk.tileStartX)) + 0.5
        _TruePosition.z = ((GAME_SETTINGS.City.geometryChunkSize / -2) + (ty - _GeoChunk.tileStartY)) + 0.5

        if (!OCTAVIA.MathUtils.isOdd(_StructureData.width))
            _TruePosition.x += 0.5
        if (!OCTAVIA.MathUtils.isOdd(_StructureData.length))
            _TruePosition.z += 0.5

        _GeoChunk.AddGeometry(tx, ty, structureName, _TruePosition)
    }

    GeneratePathMesh (pathName)
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

        for (let g of _geoChunks)
            g.Redraw()
    }

    GeneratePathTileAB ()
    {

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
                }

                this.tilesToDraw = _tilesToDraw

                this.PathLayoutMesh.geometry = mergeGeometries(_geometries)
            }
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
                GAME_SETTINGS.City.path))
            {
                if (!this.cursorReady)
                    {
                    OCTAVIA.SetRaycastGroup("City Terrain")
    
                    this.TileCursorMesh.visible = true
    
                    this.cursorReady = true
                }

                if (GAME_SETTINGS.City.placingStructure)
                {
                    const _Structure = UTILS.getStructureData(GAME_SETTINGS.City.structure)
                    let _tilesClear = true

                    if (GAME_SCENES.IsFirstObjectIntersected(this.TerrainMesh))
                    {
                        const _ID = GAME_SCENES.IntersectData

                        this.SetTileCursorPosition(Math.floor(_ID.point.x) + 0.5, 
                            Math.floor(_ID.point.z) + 0.5)

                        this.CurrentTile.set(Math.floor(_ID.point.x) + (GAME_SETTINGS.City.mapSize / 2), 
                            Math.floor(_ID.point.z) + (GAME_SETTINGS.City.mapSize / 2))

                        const _sx = OCTAVIA.MathUtils.isOdd(_Structure.width) ? this.CurrentTile.x - (Math.floor(_Structure.width / 2)) :
                            this.CurrentTile.x - ((_Structure.width / 2) - 1)
                        const _sy = OCTAVIA.MathUtils.isOdd(_Structure.length) ? this.CurrentTile.y - (Math.floor(_Structure.length / 2)) :
                            this.CurrentTile.y - ((_Structure.length / 2) - 1)

                        if (this.GetComponent("City Tile Controller").CheckTilesOccupiedRect(_sx, _sy, _Structure.width, _Structure.length) ||
                            _sx < 0 || _sy < 0 ||
                            _sx + _Structure.width >= GAME_SETTINGS.City.mapSize ||
                            _sy + _Structure.length >= GAME_SETTINGS.City.mapSize)
                            _tilesClear = false

                        if (_tilesClear)
                            this.TileCursorMesh.material = this.TCMaterialGood
                        else
                            this.TileCursorMesh.material = this.TCMaterialBad

                        if (INPUT.IsPointerButtonUp(0) &&
                            this.TilePosition.x !== 0 && 
                            this.TilePosition.z !== 0 && 
                            _tilesClear &&
                            INPUT.PointerData.target.id !== "")
                        {
                            if (_Structure.rule === GAME_STRUCTURE_RULES.SINGLE)
                            {
                                this.GetComponent("City Tile Controller").SetTilesOccupiedRect(_sx, _sy, 
                                    _Structure.width, _Structure.length, GAME_SETTINGS.City.structure, this.TilePosition)

                                this.GenerateStructureMesh(this.CurrentTile.x, this.CurrentTile.y, 
                                    GAME_SETTINGS.City.structure,
                                    this.TilePosition)
                            }
                        }
                    }
                }
                
                if (GAME_SETTINGS.City.placingPath)
                {
                    const _Path = UTILS.getPathData(GAME_SETTINGS.City.path)
                    let _tilesClear = true

                    if (GAME_SCENES.IsFirstObjectIntersected(this.TerrainMesh))
                    {
                        const _ID = GAME_SCENES.IntersectData

                        this.SetTileCursorPosition(Math.floor(_ID.point.x) + 0.5, 
                            Math.floor(_ID.point.z) + 0.5)

                        this.CurrentTile.set(Math.floor(_ID.point.x) + (GAME_SETTINGS.City.mapSize / 2), 
                            Math.floor(_ID.point.z) + (GAME_SETTINGS.City.mapSize / 2))

                        // if (this.GetComponent("City Tile Controller").CheckTilesOccupiedRect(this.CurrentTile.x, this.CurrentTile.y, 1, 1))
                        //     _tilesClear = false

                        // if (_tilesClear)
                        //     this.TileCursorMesh.material = this.TCMaterialGood
                        // else
                        //     this.TileCursorMesh.material = this.TCMaterialBad

                        if (INPUT.IsPointerButtonUp(0) &&
                            this.TilePosition.x !== 0 && 
                            this.TilePosition.z !== 0 &&
                            INPUT.PointerData.target.id !== "")
                        {
                            // this.GetComponent("City Pathing Controller").SetTileOccupied(this.CurrentTile.x, 
                            //     this.CurrentTile.y, 
                            //     true)

                            // this.GeneratePathMesh(this.CurrentTile.x, 
                            //     this.CurrentTile.y,
                            //     GAME_SETTINGS.City.path
                            // )

                            if (this.mouseDown)
                            {
                                this.mouseDown = false
                                this.firstDraw = true
                                this.PathLayoutMesh.visible = false

                                this.GeneratePathMesh(GAME_SETTINGS.City.path)
                            }
                        }

                        if (INPUT.IsPointerButtonDown(0))
                        {
                            if (!this.mouseDown)
                            {
                                this.mouseDown = true

                                this.TileA = new THREE.Vector2().copy(this.CurrentTile)
                                this.TileB = new THREE.Vector2().copy(this.CurrentTile)

                                this.PathLayoutMesh.visible = true

                                this.DrawPathLayout()
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

                                    this.DrawPathLayout()
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

                    this.cursorReady = false
                }
            }
        }
    }
}

export { CityTileObjectController }