import { describe, expect, it } from "vitest";
import { Projection } from "../../packages/core/src/projection.js";
import { Scene } from "../../packages/core/src/scene.js";
import { envelope } from "../../packages/figures/src/envelope.js";
import { gearTrain } from "../../packages/figures/src/gear-train.js";
import { face, line, panel, point, reset } from "../../packages/figures/src/internal/solid.js";
import { padlock } from "../../packages/figures/src/padlock.js";
import { pendulum } from "../../packages/figures/src/pendulum.js";

// Account for the original renderer's existing box plates before testing the new paper mask.
function coveredByExistingPlate(scene: Scene, x: number, y: number, z: number): boolean {
  const p = scene.internalPlates;
  for (let i = 0; i < scene.internalPlateCount; i++) {
    const k = i * 12,
      ax = (p[k + 3] as number) - (p[k] as number),
      ay = (p[k + 4] as number) - (p[k + 1] as number),
      az = (p[k + 5] as number) - (p[k + 2] as number),
      bx = (p[k + 9] as number) - (p[k] as number),
      by = (p[k + 10] as number) - (p[k + 1] as number),
      bz = (p[k + 11] as number) - (p[k + 2] as number),
      nx = ay * bz - az * by,
      ny = az * bx - ax * bz,
      nz = ax * by - ay * bx;
    const ray =
      (((p[k] as number) - x) * nx +
        ((p[k + 1] as number) - y) * ny +
        ((p[k + 2] as number) - z) * nz) /
      (nx + ny + nz);
    if (ray <= 0.0001) continue;
    const dx = x + ray - (p[k] as number),
      dy = y + ray - (p[k + 1] as number),
      dz = z + ray - (p[k + 2] as number),
      aa = ax * ax + ay * ay + az * az,
      bb = bx * bx + by * by + bz * bz,
      ab = ax * bx + ay * by + az * bz,
      qa = dx * ax + dy * ay + dz * az,
      qb = dx * bx + dy * by + dz * bz,
      d = aa * bb - ab * ab,
      u = (qa * bb - qb * ab) / d,
      v = (qb * aa - qa * ab) / d;
    if (u > 0.0001 && u < 0.9999 && v > 0.0001 && v < 0.9999) return true;
  }
  return false;
}

