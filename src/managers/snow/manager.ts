import GLib from "gi://GLib";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import { Snowflake, type SnowingArea } from "../../shell/snowflake.js";
import { randomInteger } from "../../utils/random.js";
import type { SettingsManager } from "../../utils/settings.js";

export class SnowManager {
  private timeout = 0;
  private snowflakes = new Set<Snowflake>();

  constructor(private settingsManager: SettingsManager) {
    this.schedule();
  }

  dispose() {
    GLib.Source.remove(this.timeout);
    for (const snowflake of this.snowflakes) {
      snowflake.destroy();
    }
    this.snowflakes.clear();
  }

  private schedule() {
    this.timeout = GLib.timeout_add(
      GLib.PRIORITY_DEFAULT,
      this.settingsManager.configuration.interval,
      () => {
        this.drop();
        this.schedule();
        return GLib.SOURCE_REMOVE;
      },
    );
  }

  private drop() {
    const configuration = this.settingsManager.configuration;
    if (configuration.icons.length === 0) return;

    const area = this.snowingArea();
    const count = Math.min(
      randomInteger(configuration.flakesPerDrop),
      configuration.flakesLimit - this.snowflakes.size,
    );
    for (let index = 0; index < count; index++) {
      const snowflake = new Snowflake(configuration, (landed) => {
        this.snowflakes.delete(landed);
        landed.destroy();
      });
      this.snowflakes.add(snowflake);
      snowflake.fall(area);
    }
  }

  private snowingArea(): SnowingArea {
    let width = 0;
    let height = 0;
    for (const monitor of Main.layoutManager.monitors) {
      width = Math.max(width, monitor.x + monitor.width);
      height = Math.max(height, monitor.y + monitor.height);
    }
    return { width, height };
  }
}
