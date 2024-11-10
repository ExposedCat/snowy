import Gio from 'gi://Gio'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'

import { Snowflake } from './snowflake.js'
import { Utils } from './utils.js'

export class Manager {
	snowing = false
	snowflakesCount = 0
	maxX = 0
	maxY = 0

	constructor() {
		this._defineSnowingArea()
	}

	_defineSnowingArea() {
		for (const monitor of Main.layoutManager.monitors) {
			let areaX = monitor.width + monitor.x
			if (areaX > this.maxX) {
				this.maxX = areaX
			}
			let areaY = monitor.height + monitor.y
			if (areaY > this.maxY) {
				this.maxY = areaY
			}
		}
	}

	stopSnowing() {
		this.snowing = false
	}

	startSnowing(settings: Gio.Settings) {
		this.snowing = true

		const onAnimationComplete = (destroySnowflake: () => void) => {
			this.snowflakesCount -= 1
			destroySnowflake()
		}

		const snowFunc = () => {
			if (this.snowing) {
				const newSnowflakesCount = Utils.random(
					settings.get_int('min-flakes'),
					settings.get_int('max-flakes')
				)
				for (
					let i = 0;
					i < newSnowflakesCount &&
					this.snowflakesCount <= settings.get_int('flakes-limit');
					++i
				) {
					const snowflake = new Snowflake(settings)
					this.snowflakesCount++
					snowflake.fall(
						onAnimationComplete.bind(this),
						this.maxX,
						this.maxY
					)
				}
			}
		}
		const endFunc = () => !this.snowing
		const delayFunc = () => settings.get_int('interval')

		Utils.setInterval(snowFunc, endFunc, delayFunc)
	}

	dispose() {
		this.stopSnowing()
	}
}
