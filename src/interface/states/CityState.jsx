import { useEffect, useState } from "react"
import UIState from "../UIState"
import { OCTAVIA } from "@little-island/octavia-engine"
import { GAME_SETTINGS } from "../../core/game"

const CityState = () =>
{
    const [visible, setVisibility] = useState(false)
    const [viewingStructuresMenu, setViewingStructuresMenu] = useState(false)
    const [viewingPathsMenu, setViewingPathsMenu] = useState(false)

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

    const togglePathsMenu = () =>
        {
            if (viewingPathsMenu)
            {
                setViewingPathsMenu(false)
                setVisibility(true)
                OCTAVIA.DispatchEvent("hide city paths menu")
            }
            else
            {
                setViewingPathsMenu(true)
                setVisibility(false)
                OCTAVIA.DispatchEvent("show city paths menu")
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
            setViewingPathsMenu(false)
            setVisibility(true)
        })
    }, [])

    return <UIState visible={visible}>
        <button onMouseDown={toggleStructuresMenu}>Structures</button>
        <button onMouseDown={togglePathsMenu}>Paths</button>
    </UIState>
}

export default CityState