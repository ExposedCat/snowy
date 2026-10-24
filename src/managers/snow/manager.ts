import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import type Meta from "gi://Meta";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import { SnowPile, type WindowFrame } from "../../shell/pile.js";
import { type SnowPosition, Snowflake } from "../../shell/snowflake.js";
import { randomInteger } from "../../utils/random.js";
import type { SettingsManager } from "../../utils/settings.js";

export class SnowManager {
  private timeout = 0;
  private snowflakes = new Set<Snowflake>();
  private container = new Clutter.Actor({ reactive: false });
  private focusSignal: number;
  private stackingSignal: number;
  private monitorsSignal: number;
  private window?: Meta.Window;
  private windowSignals: number[] = [];
  private pile?: SnowPile;
  private unsubscribe: () => void;

  constructor(private settingsManager: SettingsManager) {
    global.window_group.add_child(this.container);
    this.unsubscribe = settingsManager.subscribe((key) => {
      if (key === "avoid-active-window") this.stack();
      else if (key === "piles-on-windows") this.updateWindow(true);
    });
    this.focusSignal = global.display.connect("notify::focus-window", () =>
      this.focus(),
    );
    this.stackingSignal = global.display.connect("restacked", () =>
      this.stack(),
    );
    this.monitorsSignal = Main.layoutManager.connect("monitors-changed", () => {
      this.clear();
      this.updateWindow(true);
    });
    this.focus();
    this.schedule();
  }

  dispose() {
    if (this.timeout !== 0) GLib.Source.remove(this.timeout);
    this.unsubscribe();
    global.display.disconnect(this.focusSignal);
    global.display.disconnect(this.stackingSignal);
    Main.layoutManager.disconnect(this.monitorsSignal);
    this.disconnectWindow();
    this.clear();
    this.container.destroy();
  }

  private focus() {
    this.disconnectWindow();
    this.releasePile();
    this.window = global.display.focus_window ?? undefined;
    if (this.window) {
      for (const signal of [
        "position-changed",
        "size-changed",
        "notify::fullscreen",
        "notify::minimized",
      ]) {
        this.windowSignals.push(
          this.window.connect(signal, () => this.updateWindow()),
        );
      }
      this.windowSignals.push(
        this.window.connect("unmanaged", () => {
          this.disconnectWindow();
          this.updateWindow(true);
        }),
      );
    }
    this.updateWindow(true);
  }

  private disconnectWindow() {
    for (const signal of this.windowSignals) this.window?.disconnect(signal);
    this.windowSignals = [];
    this.window = undefined;
  }

  private stack() {
    if (!this.settingsManager.configuration.avoidActiveWindow) {
      if (global.window_group.get_last_child() !== this.container) {
        global.window_group.set_child_above_sibling(this.container, null);
      }
      return;
    }
    const actor = this.window?.get_compositor_private();
    if (
      actor instanceof Clutter.Actor &&
      actor.get_parent() === global.window_group
    ) {
      if (actor.get_previous_sibling() !== this.container) {
        global.window_group.set_child_below_sibling(this.container, actor);
      }
    } else {
      const background = global.window_group
        .get_children()
        .find((child) => child !== this.container);
      if (this.container.get_previous_sibling() !== (background ?? null)) {
        global.window_group.set_child_above_sibling(
          this.container,
          background ?? null,
        );
      }
    }
  }

  private updateWindow(force = false) {
    this.stack();
    const frame = this.landingFrame();
    if (!force && this.sameFrame(frame)) return;
    this.releasePile(frame === undefined);
    if (frame) {
      if (this.pile) this.pile.reset(frame);
      else this.pile = new SnowPile(this.container, frame);
    }
    for (const snowflake of this.snowflakes) snowflake.fall(this.pile?.surface);
  }

  private landingFrame(): WindowFrame | undefined {
    if (
      !this.settingsManager.configuration.pilesOnWindows ||
      !this.window ||
      this.window.is_fullscreen() ||
      this.window.minimized ||
      !this.window.showing_on_its_workspace()
    ) {
      return undefined;
    }
    const frame = this.window.get_frame_rect();
    const monitor = Main.layoutManager.monitors[this.window.get_monitor()];
    if (
      !monitor ||
      frame.width <= 0 ||
      frame.y <= Main.layoutManager.getWorkAreaForMonitor(monitor.index).y
    ) {
      return undefined;
    }
    return { x: frame.x, y: frame.y, width: frame.width, height: frame.height };
  }

  private sameFrame(frame?: WindowFrame) {
    const previous = this.pile?.frame;
    return (
      previous?.x === frame?.x &&
      previous?.y === frame?.y &&
      previous?.width === frame?.width &&
      previous?.height === frame?.height
    );
  }

  private releasePile(discard = true) {
    if (!this.pile) return;
    const configuration = this.settingsManager.configuration;
    const positions = this.pile.release(
      Math.min(
        32,
        Math.max(0, configuration.flakesLimit - this.snowflakes.size),
      ),
    );
    if (discard) {
      this.pile.destroy();
      this.pile = undefined;
    }
    if (configuration.icons.length === 0) return;
    for (const position of positions) {
      const monitor = Main.layoutManager.monitors.find(
        (monitor) =>
          position.x >= monitor.x &&
          position.x < monitor.x + monitor.width &&
          position.y >= monitor.y &&
          position.y < monitor.y + monitor.height,
      );
      if (monitor) this.spawn(position, monitor.y + monitor.height, false);
    }
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
          this.spawn(
            {
              x: monitor.x + horizontal,
              y: monitor.y - configuration.size.maximum * 2,
            },
            monitor.y + monitor.height,
            true,
          );
          break;
        }
        horizontal -= monitor.width;
      }
    }
  }

  private spawn(position: SnowPosition, bottom: number, accumulate: boolean) {
    const snowflake = new Snowflake(
      this.container,
      this.settingsManager.configuration,
      position,
      bottom,
      accumulate,
      (landed, accumulated) => {
        if (accumulated) this.pile?.deposit(landed.center, landed.size);
        this.snowflakes.delete(landed);
        landed.destroy();
      },
    );
    this.snowflakes.add(snowflake);
    snowflake.fall(this.pile?.surface);
  }

  private clear() {
    this.pile?.destroy();
    this.pile = undefined;
    for (const snowflake of this.snowflakes) snowflake.destroy();
    this.snowflakes.clear();
  }
}
