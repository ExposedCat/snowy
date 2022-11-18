const GObject = imports.gi.GObject

const Utils = imports.misc.extensionUtils
const Extension = Utils.getCurrentExtension()

var Config = class Config {
	constructor(id) {
		this.data = Utils.getSettings(id)
	}

	int(name) {
		return this.data.get_int(name)
	}

	string(name) {
		return this.data.get_string(name)
	}
}
