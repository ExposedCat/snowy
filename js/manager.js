const { GLib } = imports.gi
const Main = imports.ui.main

const Utils = imports.misc.extensionUtils
const Extension = Utils.getCurrentExtension()
const { Config } = Extension.imports.js.config
const { Snowflake } = Extension.imports.js.snowflake
const { random, setInterval } = Extension.imports.js.utils


const config = new Config('org.gnome.shell.extensions.snowy')

class Manager {
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
            if (areaX > this.maxY) {
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

    startSnowing() {
        this.snowing = true
        const onAnimationComplete = destroySnowflake => {
            this.snowflakesCount--
            destroySnowflake()
        }
        const snowFunc = () => {
            if (this.snowing && this.snowflakesCount < config.int('max-flakes')) {
                const snowFlakesCount = random(
                    config.int('min-flakes'),
                    config.int('max-flakes')
                )
                for (let i = 0; i < snowFlakesCount; ++i) {
                    const snowflake = new Snowflake()
                    this.snowflakesCount++
                    snowflake.fall(
                        onAnimationComplete.bind(this),
                        this.maxX, this.maxY
                    )
                }
            }
        }
        const endFunc = () => !this.snowing
        const delay = config.int('interval')

        this.timerId = setInterval(snowFunc, endFunc, delay)
    }
}

const manager = new Manager()