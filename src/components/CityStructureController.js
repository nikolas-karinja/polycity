import { CANVASES, OCTAVIA } from "@little-island/octavia-engine";
import { COLORINDEX_STRUCTURE_TYPE, COLORINDEX_TILE_TYPE, GAME_SETTINGS, GAME_STRUCTURE_TYPES } from "../core/data/game";
import * as UTILS from "../core/utils"
import * as THREE from "three"

class CityStructure
{
    constructor (idColor, tileSetName, gcx, gcy, ptx, pty, sx, sy, w, l, worldPosition, direction)
    {
        this.tileSetName = tileSetName
        this.name = tileSetName
        this.gcx = gcx // geometry chunk x
        this.gcy = gcy // geometry chunk y
        this.ptx = ptx // path tile x
        this.pty = pty // path tile y
        this.sx = sx
        this.sy = sy
        this.ex = sx + (w - 1)
        this.ey = sy + (l - 1)
        this.width = w
        this.length = l
        this.WorldPosition = worldPosition
        this.direction = direction
        this.hasPower = false // for "non-power" buildings
        this.hasWater = false // for "non-power" buildings
        this.abandoned = false // for "non-power" buildings
        this.idColor = idColor
        this.TileSetData = UTILS.getStructureData(this.tileSetName)
        this.powerGridIdColor = null // for "non-power" buildings
        this.initialized = false
        this.housing = [] // for "residential" buildings only

        this.Init()
    }

    get type ()
    {
        return this.TileSetData.type
    }

    Init ()
    {
        CANVASES.Find("Tiles Occupied").FillRectHex(this.sx, this.sy, this.width, this.length, "#0f0")
        CANVASES.Find("Structure ID").FillRectHex(this.sx, this.sy, this.width, this.length, this.idColor)

        switch (this.type)
        { 
            case GAME_STRUCTURE_TYPES.POWER:


                break
            default:
                break
        }

        this.initialized = true
    }

    SetPowerGridId (color)
    {
        this.powerGridIdColor = color
    }

    Destroy ()
    {
        OCTAVIA.FindGameObject("City Generator")
            .GetComponent("City Tile Controller")
            .FindStructureGeometryChunk(this.gcx, this.gcy)
            .RemoveGeometry(this.idColor, false)

        OCTAVIA.FindCanvas("Structure ID")
            .FillRectHex(this.sx, this.sy, 
                this.width, this.length, 
                "#000")
            
        OCTAVIA.FindCanvas("Tile Type")
            .FillRectHex(this.sx, this.sy, 
                this.width, this.length, 
                COLORINDEX_TILE_TYPE.NONE)

        OCTAVIA.FindCanvas("Tiles Occupied")
            .FillRectHex(this.sx, this.sy, 
                this.width, this.length, 
                "#f00")
    }

    Update ()
    {
        if (this.initialized)
        {

        }
    }
}

class PowerGrid
{
    constructor (idColor, cityStructureController)
    {
        this.CSC = cityStructureController
        this.idColor = idColor
        this.sourceIds = []  
        this.structureIds = []
        this.powerCapacity = 0
        this.powerInUse = 0
    }

    AddSource (idColor)
    {
        if (!this.sourceIds.includes(idColor))
            this.sourceIds.push(idColor)
    }

    AddStructure (idColor)
    {
        if (!this.structureIds.includes(idColor))
        {
            this.structureIds.push(idColor)

            const _S = this.CSC.Structures[idColor]
            _S.SetPowerGridId(this.idColor)
        }
    }

    Calculate ()
    {
        this.powerCapacity = 0
        this.powerInUse = 0

        // find max power
        for (let s of this.sourceIds)
        {
            const _S = this.CSC.Structures[s]
            this.powerCapacity += _S.TileSetData.powerCapacity
        }

        // find how much power is in use
        for (let s of this.structureIds)
        {
            const _S = this.CSC.Structures[s]
            
            if (_S.type !== GAME_STRUCTURE_TYPES.POWER)
            {
                _S.SetPowerGridId(this.idColor)
                this.powerInUse += _S.TileSetData.popCapacity
            }
        }

        // if too much power is being drawn
        if (this.powerInUse > this.powerCapacity * 2)
        {
            for (let s of this.structureIds)
            {
                const _S = this.CSC.Structures[s]
                _S.hasPower = false
                _S.Update()
            }
        }
        else
        {
            for (let s of this.structureIds)
            {
                const _S = this.CSC.Structures[s]
                _S.hasPower = true
                _S.Update()
            }
        }
    }
}

class CityPowerGrids
{
    constructor (cityStructureController)
    {
        this.Grids = {}
        this.CSC = cityStructureController
        this.Canvas = CANVASES.Create("Power Grids",
            GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)

        this.Init()
    }
    
    Init ()
    {
        this.Canvas.Clear("#000")
    }

