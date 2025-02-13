import { GAME_SCENES, INPUT, OCTAVIA } from "@little-island/octavia-engine";
import { GAME_SETTINGS, GAME_STRUCTURE_RULES, GAME_STRUCTURES, GAME_TILESETS } from "../core/game";
import * as THREE from 'three'

class CityStructureController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.TileCursorMesh = new OCTAVIA.Core.Mesh(
            new THREE.BoxGeometry(0.25, 0.25, 0.25),
            OCTAVIA.FindMaterial("MeshNormal"))
        this.TilePosition = new THREE.Vector3()
        this.CurrentTile = new THREE.Vector2()
        this.TerrainMesh = null
        this.cursorReady = false
    }

    Start ()
    {
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

    PlaceStructure (tx, ty, structure)
    {
        const _Structure = GAME_STRUCTURES[structure]

        const _sx = OCTAVIA.MathUtils.isOdd(_Structure.width) ? tx - (Math.floor(_Structure.width / 2)) :
            tx - ((_Structure.width / 2) - 1)
        const _sy = OCTAVIA.MathUtils.isOdd(_Structure.length) ? ty - (Math.floor(_Structure.length / 2)) :
            ty - ((_Structure.length / 2) - 1)

        this.GetComponent("City Tile Controller").SetTilesOccupiedRect(_sx, _sy, 
            _Structure.width, _Structure.length, structure)
    }

    GenerateStructureMesh (structureData, transformedDirection)
    {
        if (!structureData.model)
        {
            const _height = Math.random() * 2

            const _Geo = new THREE.BoxGeometry(structureData.width, _height, structureData.length)
            _Geo.translate(0, _height / 2, 0)

            const _Mesh = new OCTAVIA.Core.Mesh(_Geo, OCTAVIA.FindMaterial("Magenta"))
            _Mesh.position.copy(this.TilePosition)

            if (!OCTAVIA.MathUtils.isOdd(structureData.width))
                _Mesh.position.x += 0.5
            if (!OCTAVIA.MathUtils.isOdd(structureData.length))
                _Mesh.position.z += 0.5

            OCTAVIA.AddToThreeGroup("City Structures", _Mesh)
        }
        else
        {
            if (structureData.tileSet)
            {
                const _TileSetData = GAME_TILESETS[structureData.tileSet]

                const _Mesh = OCTAVIA.FindModel(_TileSetData.model).FindMesh(structureData.model).clone()
                _Mesh.position.copy(this.TilePosition)
                _Mesh.scale.setScalar(_TileSetData.scale)

                console.log(_Mesh)

                if (!OCTAVIA.MathUtils.isOdd(structureData.width))
                    _Mesh.position.x += 0.5
                if (!OCTAVIA.MathUtils.isOdd(structureData.length))
                    _Mesh.position.z += 0.5

                OCTAVIA.AddToThreeGroup("City Structures", _Mesh)
            }
        }
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
                const _Structure = GAME_STRUCTURES[GAME_SETTINGS.City.structure]
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

                    if (INPUT.IsPointerButtonUp(0) && this.TilePosition.x !== 0 && this.TilePosition.z !== 0 && _tilesClear)
                    {
                        if (_Structure.rule === GAME_STRUCTURE_RULES.SINGLE)
                        {
                            this.GetComponent("City Tile Controller").SetTilesOccupiedRect(_sx, _sy, 
                                _Structure.width, _Structure.length, GAME_SETTINGS.City.structure)

                            this.GenerateStructureMesh(_Structure, )
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