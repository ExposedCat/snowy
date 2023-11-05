import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'

import { Manager } from './js/manager.js'

export default class SnowyExtension extends Extension {
	manager = null

	enable() {
		if (this.manager === null) {
			this.manager = new Manager()
		}
		const settings = this.getSettings();
		this.manager.startSnowing(settings)
	}

	disable() {
		this.manager.stopSnowing()
		this.manager = null
	}
}
