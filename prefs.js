import Gio from 'gi://Gio'
import Adw from 'gi://Adw'
import Gtk from 'gi://Gtk'

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'


export default class SnowyExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        this.settings = this.getSettings()

        const appearancePage = new Adw.PreferencesPage({
            title: 'Appearance',
            icon_name: 'preferences-desktop-appearance-symbolic',
        })
        window.add(appearancePage)

        const snowflakesGroup = new Adw.PreferencesGroup({})
        appearancePage.add(snowflakesGroup)

        const iconsRow = new Adw.EntryRow({ title: 'Icons (comma-separated)' })
        this.bindStringRow(iconsRow, 'flake-icons')
        snowflakesGroup.add(iconsRow)

        const maxRotationRow = new Adw.SpinRow({
            title: 'Maximal rotation',
            subtitle: 'Maximal snowflakes rotation angle (in degrees)',
        })
        this.bindNumberRow({
            row: maxRotationRow,
            key: 'max-rotation-angle',
            range: [0, 360, 5]
        })
        const minRotationRow = new Adw.SpinRow({
            title: 'Minimal rotation',
            subtitle: 'Minimal snowflakes rotation angle (in degrees)'
        })
        this.bindNumberRow({
            row: minRotationRow,
            key: 'min-rotation-angle',
            maxRow: maxRotationRow,
            maxKey: 'max-rotation-angle',
            range: [0, 360, 5]
        })
        snowflakesGroup.add(minRotationRow)
        snowflakesGroup.add(maxRotationRow)

        const maxSizeRow = new Adw.SpinRow({
            title: 'Maximal size',
            subtitle: 'Maximal snowflake size (in px)',
        })
        this.bindNumberRow({
            row: maxSizeRow,
            key: 'max-size',
            range: [10, 500, 10]
        })
        const minSizeRow = new Adw.SpinRow({
            title: 'Minimal size',
            subtitle: 'Minimal snowflake size (in px)',
        })
        this.bindNumberRow({
            row: minSizeRow,
            key: 'min-size',
            maxRow: maxSizeRow,
            maxKey: 'max-size',
            range: [10, 500, 10]
        })
        snowflakesGroup.add(minSizeRow)
        snowflakesGroup.add(maxSizeRow)

        const amountPage = new Adw.PreferencesPage({
            title: 'Amounts',
            icon_name: 'zoom-original-symbolic',
        })
        window.add(amountPage)
        const amountGroup = new Adw.PreferencesGroup({})
        amountPage.add(amountGroup)

        const maxFlakesRow = new Adw.SpinRow({
            title: 'Maximum per drop',
            subtitle: 'Maximal amount of snowflakes per single drop'
        })
        this.bindNumberRow({
            row: maxFlakesRow,
            key: 'max-flakes',
            range: [0, 500, 1]
        })
        const minFlakesRow = new Adw.SpinRow({
            title: 'Minimum per drop',
            subtitle: 'Minimal amount of snowflakes per single drop'
        })
        this.bindNumberRow({
            row: minFlakesRow,
            key: 'min-flakes',
            maxRow: maxFlakesRow,
            maxKey: 'max-flakes',
            range: [0, 500, 1]
        })
        amountGroup.add(minFlakesRow)
        amountGroup.add(maxFlakesRow)

        const flakesLimitRow = new Adw.SpinRow({
            title: 'Snowflakes limit',
            subtitle: 'Maximal snowflakes number on screen'
        })
        this.bindNumberRow({
            row: flakesLimitRow,
            key: 'flakes-limit',
            range: [0, 500, 5]
        })
        amountGroup.add(flakesLimitRow)

        const animationPage = new Adw.PreferencesPage({
            title: 'Animation',
            icon_name: 'media-skip-forward-symbolic',
        })
        window.add(animationPage)
        const animationGroup = new Adw.PreferencesGroup({})
        animationPage.add(animationGroup)
        
        
        const maxFallDurationRow = new Adw.SpinRow({
            title: 'Maximal fall duration',
            subtitle: 'Maximal snowflakes falling duration (in ms)'
        })
        this.bindNumberRow({
            row: maxFallDurationRow,
            key: 'max-fall-duration',
            range: [0, 60_000, 100]
        })
        const minFallDurationRow = new Adw.SpinRow({
            title: 'Minimal fall duration',
            subtitle: 'Minimal snowflakes falling duration (in ms)'
        })
        this.bindNumberRow({
            row: minFallDurationRow,
            key: 'min-fall-duration',
            maxRow: maxFallDurationRow,
            maxKey: 'max-fall-duration',
            range: [0, 60_000, 100]
        })
        animationGroup.add(minFallDurationRow)
        animationGroup.add(maxFallDurationRow)
        
        const intervalRow = new Adw.SpinRow({
            title: 'Fall interval',
            subtitle: 'Interval between falling (in ms)'
        })
        this.bindNumberRow({
            row: intervalRow,
            key: 'interval',
            range: [0, 60_000, 100]
        })
        animationGroup.add(intervalRow)
    }

    bindStringRow(row, key) {
        this.settings.bind(key, row, 'text', Gio.SettingsBindFlags.DEFAULT)
    }

    bindNumberRow({ row, key, maxRow = null, maxKey = null, range = [0, 500, 5] }) {
        row.adjustment = new Gtk.Adjustment({
            lower: range[0],
            upper: range[1],
            step_increment: range[2]
        })
        row.value = this.settings.get_int(key)
        row.connect('notify::value', spin => {
            const newValue = spin.get_value()
            this.settings.set_int(key, newValue)
            if (maxKey) {
                const maxValue = this.settings.get_int(maxKey)
                if (maxValue < newValue) {
                    this.settings.set_int(maxKey, newValue)
                    if (maxRow) {
                        maxRow.value = newValue
                    }
                }
            }
        })
    }
}
