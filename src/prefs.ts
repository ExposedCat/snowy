import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

type Bounds = {
  lower: number;
  upper: number;
  step: number;
};

type SpinRowOptions = {
  key: string;
  title: string;
  subtitle: string;
  bounds: Bounds;
};

type RangeRowsOptions = {
  bounds: Bounds;
  minimum: Omit<SpinRowOptions, "bounds">;
  maximum: Omit<SpinRowOptions, "bounds">;
};

function addPage(
  window: Adw.PreferencesWindow,
  title: string,
  iconName: string,
) {
  const page = new Adw.PreferencesPage({ title, icon_name: iconName });
  const group = new Adw.PreferencesGroup();
  page.add(group);
  window.add(page);
  return group;
}

function addRangeRows(
  settings: Gio.Settings,
  group: Adw.PreferencesGroup,
  { bounds, minimum, maximum }: RangeRowsOptions,
) {
  const minimumRow = createSpinRow(settings, { ...minimum, bounds });
  const maximumRow = createSpinRow(settings, { ...maximum, bounds });
  minimumRow.connect("notify::value", () => {
    if (maximumRow.value < minimumRow.value) {
      maximumRow.value = minimumRow.value;
    }
  });
  maximumRow.connect("notify::value", () => {
    if (minimumRow.value > maximumRow.value) {
      minimumRow.value = maximumRow.value;
    }
  });
  group.add(minimumRow);
  group.add(maximumRow);
}

function createSpinRow(
  settings: Gio.Settings,
  { key, title, subtitle, bounds }: SpinRowOptions,
) {
  const row = new Adw.SpinRow({
    title,
    subtitle,
    adjustment: new Gtk.Adjustment({
      lower: bounds.lower,
      upper: bounds.upper,
      step_increment: bounds.step,
      value: settings.get_int(key),
    }),
  });
  row.connect("notify::value", () => {
    settings.set_int(key, row.value);
  });
  return row;
}

export default class SnowyPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window: Adw.PreferencesWindow) {
    const settings = this.getSettings();

    const appearanceGroup = addPage(
      window,
      "Appearance",
      "preferences-desktop-appearance-symbolic",
    );
    const iconsRow = new Adw.EntryRow({ title: "Icons (comma-separated)" });
    settings.bind(
      "flake-icons",
      iconsRow,
      "text",
      Gio.SettingsBindFlags.DEFAULT,
    );
    appearanceGroup.add(iconsRow);
    addRangeRows(settings, appearanceGroup, {
      bounds: { lower: 0, upper: 360, step: 5 },
      minimum: {
        key: "min-rotation-angle",
        title: "Minimal rotation",
        subtitle: "Minimal snowflakes rotation angle (in degrees)",
      },
      maximum: {
        key: "max-rotation-angle",
        title: "Maximal rotation",
        subtitle: "Maximal snowflakes rotation angle (in degrees)",
      },
    });
    addRangeRows(settings, appearanceGroup, {
      bounds: { lower: 10, upper: 500, step: 10 },
      minimum: {
        key: "min-size",
        title: "Minimal size",
        subtitle: "Minimal snowflake size (in px)",
      },
      maximum: {
        key: "max-size",
        title: "Maximal size",
        subtitle: "Maximal snowflake size (in px)",
      },
    });

    const amountGroup = addPage(window, "Amounts", "zoom-original-symbolic");
    addRangeRows(settings, amountGroup, {
      bounds: { lower: 0, upper: 500, step: 1 },
      minimum: {
        key: "min-flakes",
        title: "Minimum per drop",
        subtitle: "Minimal amount of snowflakes per single drop",
      },
      maximum: {
        key: "max-flakes",
        title: "Maximum per drop",
        subtitle: "Maximal amount of snowflakes per single drop",
      },
    });
    amountGroup.add(
      createSpinRow(settings, {
        key: "flakes-limit",
        title: "Snowflakes limit",
        subtitle: "Maximal snowflakes number on screen",
        bounds: { lower: 0, upper: 500, step: 5 },
      }),
    );

    const animationGroup = addPage(
      window,
      "Animation",
      "media-skip-forward-symbolic",
    );
    addRangeRows(settings, animationGroup, {
      bounds: { lower: 0, upper: 60_000, step: 100 },
      minimum: {
        key: "min-fall-duration",
        title: "Minimal fall duration",
        subtitle: "Minimal snowflakes falling duration (in ms, 1s = 1000ms)",
      },
      maximum: {
        key: "max-fall-duration",
        title: "Maximal fall duration",
        subtitle: "Maximal snowflakes falling duration (in ms, 1s = 1000ms)",
      },
    });
    animationGroup.add(
      createSpinRow(settings, {
        key: "interval",
        title: "Fall interval",
        subtitle: "Interval between falling (in ms, 1s = 1000ms)",
        bounds: { lower: 1_000, upper: 60_000, step: 100 },
      }),
    );
  }
}
