import { OCTAVIA } from "@little-island/octavia-engine"
import { COMPONENTS } from "./core/components"
import { ASSEMBLIES } from "./core/assemblies"
import { GAME_EVENTS } from "./core/game"
import { GAME_MATERIALS } from "./core/materials"

const Octavia = ({children}) =>
{
    return <OCTAVIA.Interface
        data={{
            assemblies : ASSEMBLIES,
            components : COMPONENTS,
            events     : GAME_EVENTS,
            materials  : GAME_MATERIALS,
        }}
        onReady={() =>
        {
            OCTAVIA.CreateScene('Main Menu')
            OCTAVIA.CreateScene('World')
            OCTAVIA.CreateScene('City')

            // temp
            OCTAVIA.AssembleGameObject("City Generator")

            setTimeout(() =>
            {
                OCTAVIA.DispatchEvent("create city")
            }, 100)
        }}>
        {children}
        </OCTAVIA.Interface>
}

export default Octavia