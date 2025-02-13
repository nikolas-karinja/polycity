import { EVENTS, OCTAVIA } from "@little-island/octavia-engine";
import * as THREE from 'three'
import { GAME_SETTINGS } from "../core/game";

class CityTerrainController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)
        
        this.Mesh = null
    }

    Start ()
    {
        this.SetupEvents()
    }

    SetupEvents ()
    {
        EVENTS.AddListener('create city terrain', () =>
        {
            // create geometry
            const _Geo = new THREE.PlaneGeometry(GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)

            // create mesh
            this.Mesh = new OCTAVIA.Core.Mesh(_Geo)
            this.Mesh.rotateX(Math.PI / -2)

            OCTAVIA.AddToThreeGroup('City Terrain', this.Mesh)

            // set terrain mesh in structure controller component
            this.GetComponent("City Structure Controller").TerrainMesh = this.Mesh

            OCTAVIA.DispatchEvent("create city tiles")
        })
    }
}

export { CityTerrainController }