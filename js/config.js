import GObject from 'gi://GObject'

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js'
//const Extension = Utils.getCurrentExtension()

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
