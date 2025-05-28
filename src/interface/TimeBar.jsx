import { GAME_SETTINGS, GAME_SPEED } from "../core/data/game"
import * as UTILS from "../core/utils"
import icon_speedPause from "../img/icons/speed_pause.svg"
import icon_speedNormal from "../img/icons/speed_normal.svg"
import icon_speedFast from "../img/icons/speed_fast.svg"
import { useEffect, useState } from "react"
import { OCTAVIA } from "@little-island/octavia-engine"

const TimeBarSpeedButton = ({speed, name, img}) =>
{
    const _onMouseDown = () =>
    {
        UTILS.setEnvSpeed(speed)
    }

    const _isSelectedSpeed = () =>
    {
        return GAME_SETTINGS.Env.speed === speed
    }

    return <div className={`TimeBarSpeedButton-module ${_isSelectedSpeed() ? "selected" : ""}`}
        onMouseDown={_onMouseDown}>
        <img src={img}
            alt="Speed" />
        <b className="TimeBarSpeedButton-module--name">
            {name}
        </b>
    </div>
}

const TimeBarDay = () =>
{
    return <div className="TimeBar-module--day">
        <text>
            Day {GAME_SETTINGS.Env.daysPassed + 1}
        </text>
    </div>
}

const TimeBar = () =>
{
    const [_, _update] = useState(Date.now())

    useEffect(() =>
    {
        OCTAVIA.AddEventListener("update env speed", () =>
        {
            _update(Date.now())
        })
    }, [])

    return <div className="TimeBar-module">
        <TimeBarDay />
        <div className="TimeBar-module--speed">
            <TimeBarSpeedButton speed={GAME_SPEED.PAUSE}
                name={"Pause"}
                img={icon_speedPause} />
            <TimeBarSpeedButton speed={GAME_SPEED.NORMAL}
                name={"Normal"}
                img={icon_speedNormal} />
            <TimeBarSpeedButton speed={GAME_SPEED.FAST}
                name={"Fast"}
                img={icon_speedFast} />
        </div>
    </div>
}

export default TimeBar