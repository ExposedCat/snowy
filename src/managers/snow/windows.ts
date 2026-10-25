import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import Meta from "gi://Meta";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import {
  CORNER_INSET,
  MAX_DEPTH,
  SnowPile,
  type WindowFrame,
} from "../../shell/pile.js";
import type { SnowSurface } from "../../shell/snowflake.js";
import type { SettingsManager } from "../../utils/settings.js";

type WindowSnow = {
  window: Meta.Window;
  signals: number[];
  frame?: WindowFrame;
  container?: Clutter.Actor;
  pile?: SnowPile;
  visible: boolean;
};

type Callbacks = {
  changed: () => void;
  release: (pile: SnowPile, container: Clutter.Actor) => void;
  clear: (container: Clutter.Actor) => void;
};

type Segment = {
  x: number;
  width: number;
};

export class SnowWindows {
  private windows = new Map<Meta.Window, WindowSnow>();
  private landingSurfaces: SnowSurface[] = [];
  private pending = 0;
  private focusSignal: number;
  private stackingSignal: number;
  private createdSignal: number;
  private workspaceSignal: number;
  private unsubscribe: () => void;

  constructor(
    private settingsManager: SettingsManager,
    private falling: Clutter.Actor,
    private callbacks: Callbacks,
  ) {
    this.focusSignal = global.display.connect("notify::focus-window", () =>
      this.refresh(),
    );
    this.stackingSignal = global.display.connect("restacked", () =>
      this.refresh(),
    );
    this.createdSignal = global.display.connect(
      "window-created",
      (_display, window) => {
        this.track(window);
        this.refresh();
      },
    );
    this.workspaceSignal = global.workspace_manager.connect(
      "active-workspace-changed",
      () => this.refresh(),
    );
    this.unsubscribe = settingsManager.subscribe((key) => {
      if (
        key === "avoid-active-window" ||
        key === "piles-on-windows" ||
        key === "pile-on-all-windows"
      )
        this.refresh();
    });
    this.refresh();
  }

  get surfaces(): readonly SnowSurface[] {
    return this.landingSurfaces;
  }

  refresh() {
    if (this.pending !== 0) return;
    this.pending = GLib.idle_add(GLib.PRIORITY_HIGH_IDLE, () => {
      this.pending = 0;
      this.synchronize();
      return GLib.SOURCE_REMOVE;
    });
  }

  dispose() {
    if (this.pending !== 0) GLib.Source.remove(this.pending);
    this.unsubscribe();
    global.display.disconnect(this.focusSignal);
    global.display.disconnect(this.stackingSignal);
    global.display.disconnect(this.createdSignal);
    global.workspace_manager.disconnect(this.workspaceSignal);
    for (const window of this.windows.keys()) this.untrack(window);
    this.landingSurfaces = [];
  }

  private track(window: Meta.Window) {
    if (
      !this.settingsManager.configuration.pilesOnWindows ||
      this.windows.has(window)
    )
      return;
    if (
      ![
        Meta.WindowType.NORMAL,
        Meta.WindowType.DIALOG,
        Meta.WindowType.MODAL_DIALOG,
        Meta.WindowType.UTILITY,
      ].includes(window.get_window_type())
    )
      return;
    const signals = [];
    for (const signal of [
      "position-changed",
      "size-changed",
      "shown",
      "workspace-changed",
      "notify::minimized",
      "notify::fullscreen",
    ]) {
      signals.push(window.connect(signal, () => this.refresh()));
    }
    signals.push(
      window.connect("unmanaged", () => {
        this.untrack(window);
        this.refresh();
      }),
    );
    this.windows.set(window, { window, signals, visible: false });
  }

  private untrack(window: Meta.Window) {
    const tracked = this.windows.get(window);
    if (!tracked) return;
    for (const signal of tracked.signals) window.disconnect(signal);
    this.clear(tracked);
    this.windows.delete(window);
  }

  private clear(tracked: WindowSnow) {
    if (tracked.container) {
      this.callbacks.clear(tracked.container);
      tracked.pile?.destroy();
      tracked.container.destroy();
    }
    tracked.pile = undefined;
    tracked.container = undefined;
  }

