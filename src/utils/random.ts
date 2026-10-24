import type { Range } from "./settings.js";

export function randomInteger({ minimum, maximum }: Range) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

export function randomItem<T>(items: readonly T[]) {
  return items[randomInteger({ minimum: 0, maximum: items.length - 1 })];
}
