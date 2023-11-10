import GLib from 'gi://GLib'

export class Utils {
	static timerId = 0

	static random(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min
	}

	static setInterval(mainFunc, endFunc, delayFunc) {
		this.timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delayFunc(), () => {
			mainFunc()
			if (!endFunc())  {
				this._cleanupTimeout()
				this.setInterval(mainFunc, endFunc, delayFunc)
			}
			this.timerId = 0;
			return GLib.SOURCE_REMOVE
		})
	}

	static _cleanupTimeout() {
    if (this.timerId) {
			GLib.Source.remove(this.timerId)
    }
	}

	static dispose() {
		this._cleanupTimeout()
	}
}
