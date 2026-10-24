import type Gio from "gi://Gio";

export type Range = {
  minimum: number;
  maximum: number;
};

export type Configuration = {
  icons: string[];
  size: Range;
  rotationAngle: Range;
  fallDuration: Range;
  flakesPerDrop: Range;
  flakesLimit: number;
  interval: number;
};

export class SettingsManager {
  private settingsSignal: number;
  private _configuration: Configuration;

  constructor(private settings: Gio.Settings) {
    this._configuration = this.load();
    this.settingsSignal = settings.connect("changed", () => {
      this._configuration = this.load();
    });
  }

  get configuration() {
    return this._configuration;
  }

  dispose() {
    this.settings.disconnect(this.settingsSignal);
  }

  private load(): Configuration {
    return {
      icons: this.settings
        .get_string("flake-icons")
        .split(",")
        .map((icon) => icon.trim())
        .filter((icon) => icon.length > 0),
      size: this.range("min-size", "max-size"),
      rotationAngle: this.range("min-rotation-angle", "max-rotation-angle"),
      fallDuration: this.range("min-fall-duration", "max-fall-duration"),
      flakesPerDrop: this.range("min-flakes", "max-flakes"),
      flakesLimit: this.settings.get_int("flakes-limit"),
      interval: this.settings.get_int("interval"),
    };
  }

  private range(minimumKey: string, maximumKey: string): Range {
    const minimum = this.settings.get_int(minimumKey);
    const maximum = this.settings.get_int(maximumKey);
    return {
      minimum: Math.min(minimum, maximum),
      maximum: Math.max(minimum, maximum),
    };
  }
}
