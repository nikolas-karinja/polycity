import { CityController } from "../../components/CityController";
import { CityPathingController } from "../../components/CityPathingController";
import { CityStructureController } from "../../components/CityStructureController";
import { CityTerrainController } from "../../components/CityTerrainController";
import { CityTileController } from "../../components/CityTileController";
import { CityTileObjectController } from "../../components/CityTileObjectController";
import { CityViewControls } from "../../components/CityViewControls";

export const COMPONENTS = {
    "City Controller" : CityController,
    "City Terrain Controller" : CityTerrainController,
    "City Tile Controller" : CityTileController,
    "City Pathing Controller" : CityPathingController,
    "City Structure Controller" : CityStructureController,
    "City Tile Object Controller" : CityTileObjectController,
    
    "City View Controls" : CityViewControls,
}