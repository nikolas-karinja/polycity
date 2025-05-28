import { useState } from "react"
import { POLITICAL_PARTIES } from "../core/data/politics"
import img_defaultPartyBanner from "../img/default_party_banner.avif"
import { GAME_SETTINGS } from "../core/data/game"
import { OCTAVIA } from "@little-island/octavia-engine"

const IdeologyLevel = ({main, data}) =>
{
    return <div className={`IdeologyLevel-module ${main ? "main" : ""}`}>
        <div className={`IdeologyLevel-module--min ${main ? "main" : ""}`}>
            {data.minName}
        </div>
        <div className={`IdeologyLevel-module--level ${main ? "main" : ""}`}>
            <div className="IdeologyLevel-module--level--fill"
                style={{width: `${data.value}%`}}>
                <div className="IdeologyLevel-module--level--fill--cap" />
            </div>
        </div>
        <div className={`IdeologyLevel-module--max ${main ? "main" : ""}`}>
            {data.maxName}
            </div>
    </div>
}

const PoliticalPartyCard = ({main, partyName}) =>
{
    const determineIdeologyLevels = () =>
    {
        const _levels = []

        for (const i in POLITICAL_PARTIES[partyName].Ideologies)
            _levels.push(<IdeologyLevel main={main} 
                data={POLITICAL_PARTIES[partyName].Ideologies[i]} />)

        return _levels
    }

    return <div className="PoliticalPartyCard-module">
        <h3>{partyName}</h3>
        <img className="PoliticalPartyCard-module--partyBanner"
            src={img_defaultPartyBanner}
            alt="Party Banner" />
       {determineIdeologyLevels()}
    </div>
}

const PoliticalPartySelect = () =>
{
    const [_key, _setKey] = useState(2)

    const _shiftLeft = () =>
    {
        if (_key > 0)
            _setKey(_key - 1)
    }

    const _shiftRight = () =>
    {
        if (_key < Object.keys(POLITICAL_PARTIES).length - 1)
            _setKey(_key + 1)
    }

    const _onSelect = () =>
    {
        GAME_SETTINGS.City.playerParty = Object.keys(POLITICAL_PARTIES)[_key]
        GAME_SETTINGS.City.Parties = {...POLITICAL_PARTIES}

        OCTAVIA.DispatchEvent("create city")
    }

    return <div className="PoliticalPartySelect-module">
        <h1>Pick your Party</h1>
        <div className="PoliticalPartySelect-module--parties">
            <button className="PoliticalPartySelect-module--parties--back"
                onMouseDown={_shiftLeft}>{"<"}</button>
            <div className="PoliticalPartySelect-module--parties--left">
                {_key - 1 >= 0 ? <PoliticalPartyCard partyName={Object.keys(POLITICAL_PARTIES)[_key - 1]} /> : <></>}
            </div>
            <div className="PoliticalPartySelect-module--parties--main">
                <PoliticalPartyCard main={true}
                    partyName={Object.keys(POLITICAL_PARTIES)[_key]} />
            </div>
            <div className="PoliticalPartySelect-module--parties--right">
                {_key + 1 < Object.keys(POLITICAL_PARTIES).length ? <PoliticalPartyCard partyName={Object.keys(POLITICAL_PARTIES)[_key + 1]} /> : <></>}
            </div>
            <button className="PoliticalPartySelect-module--parties--next"
                onMouseDown={_shiftRight}>{">"}</button>
        </div>
        <div className="PoliticalPartySelect-module--buttons">
            <button onMouseDown={_onSelect}>Select</button>
            <button>Create Your Own!</button>
        </div>
    </div>
}

export default PoliticalPartySelect