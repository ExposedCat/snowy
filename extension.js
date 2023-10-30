import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'

import { Config } from './js/config.js'
import { Manager } from './js/manager.js'

export default class SnowyExtension extends Extension {
	constructor() {
		this.manager = new Manager()
	}

	enable() {
		const settings = this.getSettings();
		const config = new Config(settings)
		this.manager.startSnowing(config)
	}
	
	disable() {
		this.manager.stopSnowing()
		this.manager = null
	}
}
