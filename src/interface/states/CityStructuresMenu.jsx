import { useEffect, useState } from "react"
import UIState from "../UIState"
import { OCTAVIA } from "@little-island/octavia-engine"
import { GAME_SETTINGS } from "../../core/game"
import * as UTILS from '../../core/utils'

const CityStructuresMenu = () =>
{
    const [visible, setVisibility] = useState(false)

    const closeMenu = () =>
    {
        GAME_SETTINGS.City.placingStructure = false
        GAME_SETTINGS.City.structure = null

        OCTAVIA.DispatchEvent("hide city structures menu")
        OCTAVIA.DispatchEvent("show city state")
    }

    const determineStructures = () =>
    {
        const _s = []

        for (const s in UTILS.getCityTileSetData().Structures)
            _s.push(<button 
                onMouseDown={() => {
                    GAME_SETTINGS.City.placingStructure = true
                    GAME_SETTINGS.City.structure = s

                    OCTAVIA.DispatchEvent("update tile cursor")
                }}>
                {s}
                </button>)

        return _s
    }

    useEffect(() =>
    {
        OCTAVIA.AddEventListener("show city structures menu", () =>
        {
            setVisibility(true)
        })

        OCTAVIA.AddEventListener("hide city structures menu", () =>
        {
            setVisibility(false)
        })
    }, [])

    return <UIState visible={visible}>
        {determineStructures()}
        <button onMouseDown={closeMenu}>CLOSE</button>
    </UIState>
}

export default CityStructuresMenu