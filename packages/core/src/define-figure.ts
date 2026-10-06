import { failure } from "./errors.js";
import { FREQUENCIES } from "./math.js";
import type { FigureDefinition, SignalName } from "./types.js";
export const SIGNALS: readonly SignalName[] = [
  "pointer.x",
  "pointer.y",
  "pointer.inside",
  "pointer.pressed",
  "focus",
  "key",
  "time",
];
/** Validate and freeze metadata. @example const cabinet = defineFigure(definition); */
export function defineFigure<const Name extends string>(
  d: FigureDefinition<Name>,
): FigureDefinition<Name> {
  if (
    !/^[a-z]+(?:-[a-z]+)*$/.test(d.name) ||
    !d.category?.trim() ||
    d.intents.length < 3 ||
    d.intents.some((i) => !i.trim()) ||
    d.mood.length < 1 ||
    d.mood.length > 3 ||
    !d.interaction?.trim() ||
    !d.a11y.label?.trim() ||
    typeof d.build !== "function" ||
    !["1:1", "4:3", "16:9", "3:4"].includes(d.aspect)
  ) {
    throw failure(
      3,
      "Incomplete figure metadata",
      "Supply an English kebab-case name, category, ≥3 intents, 1–3 moods, interaction, aspect, label, and build.",
    );
  }
  const b = d.bounds;
  if (![b.x, b.y, b.width, b.height].every(Number.isFinite) || b.width <= 0 || b.height <= 0) {
    throw failure(
      3,
      "Invalid projected bounds",
      "Provide finite bounds with positive width and height.",
    );
  }
  for (const p of Object.values(d.params)) {
    if (
      !SIGNALS.includes(p.input) ||
      (p.spring !== undefined && !(p.spring in FREQUENCIES)) ||
      (p.rest !== undefined && (!Number.isFinite(p.rest) || p.rest < 0 || p.rest > 1))
    ) {
      throw failure(
        3,
        "Invalid parameter mapping",
        "Use a supported signal, spring preset, and rest between 0 and 1.",
      );
    }
    Object.freeze(p);
  }
  Object.freeze(d.params);
  Object.freeze(d.bounds);
  Object.freeze(d.a11y);
  Object.freeze(d.intents);
  Object.freeze(d.mood);
  return Object.freeze(d);
}
