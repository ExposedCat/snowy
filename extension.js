const { GLib } = imports.gi
const Utils = imports.misc.extensionUtils
const Me = Utils.getCurrentExtension()
const { manager } = Me.imports.js.manager


function init() {
    log('Initialized Snowy')
}

function enable() {
    log('Enabled Snowy')
    manager.startSnowing()
}

function disable() {
    log('Disabled Snowy')
    manager.stopSnowing()
}