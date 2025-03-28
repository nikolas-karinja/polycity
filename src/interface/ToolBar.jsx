import icon_house from '../img/icons/house.svg'
import icon_road from '../img/icons/road.svg'
import icon_item64 from '../img/icons/item_64.png'
import icon_bulldozer from "../img/icons/bulldozer.svg"
import { useState } from 'react'
import { OCTAVIA } from '@little-island/octavia-engine'
import * as UTILS from '../core/utils'
import { GAME_SETTINGS } from '../core/game'

const ToolBarItemButton = ({name, itemSelected, setItemSelected, onSelect, onDeselect}) =>
{
    const _onMouseDown = () =>
    {
        if (itemSelected === name)
        {
            setItemSelected("")
            onDeselect()
        }
        else
        {
            setItemSelected(name)
            onSelect()
            OCTAVIA.DispatchEvent("update tile cursor")
        }
    }

    return <div className={`ToolBarItemButton-module ${itemSelected === name ? "selected" : false}`}
        onMouseDown={_onMouseDown}>
        <img src={icon_item64}
            alt="Icon" />
        <text className="ToolBarItemButton-module--name">
            {name}
        </text>
    </div>
}

const ToolBarButton = ({img, name, selected, setSelected}) =>
{
    const [_itemSelected, _setItemSelected] = useState("")

    const _hideAllMenus = () =>
    {
        GAME_SETTINGS.City.placingStructure = false
        GAME_SETTINGS.City.placingPath = false

        GAME_SETTINGS.City.structure = null
        GAME_SETTINGS.City.path = null

        GAME_SETTINGS.City.bulldozing = false

        _setItemSelected("")
    }

    const _onMouseDown = (e) =>
    {
        if (e.target.id === name)
        {
            if (selected === name)
            {
                setSelected("")
                _setItemSelected("")
                _hideAllMenus()
            }
            else
            {
                setSelected(name)
                _hideAllMenus()
            }
        }
    }

    const _determineItems = () =>
    {
        const _items = []

        switch (name)
        {
            case "Structures":
                for (const s in UTILS.getCityTileSetData().Structures)
                    _items.push(<ToolBarItemButton name={s}
                        itemSelected={_itemSelected}
                        setItemSelected={_setItemSelected}
                        onSelect={() => {
                            GAME_SETTINGS.City.placingStructure = true
                            GAME_SETTINGS.City.structure = s
                        }}
                        onDeselect={() => {
                            GAME_SETTINGS.City.placingStructure = false
                            GAME_SETTINGS.City.structure = null
                        }} />)

                break
            case "Paths":
                for (const p in UTILS.getCityTileSetData().Paths)
                    _items.push(<ToolBarItemButton name={p}
                        itemSelected={_itemSelected}
                        setItemSelected={_setItemSelected}
                        onSelect={() => {
                            GAME_SETTINGS.City.placingPath = true
                            GAME_SETTINGS.City.path = p
                        }}
                        onDeselect={() => {
                            GAME_SETTINGS.City.placingPath = false
                            GAME_SETTINGS.City.path = null
                        }} />)

                break
            default:
                break
        }

        return _items
    }

    return <div className={`ToolBarButton-module ${selected === name ? "selected" : ""}`}
        id={name}
        onMouseDown={_onMouseDown}>
        <img src={img}
            alt="Icon" />
        <b className="ToolBarButton-module--name">
            {name}
        </b>
        <div className="ToolBarButton-module--items"
            style={{display: selected === name ? "block" : "none"}}>
            {_determineItems()}
        </div>
    </div>
}

const BulldozeButton = ({name, selected, setSelected}) =>
{
    const _hideAllMenus = () =>
    {
        GAME_SETTINGS.City.placingStructure = false
        GAME_SETTINGS.City.placingPath = false
    
        GAME_SETTINGS.City.structure = null
        GAME_SETTINGS.City.path = null
    }
    
        const _onMouseDown = (e) =>
        {
            if (e.target.id === name)
            {
                if (selected === name)
                {
                    setSelected("")

                    GAME_SETTINGS.City.bulldozing = false
                }
                else
                {
                    setSelected(name)
                    _hideAllMenus()

                    GAME_SETTINGS.City.bulldozing = true

                    OCTAVIA.DispatchEvent("update tile cursor")
                }
            }
        }

    return <div className={`BulldozeButton-module ${selected === name ? "selected" : ""}`}
        id={name}
        onMouseDown={_onMouseDown}>
        <img src={icon_bulldozer}
            alt="Icon" />
    </div>
}

const ToolBar = () =>
{
    const [_selected, _setSelected] = useState("")

    return <div className="ToolBar-module">
        <ToolBarButton img={icon_house}
            name={"Structures"}
            selected={_selected}
            setSelected={_setSelected} />
        <ToolBarButton img={icon_road} 
            name={"Paths"}
            selected={_selected}
            setSelected={_setSelected} />
        <BulldozeButton name={"Bulldozer"}
            selected={_selected}
            setSelected={_setSelected} />
    </div>
}
    
export default ToolBar