    Update ()
    {
        this.Grids = {}

        this.Canvas.Clear("#000")

        for (const s in this.CSC.Structures)
        {
            if (this.CSC.Structures[s].type === GAME_STRUCTURE_TYPES.POWER)
            {
                const _S = this.CSC.Structures[s]
                const _stack = []
                let _G = null // grid

                if (!this.Canvas.CheckPixelColorHex(_S.ptx, _S.pty, "#000"))
                {
                    const _gridIdColor = this.Canvas.GetPixelColorHex(_S.ptx, _S.pty)
                    _G = this.Grids[_gridIdColor]
                    _G.AddSource(s)
                }
                else
                {
                    _stack.push([_S.ptx, _S.pty])

                    this.Canvas.SetPixelColorHex(_S.ptx, _S.pty, s)

                    this.Grids[s] = new PowerGrid(s, this.CSC)
                    _G = this.Grids[s]
                    _G.AddSource(s)
                }

                while (_stack.length > 0)
                {
                    const [currentX, currentY] = _stack.pop()

                    const _neighbors = [
                        [currentX + 1, currentY],
                        [currentX - 1, currentY],
                        [currentX, currentY + 1],
                        [currentX, currentY - 1],
                    ] 

                    _neighbors.forEach(([nx, ny]) => {
                        if (nx >= 0 &&
                            nx < GAME_SETTINGS.City.mapSize &&
                            ny >= 0 &&
                            ny < GAME_SETTINGS.City.mapSize &&
                            this.Canvas.CheckPixelColorHex(nx, ny, "#000")
                        ) {
                            if (CANVASES.Find("Path Placement").CheckPixelColorHex(nx, ny, "#0f0"))
                            {
                                this.Canvas.SetPixelColorHex(nx, ny, s)
                                _stack.push([nx, ny])
                            }

                            if (_G)
                            {
                                if (!CANVASES.Find("Structure ID").CheckPixelColorHex(nx, ny, "#000"))
                                    _G.AddStructure(CANVASES.Find("Structure ID").GetPixelColorHex(nx, ny))
                            }
                        }
                    })
                }
            }
        }

        for (const g in this.Grids)
            this.Grids[g].Calculate()

        for (const s in this.CSC.Structures)
        {
            if (this.CSC.Structures[s].type !== GAME_STRUCTURE_TYPES.POWER)
            {
                const _S = this.CSC.Structures[s]

                if (this.Canvas.CheckPixelColorHex(_S.ptx, _S.pty, "#000"))
                {
                    _S.SetPowerGridId(null)
                    _S.hasPower = false
                    _S.Update()
                }
            }
        }
    }
}

class CityStructureController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.Structures = {}

        this.StructureIdCanvas = null
        this.PowerGrids = new CityPowerGrids(this)
    }

    Start ()
    {
        this.SetupEvents()
    }

    SetupEvents ()
    {
        OCTAVIA.AddEventListener("create city structures", () =>
        {
            this.InitCanvases()

            GAME_SETTINGS.City.ready = true
        })

        OCTAVIA.AddEventListener("update power grids", () =>
        {
            this.PowerGrids.Update()
        })
    }

    InitCanvases ()
    {
        this.StructuresIdCanvas = OCTAVIA.Managers.Canvases.Create("Structure ID",
            GAME_SETTINGS.City.mapSize, GAME_SETTINGS.City.mapSize)
        this.StructuresIdCanvas.Clear("#000")
    }

    GenerateIdColor ()
    {
        const _color = `#${(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')}`

        // make sure randomly generated color isn't black or already stored
        if (_color === `#000000` || Object.keys(this.Structures).includes(_color))
            return this.GenerateIdColor()
        else
            return _color
    }

    GenerateStructureMesh (tx, ty, structureName, tileCursorPosition, structurePlacementData)
    {
        const _GeoChunk = this.GetComponent("City Tile Controller").FindTileStructureGeometryChunk(tx, ty)
        const _TruePosition = new THREE.Vector3()

        const _idColor = this.Create(structureName, 
            _GeoChunk.chunkX,
            _GeoChunk.chunkY,
            structurePlacementData.ptx, 
            structurePlacementData.pty,
            structurePlacementData.sx, 
            structurePlacementData.sy, 
            structurePlacementData.width, 
            structurePlacementData.length, 
            tileCursorPosition)

        _TruePosition.x = (GAME_SETTINGS.City.geometryChunkSize / -2) + (tileCursorPosition.x - ((GAME_SETTINGS.City.mapSize / -2) + (_GeoChunk.chunkX * GAME_SETTINGS.City.geometryChunkSize)))
        _TruePosition.z = (GAME_SETTINGS.City.geometryChunkSize / -2) + (tileCursorPosition.z - ((GAME_SETTINGS.City.mapSize / -2) + (_GeoChunk.chunkY * GAME_SETTINGS.City.geometryChunkSize)))

        _GeoChunk.AddGeometry(_idColor, structureName, _TruePosition, structurePlacementData.direction)
    }

    Create (tileSetName, gcx, gcy, ptx, pty, sx, sy, w, l, worldPosition, direction)
    {
        const _color = this.GenerateIdColor()

        this.Structures[_color] = new CityStructure(_color, tileSetName, gcx, gcy, ptx, pty, sx, sy, w, l, worldPosition, direction)
    
        OCTAVIA.DispatchEvent("update power grids")

        return _color
    }

    RemoveStructure (idColor)
    {
        const _S = this.FindStructure(idColor)
        _S.Destroy()

        delete this.Structures[idColor]
    }

    FindStructure (idColor)
    {
        return this.Structures[idColor]
    }
}

export { CityStructureController }