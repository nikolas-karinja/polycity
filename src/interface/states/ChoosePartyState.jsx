import { useEffect, useState } from "react"
import PoliticalPartySelect from "../PoliticalPartySelect"
import UIState from "../UIState"
import { OCTAVIA } from "@little-island/octavia-engine"

const ChoosePartyState = () =>
{
    const [visible, setVisibility] = useState(false)

    useEffect(() =>
    {
        OCTAVIA.AddEventListener("show choose party", () =>
        {
            setVisibility(true)
        })

        OCTAVIA.AddEventListener("create city", () =>
        {
            setVisibility(false)
        })

        OCTAVIA.AddEventListener("show city state", () =>
        {
            setVisibility(false)
        })
    }, [])

    return <UIState visible={visible}>
        <PoliticalPartySelect />
    </UIState>
}

export default ChoosePartyState