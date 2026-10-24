import Clutter from "gi://Clutter";
import St from "gi://St";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import { randomInteger, randomItem } from "../utils/random.js";
import type { Configuration } from "../utils/settings.js";

const START_Y = -50;

type EaseParameters = {
  x: number;
  y: number;
  rotation_angle_z: number;
  duration: number;
  mode: Clutter.AnimationMode;
  onComplete: () => void;
};

type EasableLabel = St.Label & {
  ease: (parameters: EaseParameters) => void;
};

export type SnowingArea = {
  width: number;
  height: number;
};

export class Snowflake {
  private label: EasableLabel;

  constructor(
    private configuration: Configuration,
    private onLanded: (snowflake: Snowflake) => void,
  ) {
    this.label = new St.Label({
      text: randomItem(configuration.icons),
      style_class: "snowflake",
      style: `font-size: ${randomInteger(configuration.size)}px;`,
    }) as EasableLabel;
  }

  fall(area: SnowingArea) {
    const x = randomInteger({ minimum: 0, maximum: area.width });
    const direction = Math.random() < 0.5 ? -1 : 1;

    Main.layoutManager.uiGroup.add_child(this.label);
    this.label.set_position(x, START_Y);
    this.label.ease({
      x,
      y: area.height,
      rotation_angle_z:
        randomInteger(this.configuration.rotationAngle) * direction,
      duration: randomInteger(this.configuration.fallDuration),
      mode: Clutter.AnimationMode.LINEAR,
      onComplete: () => this.onLanded(this),
    });
  }

  destroy() {
    this.label.destroy();
  }
}
