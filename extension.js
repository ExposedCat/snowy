import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'

import { Config } from './js/config.js'
import { Manager } from './js/manager.js'

export default class SnowyExtension extends Extension {
	manager = null
	
	enable() {
		if (this.manager === null) {
			this.manager = new Manager()
		}
		const settings = this.getSettings('org.gnome.shell.extensions.snowy');
		const config = new Config(settings)
		this.manager.startSnowing(config)
	}
	
	disable() {
		this.manager.stopSnowing()
		this.manager = null
	}
}
