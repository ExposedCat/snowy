const { GLib } = imports.gi
const Utils = imports.misc.extensionUtils
const Extension = Utils.getCurrentExtension()
const { manager } = Extension.imports.js.manager


function init() {
}

function enable() {
    manager.startSnowing()
}

function disable() {
    manager.stopSnowing()
}