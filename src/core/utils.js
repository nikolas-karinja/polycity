import { GAME_SETTINGS, GAME_TILESETS } from "./game"

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