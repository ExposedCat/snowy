import type Clutter from "gi://Clutter";
import St from "gi://St";

import type { SnowPosition, SnowSurface } from "./snowflake.js";

const CELL_WIDTH = 8;
const MAX_DEPTH = 24;

export type WindowFrame = SnowPosition & {
  width: number;
  height: number;
};

export class SnowPile {
  private drawing: St.DrawingArea;
  private depths: number[];

  constructor(
    container: Clutter.Actor,
    private geometry: WindowFrame,
  ) {
    this.depths = [];
    this.drawing = new St.DrawingArea({ reactive: false });
    this.drawing.connect("repaint", () => this.paint());
    container.add_child(this.drawing);
    this.reset(geometry);
  }

  get frame() {
    return this.geometry;
  }

  reset(frame: WindowFrame) {
    this.geometry = frame;
    this.depths = Array.from(
      { length: Math.ceil(frame.width / CELL_WIDTH) },
      () => 0,
    );
    this.drawing.set_size(frame.width, MAX_DEPTH);
    this.drawing.set_position(frame.x, frame.y - MAX_DEPTH);
    this.drawing.queue_repaint();
  }

  get surface(): SnowSurface {
    return {
      x: this.frame.x,
      width: this.frame.width,
      top: (horizontal) =>
        this.frame.y - (this.depths[this.cell(horizontal)] ?? 0),
    };
  }

  deposit(horizontal: number, size: number) {
    const center = this.cell(horizontal);
    const radius = Math.max(1, Math.ceil(size / CELL_WIDTH));
    for (
      let index = Math.max(0, center - radius);
      index <= Math.min(this.depths.length - 1, center + radius);
      index++
    ) {
      const distance = Math.abs(index - center) / (radius + 1);
      this.depths[index] = Math.min(
        MAX_DEPTH,
        this.depths[index] + (1 - distance) * Math.min(4, size / 6),
      );
    }
    this.drawing.queue_repaint();
  }

  release(limit: number): SnowPosition[] {
    const occupied = this.depths
      .map((depth, index) => ({ depth, index }))
      .filter(({ depth }) => depth > 0);
    const count = Math.min(limit, occupied.length);
    return Array.from({ length: count }, (_, index) => {
      const { depth, index: cell } =
        occupied[Math.floor((index * occupied.length) / count)];
      return {
        x: this.frame.x + (cell + 0.5) * CELL_WIDTH,
        y: this.frame.y - depth,
      };
    });
  }

  destroy() {
    this.drawing.destroy();
  }

  private cell(horizontal: number) {
    return Math.floor((horizontal - this.frame.x) / CELL_WIDTH);
  }

  private paint() {
    const context = this.drawing.get_context();
    try {
      context.setSourceRGBA(1, 1, 1, 1);
      context.moveTo(0, MAX_DEPTH);
      for (const [index, depth] of this.depths.entries()) {
        context.lineTo(index * CELL_WIDTH, MAX_DEPTH - depth);
      }
      context.lineTo(this.frame.width, MAX_DEPTH);
      context.closePath();
      context.fill();
    } finally {
      context.$dispose();
    }
  }
}
