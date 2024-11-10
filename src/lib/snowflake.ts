import Clutter from 'gi://Clutter'
import Gio from 'gi://Gio'
import St from 'gi://St'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'

import { EaseLabelArgs } from './label.js'
import { Utils } from './utils.js'

export class Snowflake {
	private label: St.Label
	private rotationAngle: number
	private duration: number

	constructor(settings: Gio.Settings) {
		const icons = settings.get_string('flake-icons').split(',')
		const iconNumber = Utils.random(0, icons.length - 1)
		const icon = icons[iconNumber]

		this.label = new St.Label({
			text: icon,
			style_class: 'snowflake'
		})

		const minSize = settings.get_int('min-size')
		const maxSize = settings.get_int('max-size')
		const size = Utils.random(minSize, maxSize)
		this.label.set_style(`font-size: ${size}px;`)

		const side = Utils.random(0, 1) || -1
		const minRotation = settings.get_int('min-rotation-angle')
		const maxRotation = settings.get_int('max-rotation-angle')
		this.rotationAngle = Utils.random(minRotation, maxRotation) * side

		const minDuration = settings.get_int('min-fall-duration')
		const maxDuration = settings.get_int('max-fall-duration')
		this.duration = Utils.random(minDuration, maxDuration)
	}

	destroy() {
		this.label.remove_all_transitions()
		Main.layoutManager.uiGroup.remove_child(this.label)
	}

	fall(
		onCompleteFunc: (destroy: () => void) => void,
		maxX: number,
		maxY: number
	) {
		const xPosition = Utils.random(0, maxX)

		Main.layoutManager.uiGroup.add_child(this.label)
		this.label.set_position(xPosition, -50)
		;(this.label as any).ease({
			y: maxY,
			x: xPosition,
			rotation_angle_z: this.rotationAngle,
			duration: this.duration,
			mode: Clutter.AnimationMode.LINEAR,
			onComplete: () => onCompleteFunc(this.destroy.bind(this))
		} as EaseLabelArgs)
	}
}
