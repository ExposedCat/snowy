import Adw from 'gi://Adw'
import Gio from 'gi://Gio'
import Gtk from 'gi://Gtk'

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'

type SettingsWindow = Adw.PreferencesWindow & {
	_settings: Gio.Settings
}

type BuildNumberRowArgs = {
	settings: Gio.Settings
	row: Adw.SpinRow
	key: string
	maxRow?: Adw.SpinRow | null
	maxKey?: string | null
	range?: [number, number, number]
}

export default class SnowyExtensionPreferences extends ExtensionPreferences {
	async fillPreferencesWindow(window: SettingsWindow) {
		// TODO: Use shared class context
		window._settings = this.getSettings()

		const appearancePage = new Adw.PreferencesPage({
			title: 'Appearance',
			icon_name: 'preferences-desktop-appearance-symbolic'
		})
		window.add(appearancePage)

		const snowflakesGroup = new Adw.PreferencesGroup({})
		appearancePage.add(snowflakesGroup)

		const iconsRow = new Adw.EntryRow({ title: 'Icons (comma-separated)' })
		this.bindStringRow(window._settings, iconsRow, 'flake-icons')
		snowflakesGroup.add(iconsRow)

		const maxRotationRow = new Adw.SpinRow({
			title: 'Maximal rotation',
			subtitle: 'Maximal snowflakes rotation angle (in degrees)'
		})
		this.bindNumberRow({
			settings: window._settings,
			row: maxRotationRow,
			key: 'max-rotation-angle',
			range: [0, 360, 5]
		})
		const minRotationRow = new Adw.SpinRow({
			title: 'Minimal rotation',
			subtitle: 'Minimal snowflakes rotation angle (in degrees)'
		})
		this.bindNumberRow({
			settings: window._settings,
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
			subtitle: 'Maximal snowflake size (in px)'
		})
		this.bindNumberRow({
			settings: window._settings,
			row: maxSizeRow,
			key: 'max-size',
			range: [10, 500, 10]
		})
		const minSizeRow = new Adw.SpinRow({
			title: 'Minimal size',
			subtitle: 'Minimal snowflake size (in px)'
		})
		this.bindNumberRow({
			settings: window._settings,
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
			icon_name: 'zoom-original-symbolic'
		})
		window.add(amountPage)
		const amountGroup = new Adw.PreferencesGroup({})
		amountPage.add(amountGroup)

		const maxFlakesRow = new Adw.SpinRow({
			title: 'Maximum per drop',
			subtitle: 'Maximal amount of snowflakes per single drop'
		})
		this.bindNumberRow({
			settings: window._settings,
			row: maxFlakesRow,
			key: 'max-flakes',
			range: [0, 500, 1]
		})
		const minFlakesRow = new Adw.SpinRow({
			title: 'Minimum per drop',
			subtitle: 'Minimal amount of snowflakes per single drop'
		})
		this.bindNumberRow({
			settings: window._settings,
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
			settings: window._settings,
			row: flakesLimitRow,
			key: 'flakes-limit',
			range: [0, 500, 5]
		})
		amountGroup.add(flakesLimitRow)

		const animationPage = new Adw.PreferencesPage({
			title: 'Animation',
			icon_name: 'media-skip-forward-symbolic'
		})
		window.add(animationPage)
		const animationGroup = new Adw.PreferencesGroup({})
		animationPage.add(animationGroup)

		const maxFallDurationRow = new Adw.SpinRow({
			title: 'Maximal fall duration',
			subtitle: 'Maximal snowflakes falling duration (in ms, 1s = 1000ms)'
		})
		this.bindNumberRow({
			settings: window._settings,
			row: maxFallDurationRow,
			key: 'max-fall-duration',
			range: [0, 60_000, 100]
		})
		const minFallDurationRow = new Adw.SpinRow({
			title: 'Minimal fall duration',
			subtitle: 'Minimal snowflakes falling duration (in ms, 1s = 1000ms)'
		})
		this.bindNumberRow({
			settings: window._settings,
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
			subtitle: 'Interval between falling (in ms, 1s = 1000ms)'
		})
		this.bindNumberRow({
			settings: window._settings,
			row: intervalRow,
			key: 'interval',
			range: [1_000, 60_000, 100]
		})
		animationGroup.add(intervalRow)
	}

	bindStringRow(settings: Gio.Settings, row: Adw.EntryRow, key: string) {
		settings.bind(key, row, 'text', Gio.SettingsBindFlags.DEFAULT)
	}

	bindNumberRow({
		settings,
		row,
		key,
		maxRow = null,
		maxKey = null,
		range = [0, 500, 5]
	}: BuildNumberRowArgs) {
		row.adjustment = new Gtk.Adjustment({
			lower: range[0],
			upper: range[1],
			step_increment: range[2]
		})
		row.value = settings.get_int(key)
		row.connect('notify::value', spin => {
			const newValue = spin.get_value()
			settings.set_int(key, newValue)
			if (maxKey) {
				const maxValue = settings.get_int(maxKey)
				if (maxValue < newValue) {
					settings.set_int(maxKey, newValue)
					if (maxRow) {
						maxRow.value = newValue
					}
				}
			}
		})
	}
}
