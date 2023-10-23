import GLib from 'gi://GLib'
import Main from 'resource:///org/gnome/shell/ui/main.js'

//const Utils = imports.misc.extensionUtils
//const Extension = Utils.getCurrentExtension()
import {Snowflake} from './snowflake.js' 
import {random, setInterval} from './utils.js'

var Manager = class Manager {
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

	startSnowing(config) {
		this.snowing = true
		const onAnimationComplete = destroySnowflake => {
			this.snowflakesCount--
			destroySnowflake()
		}
		const snowFunc = () => {
			if (this.snowing) {
				const newSnowflakesCount = random(
					config.int('min-flakes'),
					config.int('max-flakes')
				)
				for (
					let i = 0;
					i < newSnowflakesCount &&
					this.snowflakesCount <= config.int('flakes-limit');
					++i
				) {
					const snowflake = new Snowflake(config)
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
		const delay = config.int('interval')

		this.timerId = setInterval(snowFunc, endFunc, delay)
	}
}
