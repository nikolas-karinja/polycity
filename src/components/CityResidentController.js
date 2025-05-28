import { OCTAVIA } from "@little-island/octavia-engine";
import { BaseIdeologies } from "../core/PoliticalParty";
import { getPartyData, getPlayerPartyData } from "../core/utils";

class Resident
{
    constructor (name)
    {
        this.firstName = name.split(" ")[0]
        this.lastName = name.split(" ")[1]
        this.Ideologies = new BaseIdeologies()
        this.newResident = true

        this.Init()
    }

    Init ()
    {
        if (this.newResident)
        {
            this.SetPersonalIdeologies()

            this.newResident = false
        }
    }

    GenIdeologyValue (name)
    {
        const _PIV = getPlayerPartyData().Ideologies[name].value
        const _a = Math.round(Math.random() * 100)
        const _b = -5 + (_PIV / 10)
        const _c = _PIV > 50 ? -1 : 1
        const _d = 20

        return _a + _b + (_c * _d)
    }

    SetPersonalIdeologies ()
    {
        for (const i in this.Ideologies)
            if (typeof this.Ideologies[i].value === "number")
                this.Ideologies[i].value = this.GenIdeologyValue(i)
    }
}

class CityResidentController extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)
    }
}

export { CityResidentController }