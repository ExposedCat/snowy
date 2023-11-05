import GLib from 'gi://GLib'
import * as Main from 'resource:///org/gnome/shell/ui/main.js'

import { Snowflake } from './snowflake.js' 
import { random, setInterval } from './utils.js'

export class Manager {
	constructor() {
		this.timerId = null
		this.snowing = false
		this.snowflakesCount = 0
		this.maxX = 0
		this.maxY = 0
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
		if (this.timerId) {
			GLib.Source.remove(this.timerId)
			this.timerId = null
		}
		this.snowing = false
	}

	startSnowing(settings) {
		this.snowing = true
		const onAnimationComplete = destroySnowflake => {
			this.snowflakesCount--
			destroySnowflake()
		}
		const snowFunc = () => {
			if (this.snowing) {
				const newSnowflakesCount = random(
					settings.get_int('min-flakes'),
					settings.get_int('max-flakes')
				)
				for (
					let i = 0;
					i < newSnowflakesCount && this.snowflakesCount <= settings.get_int('flakes-limit');
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
		const onRecreated = timerId => this.timerId = timerId
		const delayFunc = () => settings.get_int('interval')

		setInterval(snowFunc, endFunc, delayFunc, onRecreated)
	}
}
