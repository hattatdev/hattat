import { SIGNALS } from "./define-figure.js";
import { failure } from "./errors.js";
import type { FigureDefinition, FigureOptions, SignalName, Theme } from "./types.js";
export interface Options {
  intensity: number;
  input: FigureOptions["input"];
  renderer: "svg" | "auto";
  theme: Theme;
  autoplay: boolean;
  motion: "auto" | "reduce" | "full";
  label: string;
  interactive: boolean;
}
/** Validate options before changing any mounted state. */
export function normalize(figure: FigureDefinition, options: FigureOptions): Options {
  const intensity = options.intensity ?? 0.5;
  if (!Number.isFinite(intensity) || intensity < 0 || intensity > 1)
    throw failure(2, "Invalid intensity", "Use a finite number between 0 and 1.");
  if (options.renderer !== undefined && !["auto", "svg"].includes(options.renderer))
    throw failure(
      2,
      "Unsupported renderer",
      "Phase 1 supports svg or auto; Canvas is a later phase.",
    );
  if (options.motion !== undefined && !["auto", "reduce", "full"].includes(options.motion))
    throw failure(2, "Unsupported motion", "Use auto, reduce, or full.");
  for (const key of ["autoplay", "interactive"] as const)
    if (options[key] !== undefined && typeof options[key] !== "boolean")
      throw failure(2, "Invalid boolean option", "Use a boolean for autoplay and interactive.");
  const theme = options.theme === undefined || options.theme === "mono" ? {} : options.theme;
  if (!theme || typeof theme !== "object" || Array.isArray(theme))
    throw failure(2, "Unsupported theme", "Use mono or a theme object in Phase 1.");
  for (const [key, value] of Object.entries(theme)) {
    if (key === "stroke") {
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
        throw failure(2, "Invalid stroke", "Use a positive CSS pixel width.");
    } else if (
      !["plate", "hi", "edge", "mid", "lo", "accent"].includes(key) ||
      typeof value !== "string" ||
      !value.trim() ||
      /[;{}<>]|url\s*\(/i.test(value)
    ) {
      throw failure(
        2,
        "Invalid theme token",
        "Use supported color tokens with CSS color values, without URLs or markup.",
      );
    }
  }
  if (options.label !== undefined && (typeof options.label !== "string" || !options.label.trim()))
    throw failure(2, "Invalid accessibility label", "Use a meaningful nonempty string.");
  const input = options.input;
  if (typeof input === "string") {
    if (input !== "pointer" && !SIGNALS.includes(input as SignalName))
      throw failure(2, "Unsupported input", "Use a Phase 1 pointer, focus, key, or time signal.");
  } else if (input !== undefined) {
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw failure(2, "Invalid input mapping", "Map figure parameters to supported signal names.");
    for (const [name, signal] of Object.entries(input))
      if (!(name in figure.params) || !SIGNALS.includes(signal))
        throw failure(
          2,
          "Invalid input mapping",
          "Use existing figure parameter names and Phase 1 signals.",
        );
  }
  return {
    intensity,
    input,
    renderer: options.renderer === "svg" ? "svg" : "auto",
    theme,
    autoplay: options.autoplay ?? false,
    motion: options.motion ?? "auto",
    label: options.label ?? figure.a11y.label,
    interactive: options.interactive ?? true,
  };
}
