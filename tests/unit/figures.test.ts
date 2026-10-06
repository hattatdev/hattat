import { describe, expect, it } from "vitest";
import { Projection } from "../../packages/core/src/projection.js";
import { Scene } from "../../packages/core/src/scene.js";
import { renderSVG } from "../../packages/core/src/svg.js";
import { FIGURES } from "../../packages/figures/src/index.js";

describe("original Phase 1 figures", () => {
  for (const figure of Object.values(FIGURES)) {
    it(
      figure.name +
        " is deterministic, recognizable in metadata, and padded across its interaction envelope",
      () => {
        const s = new Scene(),
          p = new Projection(),
          values: Record<string, number> = { intensity: 0 };
        for (const intensity of [0, 0.5, 1]) {
          values.intensity = intensity;
          for (let pose = 0; pose <= 20; pose++) {
            for (const key of Object.keys(figure.params)) values[key] = pose / 20;
            s.reset();
            figure.build(s, values);
            p.render(s);
            const first = p.paths.join("");
            s.reset();
            figure.build(s, values);
            p.render(s);
            expect(p.paths.join("")).toBe(first);
            expect(s.count).toBeGreaterThanOrEqual(60);
            expect(s.count).toBeLessThanOrEqual(400);
            const b = figure.bounds;
            expect(p.minX).toBeGreaterThanOrEqual(b.x + b.width * 0.08);
            expect(p.maxX).toBeLessThanOrEqual(b.x + b.width * 0.92);
            expect(p.minY).toBeGreaterThanOrEqual(b.y + b.height * 0.08);
            expect(p.maxY).toBeLessThanOrEqual(b.y + b.height * 0.92);
            expect(
              [...s.tones.subarray(0, s.count)].filter((t) => t === 4).length,
            ).toBeLessThanOrEqual(1);
          }
          expect(renderSVG(figure, intensity)).toContain(figure.a11y.label);
        }
      },
    );
  }
});
