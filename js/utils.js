import GLib from 'gi://GLib'

export function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function setInterval(mainFunc, endFunc, delay) {
	return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
		mainFunc()
		return endFunc() ? GLib.SOURCE_REMOVE : GLib.SOURCE_CONTINUE
	})
}
