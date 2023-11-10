import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'

import { Manager } from './js/manager.js'
import { Utils } from './js/utils.js';

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
		this.manager.dispose()
		this.manager = null
		Utils.dispose()
	}
}
