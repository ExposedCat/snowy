const { St, GLib, Clutter } = imports.gi
const Main = imports.ui.main

const config = {
    snowFlakes: ['❅', '❆', '❄'],
    minSize: 20,
    maxSize: 30,
    interval: 2000,
    minFlakes: 1,
    maxFlakes: 5
}

let manager

class Snowflake {
    constructor() {
        const icon = config.snowFlakes[random(0, config.snowFlakes.length - 1)]

        this.size = random(config.minSize, config.maxSize)
        this.label = new St.Label({
            text: icon,
            style_class: 'snowflake'
        })

        manager.snowflakesCount++
    }

    destroy() {
        manager.snowflakesCount--
        this.label.remove_all_transitions()
        Main.uiGroup.remove_actor(this.label)
    }

    fall() {
        const xPosition = random(0, manager.maxX)

        Main.uiGroup.add_actor(this.label)
        this.label.set_position(xPosition, -50)

        const { label, destroy } = this

        label.ease({
            y: manager.maxY,
            x: xPosition,
            rotation_angle_z: 30,
            duration: random(3000, 6000),
            mode: Clutter.AnimationMode.LINEAR,
            onComplete: destroy.bind(this)
        })
    }
}

class Manager {
    constructor() {
        this.timerId = null
        this.snowing = false
        this.snowflakesCount = 0
        this.maxX = 0
        this.maxY = 0
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

    startSnowing() {
        this.timerId = setInterval(() => {
            if (this.snowing && this.snowflakesCount < config.maxFlakes) {
                const snowFlakesCount = random(config.minFlakes, config.maxFlakes)
                for (let i = 0; i < snowFlakesCount; ++i) {
                    const snowflake = new Snowflake()
                    snowflake.fall()
                }
            }
        }, config.interval)
    }

    enable() {
        this.snowing = true
        this.startSnowing()
    }

    disable() {
        if (this.timerId) {
            GLib.Source.remove(this.timerId)
            this.timerId = null
        }
        this.snowing = false
    }
}

function init() {
    return manager = new Manager()
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function setInterval(func, delay) {
    return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
        func()
        return manager.snowing ? GLib.SOURCE_CONTINUE : GLib.SOURCE_REMOVE
    })
}
