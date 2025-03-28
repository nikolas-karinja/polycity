import { useEffect, useState } from "react"
import UIState from "../UIState"
import { OCTAVIA } from "@little-island/octavia-engine"
import { GAME_SETTINGS } from "../../core/game"
import ToolBar from "../ToolBar"
import TimeBar from "../TimeBar"
import EconBar from "../EconBar"

const CityState = () =>
{
    const [visible, setVisibility] = useState(false)

    useEffect(() =>
    {
        OCTAVIA.AddEventListener("create city", () =>
        {
            setVisibility(true)
        })

        OCTAVIA.AddEventListener("show city state", () =>
        {
            setVisibility(true)
        })
    }, [])

    return <UIState visible={visible}>
        <ToolBar />
        <EconBar />
        <TimeBar />
    </UIState>
}

export default CityState