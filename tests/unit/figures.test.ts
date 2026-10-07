import { describe, expect, it } from "vitest";
import { Projection } from "../../packages/core/src/projection.js";
import { Scene } from "../../packages/core/src/scene.js";
import { renderSVG } from "../../packages/core/src/svg.js";
import { FIGURES } from "../../packages/figures/src/index.js";

describe("original figure collection", () => {
  it("closed database layers hide the lower rear rim instead of drawing through it", () => {
    const scene = new Scene();
    FIGURES["db-stack"].build(scene, { intensity: 0.5, select: 0.5, inside: 0 });
    let rearRim = 0;
    for (let i = 0; i < scene.internalCount; i++) {
      const offset = i * 6,
        ax = scene.internalLines[offset] as number,
        ay = scene.internalLines[offset + 1] as number,
        bx = scene.internalLines[offset + 3] as number,
        by = scene.internalLines[offset + 4] as number;
      if (
        scene.internalLines[offset + 2] === 0.75 &&
        scene.internalLines[offset + 5] === 0.75 &&
        Math.abs(Math.hypot(ax, ay) - 2) < 0.001 &&
        Math.abs(Math.hypot(bx, by) - 2) < 0.001 &&
        (ax + ay + bx + by) / 2 < -1
      )
        rearRim++;
    }
    expect(rearRim).toBe(0);
  });
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
          const keys = Object.keys(figure.params);
          for (let pose = 0; pose <= 20 + 2 ** keys.length; pose++) {
            for (let k = 0; k < keys.length; k++)
              values[keys[k] as string] = pose <= 20 ? pose / 20 : ((pose - 21) >> k) & 1;
            s.internalReset();
            figure.build(s, values);
            p.internalRender(s);
            const first = p.internalPaths.join("");
            s.internalReset();
            figure.build(s, values);
            p.internalRender(s);
            expect(p.internalPaths.join("")).toBe(first);
            expect(s.internalCount).toBeGreaterThanOrEqual(60);
            expect(s.internalCount).toBeLessThanOrEqual(400);
            const b = figure.bounds;
            expect(p.internalMinX).toBeGreaterThanOrEqual(b.x + b.width * 0.08);
            expect(p.internalMaxX).toBeLessThanOrEqual(b.x + b.width * 0.92);
            expect(p.internalMinY).toBeGreaterThanOrEqual(b.y + b.height * 0.08);
            expect(p.internalMaxY).toBeLessThanOrEqual(b.y + b.height * 0.92);
            expect(
              [...s.internalTones.subarray(0, s.internalCount)].filter((t) => t === 4).length,
            ).toBeLessThanOrEqual(1);
          }
          expect(renderSVG(figure, intensity)).toContain(figure.a11y.label);
        }
      },
    );
  }
});
