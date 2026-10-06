import { failure } from "./errors.js";
import { Projection } from "./projection.js";
import { Scene, TONES } from "./scene.js";
import type { FigureDefinition, Theme } from "./types.js";

export const LIGHT: Required<Theme> = {
  plate: "#ffffff",
  hi: "#111827",
  edge: "#374151",
  mid: "#667085",
  lo: "#9ca3af",
  accent: "#2563eb",
  stroke: 1,
};
export const DARK: Required<Theme> = {
  plate: "#111827",
  hi: "#f9fafb",
  edge: "#d1d5db",
  mid: "#9ca3af",
  lo: "#667085",
  accent: "#60a5fa",
  stroke: 1,
};
export function escapeText(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
/** Deterministic, DOM-free resting SVG. @example const html = renderSVG(padlock); */
export function renderSVG(
  figure: FigureDefinition,
  intensity = 0.5,
  label = figure.a11y.label,
): string {
  const scene = new Scene(),
    projection = new Projection();
  const params: Record<string, number> = { intensity };
  for (const [name, p] of Object.entries(figure.params)) params[name] = p.rest ?? 0.5;
  figure.build(scene, params);
  if (scene.internalCount > 400)
    throw failure(4, "SVG exceeds 400 segments", "Use fewer segments.");
  projection.internalRender(scene, false);
  return markup(figure, label, projection);
}
export function markup(figure: FigureDefinition, label: string, projection: Projection): string {
  const b = figure.bounds;
  let result = `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeText(label)}" viewBox="${b.x} ${b.y} ${b.width} ${b.height}" style="width:100%;height:100%;aspect-ratio:${figure.aspect.replace(":", "/")}"><path fill="var(--hattat-plate,${LIGHT.plate})" d="${projection.internalPlatePath}"/>`;
  for (let i = 0; i < TONES.length; i++) {
    const tone = TONES[i] as keyof typeof LIGHT;
    result += `<path fill="none" stroke="var(--hattat-${tone},${LIGHT[tone]})" stroke-width="var(--hattat-stroke,1)" vector-effect="non-scaling-stroke" d="${projection.internalPaths[i]}"/>`;
  }
  return `${result}</svg>`;
}
