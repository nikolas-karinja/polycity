import { GAME_SCENES, INPUT, OCTAVIA } from "@little-island/octavia-engine";
import { GAME_SETTINGS, GAME_STRUCTURE_RULES, GAME_STRUCTURES } from "../core/game";
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

    Update ()
    {
        if (GAME_SETTINGS.City.active && this.TerrainMesh)
        {
            if (GAME_SETTINGS.City.placingStructure && GAME_SETTINGS.City.structure)
            {
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
                }

                if (INPUT.IsPointerButtonUp(0) && this.TilePosition.x !== 0 && this.TilePosition.z !== 0)
                {
                    const _Structure = GAME_STRUCTURES[GAME_SETTINGS.City.structure]

                    if (_Structure.rule === GAME_STRUCTURE_RULES.SINGLE)
                    {
                        if (!_Structure.model)
                        {
                            const _height = Math.random() * 2

                            const _Geo = new THREE.BoxGeometry(_Structure.width, _height, _Structure.length)
                            _Geo.translate(0, _height / 2, 0)

                            this._Mesh = new OCTAVIA.Core.Mesh(_Geo, OCTAVIA.FindMaterial("Magenta"))
                            this._Mesh.position.copy(this.TilePosition)

                            OCTAVIA.AddToThreeGroup("City Structures", this._Mesh)
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