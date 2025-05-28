import { GAME_SETTINGS } from "../core/data/game"
import icon_money from "../img/icons/money.svg"
import icon_population from "../img/icons/population.svg"
import icon_angry from "../img/icons/angry.svg"
import icon_happy from "../img/icons/happy.svg"
import icon_mediocre from "../img/icons/mediocre.svg"
import { useEffect, useState } from "react"
import { OCTAVIA } from "@little-island/octavia-engine"

const PopBar = () =>
{
    return <div className="PopBar-module">
        <div className="PopBar-module--value">
            {GAME_SETTINGS.City.population.toLocaleString()}
        </div>
        <img className="PopBar-module--icon"
            src={icon_population}
            alt="Population" />
        <div className="PopBar-module--happiness">
            <img className="PopBar-module--icon"
                src={icon_happy}
                alt="Happiness" />
        </div>
    </div>
}

const MoneyBar = () =>
{
    return <div className="MoneyBar-module">
        <div className="MoneyBar-module--value">
            {GAME_SETTINGS.Env.money.toLocaleString()}
        </div>
        <img src={icon_money}
            alt="Money" />
    </div>
}

const EconBar = () =>
{
    const [_, _update] = useState(Date.now())

    useEffect(() =>
    {
        OCTAVIA.AddEventListener("update econ", () =>
        {
            _update(Date.now())
        })
    }, [])

    return <div className="EconBar-module">
        <PopBar />
        <MoneyBar />
    </div>
}

export default EconBar