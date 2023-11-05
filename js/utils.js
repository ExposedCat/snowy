import GLib from 'gi://GLib'

export function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

export function setInterval(mainFunc, endFunc, delayFunc, onRecreated) {
	const id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delayFunc(), () => {
		mainFunc()
		if (!endFunc())  {
			setInterval(mainFunc, endFunc, delayFunc, onRecreated)
		}
		return GLib.SOURCE_REMOVE
	})
	onRecreated(id)
}
