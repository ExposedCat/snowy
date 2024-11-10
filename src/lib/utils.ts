import GLib from 'gi://GLib'

export class Utils {
	static timerIds = new Set<number>()

	static random(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min
	}

	static setInterval(
		mainFunc: () => void,
		endFunc: () => boolean,
		delayFunc: () => number
	) {
		const timerId = GLib.timeout_add(
			GLib.PRIORITY_DEFAULT,
			delayFunc(),
			() => {
				mainFunc()
				if (!endFunc()) {
					this.setInterval(mainFunc, endFunc, delayFunc)
				}
				this.timerIds.delete(timerId)
				return GLib.SOURCE_REMOVE
			}
		)
		this.timerIds.add(timerId)
	}

	static _cleanupTimeouts() {
		if (this.timerIds.size !== 0) {
			for (const timerId of this.timerIds) {
				GLib.Source.remove(timerId)
			}
			this.timerIds.clear()
		}
	}

	static dispose() {
		this._cleanupTimeouts()
	}
}
