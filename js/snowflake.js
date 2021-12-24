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

        Main.uiGroup.add_actor(this.label)
        this.label.set_position(xPosition, -50)

        const { label, destroy } = this

        label.ease({
            y: maxY,
            x: xPosition,
            rotation_angle_z: 30,
            duration: random(3000, 6000),
            mode: Clutter.AnimationMode.LINEAR,
            onComplete: () => onCompleteFunc(
                destroy.bind(this)
            )
        })
    }
}