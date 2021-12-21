const Extension = imports.misc.extensionUtils.getCurrentExtension()
const { PreferencesWidget } = Extension.imports.js.ui.preferences


// Open preferences dialog
function init() { }

// Generate preferences GTK widget
function buildPrefsWidget() {
    return new PreferencesWidget()
}