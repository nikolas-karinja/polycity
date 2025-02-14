import { GAME_SCENES, INPUT, OCTAVIA } from "@little-island/octavia-engine";
import { GAME_SETTINGS, GAME_STRUCTURE_RULES } from "../core/game";
import * as THREE from 'three'
import * as UTILS from '../core/utils'

class CityStructureController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.TilePosition = new THREE.Vector3()
        this.CurrentTile = new THREE.Vector2()
        this.TerrainMesh = null
        this.cursorReady = false

        this.TCMaterialGood = OCTAVIA.FindMaterial("Object Cursor (Good)")
        this.TCMaterialBad = OCTAVIA.FindMaterial("Object Cursor (Bad)")

        this.TileCursorMesh = new OCTAVIA.Core.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25),
            this.TCMaterialGood)
        this.TileCursorMesh.raycastEnabled = false
    }

    Start ()
    {
        this.SetupEvents()
        this.SetupTileCursor()
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
        const _GeoChunk = this.GetComponent("City Tile Controller").FindTileGeometryChunk(tx, ty)
        const _TruePosition = new THREE.Vector3()

        _TruePosition.x = ((GAME_SETTINGS.City.geometryChunkSize / -2) + (tx - _GeoChunk.tileStartX)) + 0.5
        _TruePosition.z = ((GAME_SETTINGS.City.geometryChunkSize / -2) + (ty - _GeoChunk.tileStartY)) + 0.5

        if (!OCTAVIA.MathUtils.isOdd(_StructureData.width))
            _TruePosition.x += 0.5
        if (!OCTAVIA.MathUtils.isOdd(_StructureData.length))
            _TruePosition.z += 0.5

        _GeoChunk.AddGeometry(tx, ty, structureName, _TruePosition)
    }

    Update ()
    {
        if (GAME_SETTINGS.City.active && 
            GAME_SETTINGS.City.ready && 
            this.TerrainMesh)
        {
            if (GAME_SETTINGS.City.placingStructure && 
                GAME_SETTINGS.City.structure)
            {
                const _Structure = UTILS.getStructureData(GAME_SETTINGS.City.structure)
                let _tilesClear = true

                if (!this.cursorReady)
                {
                    OCTAVIA.SetRaycastGroup("City Terrain")

                    this.TileCursorMesh.visible = true

                    this.cursorReady = true
                }

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
                        _sx <= 0 || _sy <= 0 ||
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

export { CityStructureController }