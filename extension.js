import GLib from 'gi://GLib'
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js'
//constimportExtension = Utils.getCurrentExtension()
import {Config} from './js/config.js'
import {Manager} from './js/manager.js'

let manager = null

function init() {}

function enable() {
	const config = new Config('org.gnome.shell.extensions.snowy')
	manager = new Manager()
	manager.startSnowing(config)
}

function disable() {
	manager.stopSnowing()
	manager = null
}
