import { OCTAVIA } from "@little-island/octavia-engine"
import { COMPONENTS } from "./core/components"
import { ASSEMBLIES } from "./core/assemblies"
import { GAME_EVENTS } from "./core/game"
import { GAME_MATERIALS, GAME_TEXTURES } from "./core/materials"
import { MODELS } from "./core/models"

const Octavia = ({children}) =>
{
    return <OCTAVIA.Interface
        title="PolyCity"
        data={{
            assemblies : ASSEMBLIES,
            components : COMPONENTS,
            events     : GAME_EVENTS,
            materials  : GAME_MATERIALS,
            models     : MODELS,
            textures   : GAME_TEXTURES,
        }}
        onReady={() =>
        {
            OCTAVIA.CreateScene('Main Menu')
            OCTAVIA.CreateScene('World')
            OCTAVIA.CreateScene('City')

            // temp
            OCTAVIA.AssembleGameObject("City Generator")
            OCTAVIA.AssembleGameObject("City Camera")

            setTimeout(() =>
            {
                OCTAVIA.DispatchEvent("create city")
            }, 100)
        }}>
        {children}
        </OCTAVIA.Interface>
}

export default Octavia