import Clutter from "gi://Clutter";
import St from "gi://St";

import { randomInteger, randomItem } from "../utils/random.js";
import type { Configuration } from "../utils/settings.js";

export type SnowPosition = {
  x: number;
  y: number;
};

export type SnowSurface = {
  x: number;
  width: number;
  top: (horizontal: number) => number;
};

type EaseParameters = {
  translation_y: number;
  rotation_angle_z: number;
  duration: number;
  mode: Clutter.AnimationMode;
  onComplete: () => void;
};

type AnimatedLabel = St.Label & {
  ease: (parameters: EaseParameters) => void;
};

export class Snowflake {
  private label: AnimatedLabel;
  private speed: number;
  private rotation: number;
  private height: number;
  private destination?: number;
  private accumulating = false;
  readonly center: number;
  readonly size: number;

  constructor(
    container: Clutter.Actor,
    configuration: Configuration,
    private position: SnowPosition,
    private bottom: number,
    private accumulates: boolean,
    private onLanded: (snowflake: Snowflake, accumulated: boolean) => void,
  ) {
    this.size = randomInteger(configuration.size);
    this.label = new St.Label({
      text: randomItem(configuration.icons),
      style_class: "snowflake",
      style: `font-size: ${this.size}px;`,
      reactive: false,
    }) as AnimatedLabel;
    container.add_child(this.label);
    this.label.set_position(position.x, position.y);
    this.label.set_pivot_point(0.5, 0.5);
    const [, , width, height] = this.label.get_preferred_size();
    this.height = height;
    this.center = position.x + width / 2;
    this.speed =
      (bottom - position.y) /
      Math.max(1, randomInteger(configuration.fallDuration));
    this.rotation =
      randomInteger(configuration.rotationAngle) *
      (Math.random() < 0.5 ? -1 : 1);
  }

  fall(surface?: SnowSurface) {
    const current = this.position.y + this.label.translation_y;
    const surfaceTop = surface?.top(this.center);
    const accumulated =
      this.accumulates &&
      surface !== undefined &&
      surfaceTop !== undefined &&
      this.center >= surface.x &&
      this.center < surface.x + surface.width &&
      current + this.height <= surfaceTop;
    const destination = accumulated ? surfaceTop - this.height : this.bottom;
    if (destination === this.destination && accumulated === this.accumulating) {
      return;
    }
    this.destination = destination;
    this.accumulating = accumulated;
    this.label.remove_all_transitions();
    this.label.ease({
      translation_y: destination - this.position.y,
      rotation_angle_z: this.rotation,
      duration: Math.max(1, Math.round((destination - current) / this.speed)),
      mode: Clutter.AnimationMode.LINEAR,
      onComplete: () => this.onLanded(this, accumulated),
    });
  }

  destroy() {
    this.label.remove_all_transitions();
    this.label.destroy();
  }
}
