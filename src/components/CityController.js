import { EVENTS, OCTAVIA } from "@little-island/octavia-engine";
import * as THREE from 'three'
import { GAME_SETTINGS } from "../core/game";

class CityController extends OCTAVIA.Core.ScriptComponent
{
    // constructor (...args)
    // {
    //     super(...args)
    // }

    Start ()
    {
        this.CreateThreeGroups()
        this.SetupEvents()
    }

    CreateThreeGroups ()
    {
        OCTAVIA.CreateThreeGroup('City Terrain', 'City')
        OCTAVIA.CreateThreeGroup('City Structures', 'City')
        OCTAVIA.CreateThreeGroup('City Pathing', 'City')
    }

    SetupEvents ()
    {
        OCTAVIA.AddEventListener('create city', () =>
        {
            GAME_SETTINGS.City.active = true

            OCTAVIA.DispatchEvent('create city terrain')
        })
    }
}

export { CityController }