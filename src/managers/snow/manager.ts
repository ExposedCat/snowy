import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import type { SnowPile } from "../../shell/pile.js";
import { type SnowPosition, Snowflake } from "../../shell/snowflake.js";
import { randomInteger } from "../../utils/random.js";
import type { SettingsManager } from "../../utils/settings.js";
import { SnowWindows } from "./windows.js";

export class SnowManager {
  private timeout = 0;
  private snowflakes = new Set<Snowflake>();
  private fragments = new Map<Clutter.Actor, Set<Snowflake>>();
  private container = new Clutter.Actor({ reactive: false });
  private windows: SnowWindows;
  private monitorsSignal: number;

  constructor(private settingsManager: SettingsManager) {
    global.window_group.add_child(this.container);
    this.windows = new SnowWindows(settingsManager, this.container, {
      changed: () => {
        for (const snowflake of this.snowflakes)
          snowflake.fall(this.windows.surfaces);
      },
      release: (pile, container) => this.release(pile, container),
      clear: (container) => this.clearFragments(container),
    });
    this.monitorsSignal = Main.layoutManager.connect("monitors-changed", () => {
      for (const snowflake of this.snowflakes) snowflake.destroy();
      this.snowflakes.clear();
      this.fragments.clear();
      this.windows.refresh();
    });
    this.schedule();
  }

  dispose() {
    if (this.timeout !== 0) GLib.Source.remove(this.timeout);
    Main.layoutManager.disconnect(this.monitorsSignal);
    this.windows.dispose();
    for (const snowflake of this.snowflakes) snowflake.destroy();
    this.snowflakes.clear();
    this.fragments.clear();
    this.container.destroy();
  }

  private release(pile: SnowPile, container: Clutter.Actor) {
    const configuration = this.settingsManager.configuration;
    if (configuration.icons.length === 0) return;
    const positions = pile.release(
      Math.min(
        32,
        Math.max(0, configuration.flakesLimit - this.snowflakes.size),
      ),
    );
    for (const position of positions) {
      const monitor = Main.layoutManager.monitors.find(
        (monitor) =>
          position.x >= monitor.x &&
          position.x < monitor.x + monitor.width &&
          position.y >= monitor.y &&
          position.y < monitor.y + monitor.height,
      );
      if (!monitor) continue;
      const snowflake = this.spawn(
        position,
        monitor.y + monitor.height,
        container,
      );
      let fragments = this.fragments.get(container);
      if (!fragments) {
        fragments = new Set();
        this.fragments.set(container, fragments);
      }
      fragments.add(snowflake);
      snowflake.burst(pile.frame.x + pile.frame.width / 2);
    }
  }

  private clearFragments(container: Clutter.Actor) {
    for (const snowflake of this.fragments.get(container) ?? []) {
      this.snowflakes.delete(snowflake);
      snowflake.destroy();
    }
    this.fragments.delete(container);
  }

  private schedule() {
    this.timeout = GLib.timeout_add(
      GLib.PRIORITY_DEFAULT,
      Math.max(100, this.settingsManager.configuration.interval),
      () => {
        this.drop();
        this.schedule();
        return GLib.SOURCE_REMOVE;
      },
    );
  }

  private drop() {
    const configuration = this.settingsManager.configuration;
    if (configuration.icons.length === 0 || !global.window_group.visible)
      return;
    const monitors = Main.layoutManager.monitors.filter(
      (monitor) => !global.display.get_monitor_in_fullscreen(monitor.index),
    );
    const width = monitors.reduce((total, monitor) => total + monitor.width, 0);
    if (width <= 0) return;
    const count = Math.min(
      randomInteger(configuration.flakesPerDrop),
      configuration.flakesLimit - this.snowflakes.size,
    );
    for (let index = 0; index < count; index++) {
      let horizontal = randomInteger({ minimum: 0, maximum: width - 1 });
      for (const monitor of monitors) {
        if (horizontal < monitor.width) {
          const snowflake = this.spawn(
            {
              x: monitor.x + horizontal,
              y: monitor.y - configuration.size.maximum * 2,
            },
            monitor.y + monitor.height,
            this.container,
          );
          snowflake.fall(this.windows.surfaces);
          break;
        }
        horizontal -= monitor.width;
      }
    }
  }

  private spawn(
    position: SnowPosition,
    bottom: number,
    container: Clutter.Actor,
  ) {
    const snowflake = new Snowflake(
      container,
      this.settingsManager.configuration,
      position,
      bottom,
      (landed, surface) => {
        surface?.deposit(landed.center, landed.size);
        this.snowflakes.delete(landed);
        const fragments = this.fragments.get(container);
        fragments?.delete(landed);
        if (fragments?.size === 0) this.fragments.delete(container);
        landed.destroy();
      },
    );
    this.snowflakes.add(snowflake);
    return snowflake;
  }
}