describe("opaque model surfaces", () => {
  it("gear response remains visibly distinct from rest at both input extremes", () => {
    const scene = new Scene(),
      projection = new Projection();
    const paths = [0, 0.5, 1].map((turn) => {
      scene.internalReset();
      gearTrain.build(scene, { turn, intensity: 1 });
      projection.internalRender(scene);
      return projection.internalPaths.join("");
    });
    expect(new Set(paths).size).toBe(3);
  });
  it("the padlock keeps its longer shackle leg connected while the shorter leg clears the case", () => {
    const scene = new Scene();
    padlock.build(scene, { open: 1, intensity: 1 });
    let retained = Infinity,
      released = Infinity;
    for (let i = 0; i < scene.internalCount; i++) {
      const k = i * 6;
      if (scene.internalLines[k + 1] !== 1 || scene.internalLines[k + 4] !== 1) continue;
      const ax = scene.internalLines[k] as number,
        bx = scene.internalLines[k + 3] as number;
      if (Math.abs(ax - bx) > 0.000001) continue;
      const bottom = Math.min(
        scene.internalLines[k + 2] as number,
        scene.internalLines[k + 5] as number,
      );
      if (Math.abs(ax - 2.75) < 0.000001) retained = Math.min(retained, bottom);
      if (Math.abs(ax - 0.25) < 0.000001) released = Math.min(released, bottom);
    }
    expect(retained).toBeLessThanOrEqual(3);
    expect(released).toBeCloseTo(3.5, 5);
  });
  it("the rear pendulum rod stays outside the front bearing face across its orbit", () => {
    const scene = new Scene();
    for (let pose = 0; pose <= 100; pose++) {
      scene.internalReset();
      pendulum.build(scene, { swing: pose / 100, intensity: 1 });
      let covered = 0;
      for (let i = 0; i < scene.internalCount; i++)
        for (const t of [0.01, 0.02, 0.05, 0.1, 0.5, 0.9]) {
          const k = i * 6,
            x =
              (scene.internalLines[k] as number) * (1 - t) +
              (scene.internalLines[k + 3] as number) * t,
            y =
              (scene.internalLines[k + 1] as number) * (1 - t) +
              (scene.internalLines[k + 4] as number) * t,
            z =
              (scene.internalLines[k + 2] as number) * (1 - t) +
              (scene.internalLines[k + 5] as number) * t,
            ray = 0.75 - y;
          if (
            ray > 0.0001 &&
            Math.hypot(x + ray, z + ray - 5.5) < 0.245 &&
            !coveredByExistingPlate(scene, x, y, z)
          )
            covered++;
        }
      expect(covered, `covered bearing contours at pose ${pose}`).toBe(0);
    }
  });
  it("a flap underside remains opaque when its top face points away from the camera", () => {
    const scene = new Scene();
    reset();
    panel(scene, [-1, -1, -2, 1, -1, -2, 1, 1, 2, -1, 1, 2], 0.25, 1, 0);
    point(0, -3, 0, 0);
    point(1, 3, 0, 0);
    line(scene, 0, 1, 1);
    expect(scene.internalCount).toBe(2);
    expect(scene.internalLines[3]).toBeCloseTo(-1.25, 5);
    expect(scene.internalLines[6]).toBeCloseTo(1, 5);
  });
  it("removes a hidden middle interval even when both endpoints are visible", () => {
    const scene = new Scene();
    reset();
    point(0, -1, 1, 1);
    point(1, 1, 1, 1);
    point(2, 1, 1, -1);
    point(3, -1, 1, -1);
    face(4);
    point(0, -3, 0, -1);
    point(1, 3, 0, -1);
    line(scene, 0, 1, 1);
    expect(scene.internalCount).toBe(2);
    expect(scene.internalLines[0]).toBe(-3);
    expect(scene.internalLines[3]).toBeCloseTo(-2, 5);
    expect(scene.internalLines[6]).toBeCloseTo(0, 5);
    expect(scene.internalLines[9]).toBe(3);
  });

  it("envelope contours never show through the swinging triangular paper flap", () => {
    const scene = new Scene();
    for (let pose = 0; pose <= 100; pose++) {
      const angle = (pose / 100) * 2.1,
        c = Math.cos(angle),
        s = Math.sin(angle);
      scene.internalReset();
      envelope.build(scene, { open: pose / 100, intensity: 1 });
      let covered = 0;
      for (let i = 0; i < scene.internalCount; i++)
        for (const fraction of [0.25, 0.5, 0.75]) {
          const k = i * 6,
            x =
              (scene.internalLines[k] as number) * (1 - fraction) +
              (scene.internalLines[k + 3] as number) * fraction,
            y =
              (scene.internalLines[k + 1] as number) * (1 - fraction) +
              (scene.internalLines[k + 4] as number) * fraction,
            z =
              (scene.internalLines[k + 2] as number) * (1 - fraction) +
              (scene.internalLines[k + 5] as number) * fraction;
          const ray = ((0.25 - y) * c + (3.5 - z) * s) / (c + s);
          if (ray <= 0.0001) continue;
          if (coveredByExistingPlate(scene, x, y, z)) continue;
          const depth = ((y + ray - 0.25) * s + (3.5 - z - ray) * c) / 2;
          if (depth > 0.001 && depth < 0.999 && Math.abs(x + ray) < 2.5 * (1 - depth) - 0.001)
            covered++;
        }
      expect(covered, `covered paper contours at pose ${pose}`).toBe(0);
    }
  });
});
