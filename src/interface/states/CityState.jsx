import { useEffect, useState } from "react"
import UIState from "../UIState"
import { OCTAVIA } from "@little-island/octavia-engine"
import { GAME_SETTINGS } from "../../core/game"

const CityState = () =>
{
    const [visible, setVisibility] = useState(false)
    const [viewingStructuresMenu, setViewingStructuresMenu] = useState(false)

    const toggleStructuresMenu = () =>
    {
        if (viewingStructuresMenu)
        {
            setViewingStructuresMenu(false)
            setVisibility(true)
            OCTAVIA.DispatchEvent("hide city structures menu")
        }
        else
        {
            setViewingStructuresMenu(true)
            setVisibility(false)
            OCTAVIA.DispatchEvent("show city structures menu")
        }
    }

    useEffect(() =>
    {
        OCTAVIA.AddEventListener("create city", () =>
        {
            setVisibility(true)
        })

        OCTAVIA.AddEventListener("show city state", () =>
        {
            setViewingStructuresMenu(false)
            setVisibility(true)
        })
    }, [])

    return <UIState visible={visible}>
        <button onMouseDown={toggleStructuresMenu}>Structures</button>
    </UIState>
}

export default CityState