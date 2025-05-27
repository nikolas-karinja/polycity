import { OCTAVIA, INPUT, KEYS } from "@little-island/octavia-engine";
import ModifiedOrbitControls from "./ext/ModifiedOrbitControls";
import * as THREE from 'three'

class CityViewControls extends OCTAVIA.Core.ScriptComponent
{
    constructor (...args)
    {
        super(...args)

        this.panSpeed = 0.01
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
        this.Controls.autoRotate = false
        this.Controls.maxDistance = 12
    }

    Update ()
    {
        if (this.Controls)
        {
            const _truePanSpeed = this.Controls.getDistance() * this.panSpeed

            this.Controls.update()

            if (INPUT.IsKeyDown(KEYS.W))
                this.Controls.panUp(_truePanSpeed)

            if (INPUT.IsKeyDown(KEYS.S))
                this.Controls.panDown(_truePanSpeed)

            if (INPUT.IsKeyDown(KEYS.A))
                this.Controls.panLeft(_truePanSpeed)

            if (INPUT.IsKeyDown(KEYS.D))
                this.Controls.panRight(_truePanSpeed)

            if (INPUT.IsKeyDown(KEYS.Q))
                this.Controls.rotateLeft(_truePanSpeed * 0.1)

            if (INPUT.IsKeyDown(KEYS.E))
                this.Controls.rotateRight(_truePanSpeed * 0.1)

            if (INPUT.IsKeyUp(KEYS.O))
                this.Controls.autoRotate = !this.Controls.autoRotate
        }
    }
}

export { CityViewControls }