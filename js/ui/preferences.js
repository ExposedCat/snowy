const { GObject, Gtk } = imports.gi
const Extension = imports.misc.extensionUtils.getCurrentExtension()


const handlers = {
    onIntervalChanged: interval => {
        log(interval.get_value_as_int())
    }
}

class PreferencesWidgetClass extends Gtk.Box {
    _init(params) {
        super._init(params)
        // TODO: Load current values
    }

    // TODO: Add event handlers
}

const Widget = {
    GTypeName: 'SnowyPrefsWidget',
    Template: Extension.dir.get_child('preferences.ui').get_uri(),
    InternalChildren: [
    ]
}

const PreferencesWidget = GObject.registerClass(Widget, PreferencesWidgetClass)