import icon_structure64 from '../img/icons/structure_64.png'
import icon_path64 from '../img/icons/path_64.png'
import icon_item64 from '../img/icons/item_64.png'
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
        <t className="ToolBarItemButton-module--name">
            {name}
        </t>
    </div>
}

const ToolBarButton = ({img, name, selected, setSelected, onSelect}) =>
{
    const [_itemSelected, _setItemSelected] = useState("")

    const _hideAllMenus = () =>
    {
        GAME_SETTINGS.City.placingStructure = false
        GAME_SETTINGS.City.placingPath = false

        GAME_SETTINGS.City.structure = null
        GAME_SETTINGS.City.path = null

        _setItemSelected("")

        OCTAVIA.DispatchEvent("hide city structures menu")
        OCTAVIA.DispatchEvent("hide city paths menu")
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
                onSelect()
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

const ToolBar = () =>
{
    const [_selected, _setSelected] = useState("")

    const _onStructuresSelect = () =>
    {
        OCTAVIA.DispatchEvent("show city structures menu")
    }

    const _onPathsSelect = () =>
    {
        OCTAVIA.DispatchEvent("show city paths menu")
    }

    return <div className="ToolBar-module">
        <ToolBarButton img={icon_structure64}
            name={"Structures"}
            selected={_selected}
            setSelected={_setSelected}
            onSelect={_onStructuresSelect} />
        <ToolBarButton img={icon_path64} 
            name={"Paths"}
            selected={_selected}
            setSelected={_setSelected}
            onSelect={_onPathsSelect} />
    </div>
}
    
export default ToolBar