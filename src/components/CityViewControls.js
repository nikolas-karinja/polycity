import { OCTAVIA, INPUT, KEYS } from "@little-island/octavia-engine";
import ModifiedOrbitControls from "./ext/ModifiedOrbitControls";
import * as THREE from 'three'

class CityViewControls extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.panSpeed = 1
        this.Controls = null
    }

    Start ()
    {
        this.SetupControls()
    }

    SetupControls ()
    {
        this.Controls = new ModifiedOrbitControls(this.GetComponent("Camera").Camera,
            OCTAVIA.InterfaceUtils.getGameElement())
        this.Controls.screenSpacePanning = false
        this.Controls.enableDamping = true
        this.Controls.mouseButtons.LEFT = null
        this.Controls.mouseButtons.RIGHT = THREE.MOUSE.PAN
    }

    Update ()
    {
        if (this.Controls)
        {
            this.Controls.update()

            if ( INPUT.IsKeyDown( KEYS.W ) ) {

                this.Controls.panUp(this.panSpeed)
    
            }

            if ( INPUT.IsKeyDown( KEYS.S ) ) {

                this.Controls.panDown(this.panSpeed)
    
            }

            if ( INPUT.IsKeyDown( KEYS.A ) ) {

                this.Controls.panLeft(this.panSpeed)
    
            }

            if ( INPUT.IsKeyDown( KEYS.D ) ) {

                this.Controls.panRight(this.panSpeed)
    
            }
        }
    }
}

export { CityViewControls }