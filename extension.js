import GLib from 'gi://GLib'
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js'
//constimportExtension = Utils.getCurrentExtension()
import * as Config from './js/config.js'
import * as Manager from './js/manager.js'

let manager = null
export default class snowy {
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
}
