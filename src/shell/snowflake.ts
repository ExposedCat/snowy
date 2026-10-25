import Clutter from "gi://Clutter";
import St from "gi://St";

import { randomInteger, randomItem } from "../utils/random.js";
import type { Configuration } from "../utils/settings.js";

const BURST_GRAVITY = 600;

export type SnowPosition = {
  x: number;
  y: number;
};

export type SnowSurface = {
  x: number;
  width: number;
  top: (horizontal: number) => number;
  deposit: (horizontal: number, size: number) => void;
};

type EaseParameters = {
  translation_x?: number;
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
  private width: number;
  private height: number;
  private destination?: number;
  private surface?: SnowSurface;
  private bursting = false;
  readonly size: number;

  constructor(
    container: Clutter.Actor,
    configuration: Configuration,
    private position: SnowPosition,
    private bottom: number,
    private onLanded: (snowflake: Snowflake, surface?: SnowSurface) => void,
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
    this.width = width;
    this.height = height;
    this.speed =
      Math.max(1, bottom - position.y) /
      Math.max(1, randomInteger(configuration.fallDuration));
    this.rotation =
      randomInteger(configuration.rotationAngle) *
      (Math.random() < 0.5 ? -1 : 1);
  }

  get center() {
    return this.position.x + this.label.translation_x + this.width / 2;
  }

  fall(surfaces: readonly SnowSurface[]) {
    if (this.bursting) return;
    const current = this.position.y + this.label.translation_y;
    const horizontal = this.center;
    let destination = this.bottom;
    this.surface = undefined;
    for (const surface of surfaces) {
      if (
        horizontal - this.width / 2 < surface.x ||
        horizontal + this.width / 2 > surface.x + surface.width
      ) {
        continue;
      }
      const top = surface.top(horizontal) - this.height;
      if (top >= current && top < destination) {
        destination = top;
        this.surface = surface;
      }
    }
    if (destination === this.destination) return;
    this.destination = destination;
    this.label.remove_all_transitions();
    this.label.ease({
      translation_y: destination - this.position.y,
      rotation_angle_z: this.rotation,
      duration: Math.max(1, Math.round((destination - current) / this.speed)),
      mode: Clutter.AnimationMode.LINEAR,
      onComplete: () => this.onLanded(this, this.surface),
    });
  }

  burst(center: number) {
    this.bursting = true;
    this.surface = undefined;
    const direction = this.center < center ? -1 : 1;
    const spread = direction * randomInteger({ minimum: 30, maximum: 90 });
    const lift = randomInteger({ minimum: 24, maximum: 60 });
    const duration = randomInteger({ minimum: 180, maximum: 320 });
    this.label.ease({
      translation_x: spread,
      translation_y: -lift,
      rotation_angle_z: this.rotation,
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_QUAD,
      onComplete: () => {
        this.label.ease({
          translation_x: spread * 2.5,
          translation_y: this.bottom - this.position.y,
          rotation_angle_z: this.rotation * 3,
          duration: Math.max(
            300,
            Math.round(
              Math.sqrt(
                (2 * Math.max(0, this.bottom - this.position.y + lift)) /
                  BURST_GRAVITY,
              ) * 1000,
            ),
          ),
          mode: Clutter.AnimationMode.EASE_IN_QUAD,
          onComplete: () => this.onLanded(this),
        });
      },
    });
  }

  destroy() {
    this.label.remove_all_transitions();
    this.label.destroy();
  }
}