  private synchronize() {
    const configuration = this.settingsManager.configuration;
    if (configuration.pilesOnWindows) {
      for (const actor of global.get_window_actors())
        this.track(actor.meta_window);
    } else {
      for (const window of this.windows.keys()) this.untrack(window);
    }
    const ordered = global.display.sort_windows_by_stacking([
      ...this.windows.keys(),
    ]);
    for (const window of ordered) {
      const tracked = this.windows.get(window);
      if (!tracked) continue;
      const geometry = window.get_frame_rect();
      const frame = tracked.frame;
      if (
        !frame ||
        frame.x !== geometry.x ||
        frame.y !== geometry.y ||
        frame.width !== geometry.width
      ) {
        if (tracked.pile && tracked.container)
          this.callbacks.release(tracked.pile, tracked.container);
        tracked.frame = {
          x: geometry.x,
          y: geometry.y,
          width: geometry.width,
          height: geometry.height,
        };
        if (geometry.width > CORNER_INSET * 2)
          tracked.pile?.reset(tracked.frame);
        else this.clear(tracked);
      } else {
        frame.height = geometry.height;
      }
      tracked.visible = this.visible(window);
      if (window.is_fullscreen()) this.clear(tracked);
      if (tracked.container) {
        tracked.container.visible = tracked.visible;
        this.stackPile(tracked);
      }
    }
    this.landingSurfaces = [];
    for (const [index, window] of ordered.entries()) {
      const tracked = this.windows.get(window);
      const frame = tracked?.frame;
      if (!tracked || !frame) continue;
      if (
        !configuration.pileOnAllWindows &&
        window !== global.display.focus_window
      )
        continue;
      if (!this.eligible(tracked, frame)) continue;
      let segments = [
        { x: frame.x + CORNER_INSET, width: frame.width - CORNER_INSET * 2 },
      ];
      for (const higher of ordered.slice(index + 1)) {
        const coveringWindow = this.windows.get(higher);
        const covering = coveringWindow?.frame;
        if (
          !covering ||
          !coveringWindow.visible ||
          covering.y > frame.y ||
          covering.y + covering.height <= frame.y - MAX_DEPTH
        )
          continue;
        segments = this.subtract(segments, covering);
      }
      for (const segment of segments) {
        this.landingSurfaces.push({
          ...segment,
          top: (horizontal) => tracked.pile?.top(horizontal) ?? frame.y,
          deposit: (horizontal, size) => {
            if (tracked.frame !== frame || !this.windows.has(window)) return;
            if (!tracked.container) {
              tracked.container = new Clutter.Actor({ reactive: false });
              global.window_group.add_child(tracked.container);
            }
            if (!tracked.pile)
              tracked.pile = new SnowPile(tracked.container, frame);
            tracked.pile.deposit(horizontal, size);
            this.stackPile(tracked);
          },
        });
      }
    }
    this.stackFalling();
    this.callbacks.changed();
  }

  private visible(window: Meta.Window) {
    const actor = window.get_compositor_private();
    return (
      !window.minimized &&
      window.showing_on_its_workspace() &&
      window.located_on_workspace(
        global.workspace_manager.get_active_workspace(),
      ) &&
      actor instanceof Clutter.Actor &&
      actor.get_parent() === global.window_group
    );
  }

  private eligible(tracked: WindowSnow, frame: WindowFrame) {
    const window = tracked.window;
    const monitor = Main.layoutManager.monitors[window.get_monitor()];
    return (
      tracked.visible &&
      !window.is_fullscreen() &&
      frame.width > CORNER_INSET * 2 &&
      monitor !== undefined &&
      frame.y > Main.layoutManager.getWorkAreaForMonitor(monitor.index).y
    );
  }

  private subtract(segments: Segment[], covering: WindowFrame): Segment[] {
    const exposed = [];
    for (const segment of segments) {
      const end = segment.x + segment.width;
      const left = Math.max(segment.x, covering.x);
      const right = Math.min(end, covering.x + covering.width);
      if (right <= left) exposed.push(segment);
      else {
        if (left > segment.x)
          exposed.push({ x: segment.x, width: left - segment.x });
        if (right < end) exposed.push({ x: right, width: end - right });
      }
    }
    return exposed;
  }

  private stackPile(tracked: WindowSnow) {
    const actor = tracked.window.get_compositor_private();
    if (
      !tracked.container ||
      !(actor instanceof Clutter.Actor) ||
      actor.get_parent() !== global.window_group
    )
      return;
    const sibling =
      actor.get_previous_sibling() === this.falling ? this.falling : actor;
    if (sibling.get_previous_sibling() !== tracked.container)
      global.window_group.set_child_below_sibling(tracked.container, sibling);
  }

  private stackFalling() {
    if (!this.settingsManager.configuration.avoidActiveWindow) {
      if (global.window_group.get_last_child() !== this.falling)
        global.window_group.set_child_above_sibling(this.falling, null);
      return;
    }
    const actor = global.display.focus_window?.get_compositor_private();
    if (
      actor instanceof Clutter.Actor &&
      actor.get_parent() === global.window_group
    ) {
      if (actor.get_previous_sibling() !== this.falling)
        global.window_group.set_child_below_sibling(this.falling, actor);
    } else {
      const background = global.window_group
        .get_children()
        .find((child) => child !== this.falling);
      if (this.falling.get_previous_sibling() !== (background ?? null))
        global.window_group.set_child_above_sibling(
          this.falling,
          background ?? null,
        );
    }
  }
}
