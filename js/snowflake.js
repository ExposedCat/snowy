const { St, Clutter } = imports.gi
const Main = imports.ui.main

const Utils = imports.misc.extensionUtils
const Extension = Utils.getCurrentExtension()

const { random } = Extension.imports.js.utils


class Snowflake {
    constructor(config) {
        const icons = config.string('flake-icons').split(',')
        const iconNumber = random(0, icons.length - 1)
        const icon = icons[iconNumber]

        this.label = new St.Label({
            text: icon,
            style_class: 'snowflake'
        })
        const size = random(config.int('min-size'), config.int('max-size'))
        this.label.set_style(`font-size: ${size}px;`)
    }

    destroy() {
        this.label.remove_all_transitions()
        Main.uiGroup.remove_actor(this.label)
    }

    fall(onCompleteFunc, maxX, maxY) {
        const xPosition = random(0, maxX)
        const rotationAngle = random(config.int('min-rotation'), config.int('max-rotation'))
        	* (random(1, 2) % 2 == 1 ? -1 : 1)
        const fallDuration = random(config.int('min-duration'), config.int('max-duration'))

        Main.uiGroup.add_actor(this.label)
        this.label.set_position(xPosition, -50)

        const { label, destroy } = this

        label.ease({
            y: maxY,
            x: xPosition,
            rotation_angle_z: rotationAngle,
            duration: fallDuration,
            mode: Clutter.AnimationMode.LINEAR,
            onComplete: () => onCompleteFunc(
                destroy.bind(this)
            )
        })
    }
}
