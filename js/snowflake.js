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

        const minSize = config.int('min-size')
        const maxSize = config.int('max-size')
        const size = random(minSize, maxSize)
        this.label.set_style(`font-size: ${size}px;`)

        const side = random(0, 1) || -1
        const minRotation = config.int('min-rotation-angle')
        const maxRotation = config.int('max-rotation-angle')
        this.rotationAngle = random(minRotation, maxRotation) * side

        const minDuration = config.int('min-fall-duration')
        const maxDuration = config.int('max-fall-duration')
        this.duration = random(minDuration, maxDuration)
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
            rotation_angle_z: this.rotationAngle,
            duration: this.duration,
            mode: Clutter.AnimationMode.LINEAR,
            onComplete: () => onCompleteFunc(
                destroy.bind(this)
            )
        })
    }
}