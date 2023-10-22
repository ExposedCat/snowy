import GLib from 'gi://GLib'

function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function setInterval(mainFunc, endFunc, delay) {
	return GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
		mainFunc()
		const next = endFunc() ? GLib.SOURCE_REMOVE : GLib.SOURCE_CONTINUE
		return next
	})
}
