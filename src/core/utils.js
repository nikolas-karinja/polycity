import { OCTAVIA } from "@little-island/octavia-engine"
import { GAME_SETTINGS, GAME_TILESETS } from "./data/game"
import { POLITICAL_PARTIES } from "./data/politics"

export const getCityTileSetData = () =>
{
    return GAME_TILESETS[GAME_SETTINGS.City.tileSet]
}

export const getStructureData = (name) =>
{
    return GAME_TILESETS[GAME_SETTINGS.City.tileSet].Structures[name]
}

export const getPathData = (name) =>
{
    return GAME_TILESETS[GAME_SETTINGS.City.tileSet].Paths[name]
}

export const getPartyData = (name) =>
{
    return Object.keys(GAME_SETTINGS.City.Parties).length > 0 ? 
        GAME_SETTINGS.City.Parties[name] : POLITICAL_PARTIES[name]
}

export const getPlayerPartyData = () =>
    {
        return getPartyData(GAME_SETTINGS.City.playerParty)
    }

export const setEnvSpeed = (value) =>
{
    GAME_SETTINGS.Env.speed = value

    OCTAVIA.DispatchEvent("update env speed")
}

export const purchase = (value) => 
{
    GAME_SETTINGS.Env.money -= value
    
    OCTAVIA.DispatchEvent("update econ")
}