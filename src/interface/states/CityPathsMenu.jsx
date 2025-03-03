import { useEffect, useState } from "react"
import UIState from "../UIState"
import { OCTAVIA } from "@little-island/octavia-engine"
import { GAME_SETTINGS } from "../../core/game"
import * as UTILS from '../../core/utils'

const CityPathsMenu = () =>
{
    const [visible, setVisibility] = useState(false)

    const closeMenu = () =>
    {
        GAME_SETTINGS.City.placingPath = false
        GAME_SETTINGS.City.path = null

        OCTAVIA.DispatchEvent("hide city paths menu")
        OCTAVIA.DispatchEvent("show city state")
    }

    const determinePaths = () =>
    {
        const _p = []

        for (const p in UTILS.getCityTileSetData().Paths)
            _p.push(<button 
                onMouseDown={() => {
                    GAME_SETTINGS.City.placingPath = true
                    GAME_SETTINGS.City.path = p
                }}>
                {p}
                </button>)

        return _p
    }

    useEffect(() =>
    {
        OCTAVIA.AddEventListener("show city paths menu", () =>
        {
            setVisibility(true)
        })

        OCTAVIA.AddEventListener("hide city paths menu", () =>
        {
            setVisibility(false)
        })
    }, [])

    return <UIState visible={visible}>
        {determinePaths()}
        <button onMouseDown={closeMenu}>CLOSE</button>
    </UIState>
}

export default CityPathsMenu