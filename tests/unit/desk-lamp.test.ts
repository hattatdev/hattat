import { describe, expect, it } from "vitest";
import { Scene } from "../../packages/core/src/scene.js";
import { deskLamp } from "../../packages/figures/src/desk-lamp.js";

interface Pivot {
  x: number;
  z: number;
  radius: number;
}

// Recover physical pivots from their emitted arcs rather than repeating build's formulas.
function pivots(scene: Scene): Pivot[] {
  const edges: number[][] = [],
    result: Pivot[] = [];
  for (let i = 0; i < scene.internalCount; i++) {
    const k = i * 6,
      p = scene.internalLines;
    if (p[k + 1] !== 0.25 || p[k + 4] !== 0.25 || scene.internalTones[i] !== 1) continue;
    const ax = p[k] as number,
      az = p[k + 2] as number,
      bx = p[k + 3] as number,
      bz = p[k + 5] as number;
    if (Math.hypot(ax - bx, az - bz) < 0.14) edges.push([ax, az, bx, bz]);
  }
  for (let i = 1; i < edges.length; i++) {
    const a = edges[i - 1] as number[],
      b = edges[i] as number[];
    if (Math.hypot((a[2] as number) - (b[0] as number), (a[3] as number) - (b[1] as number)) > 1e-6)
      continue;
    const ax = a[0] as number,
      az = a[1] as number,
      bx = a[2] as number,
      bz = a[3] as number,
      cx = b[2] as number,
      cz = b[3] as number,
      d = 2 * (ax * (bz - cz) + bx * (cz - az) + cx * (az - bz));
    if (Math.abs(d) < 1e-8) continue;
    const aa = ax * ax + az * az,
      bb = bx * bx + bz * bz,
      cc = cx * cx + cz * cz,
      x = (aa * (bz - cz) + bb * (cz - az) + cc * (az - bz)) / d,
      z = (aa * (cx - bx) + bb * (ax - cx) + cc * (bx - ax)) / d,
      radius = Math.hypot(ax - x, az - z);
    if (radius < 0.24 || radius > 0.51) continue;
    if (!result.some((p) => Math.hypot(p.x - x, p.z - z) < 1e-5)) result.push({ x, z, radius });
  }
  return result.sort((a, b) => a.z - b.z);
}

describe("desk lamp physical geometry", () => {
  it("both arms retain their physical length throughout the full input envelope", () => {
    const scene = new Scene();
    deskLamp.build(scene, { aim: 0.5, intensity: 0 });
    const resting = pivots(scene),
      base = resting[0] as Pivot,
      elbow = resting[1] as Pivot,
      head = resting[2] as Pivot,
      lowerLength = Math.hypot(elbow.x - base.x, elbow.z - base.z),
      upperLength = Math.hypot(head.x - elbow.x, head.z - elbow.z);
    for (const intensity of [0, 0.5, 1]) {
      for (let pose = 0; pose <= 100; pose++) {
        scene.internalReset();
        deskLamp.build(scene, { aim: pose / 100, intensity });
        const centers = pivots(scene);
        expect(centers, `visible physical pivots at ${intensity}/${pose}`).toHaveLength(3);
        const base = centers[0] as Pivot,
          elbow = centers[1] as Pivot,
          head = centers[2] as Pivot;
        expect(Math.hypot(elbow.x - base.x, elbow.z - base.z)).toBeCloseTo(lowerLength, 5);
        expect(Math.hypot(head.x - elbow.x, head.z - elbow.z)).toBeCloseTo(upperLength, 5);
      }
    }
    expect(lowerLength).toBeCloseTo(2.5, 5);
    expect(upperLength).toBeCloseTo(2.75, 5);
  });

  it("the opaque shade hides lines behind its cap and tapered shell", () => {
    const scene = new Scene();
    for (let pose = 0; pose <= 100; pose++) {
      scene.internalReset();
      deskLamp.build(scene, { aim: pose / 100, intensity: 1 });
      const head = pivots(scene)[2] as Pivot;
      for (let i = 0; i < scene.internalCount; i++) {
        const k = i * 6,
          p = scene.internalLines,
          x = ((p[k] as number) + (p[k + 3] as number)) / 2 - head.x - 0.75,
          y = ((p[k + 1] as number) + (p[k + 4] as number)) / 2,
          z = ((p[k + 2] as number) + (p[k + 5] as number)) / 2 - head.z,
          low = Math.max(1e-5, -1 - z),
          high = 0.25 - z;
        if (low >= high) continue;
        // An inset analytic cone lies strictly inside the faceted opaque shell.
        const radius = 1 - (z + 1) * 0.4 - 0.01,
          ray = Math.max(low, Math.min(high, -(x + y + radius * 0.4) / 1.84));
        expect(
          (x + ray) ** 2 + (y + ray) ** 2 - (radius - ray * 0.4) ** 2,
          `covered shade at ${pose}/${i}`,
        ).toBeGreaterThanOrEqual(-1e-6);
      }
    }
  });

  it("all opaque pivot faces hide covered line interiors in 101 poses", () => {
    const scene = new Scene();
    for (let pose = 0; pose <= 100; pose++) {
      scene.internalReset();
      deskLamp.build(scene, { aim: pose / 100, intensity: 1 });
      const centers = pivots(scene);
      expect(centers).toHaveLength(3);
      for (let i = 0; i < scene.internalCount; i++) {
        const k = i * 6,
          p = scene.internalLines;
        for (const t of [0.25, 0.5, 0.75]) {
          const x = (p[k] as number) * (1 - t) + (p[k + 3] as number) * t,
            y = (p[k + 1] as number) * (1 - t) + (p[k + 4] as number) * t,
            z = (p[k + 2] as number) * (1 - t) + (p[k + 5] as number) * t,
            ray = 0.25 - y;
          if (ray < 1e-5) continue;
          for (const center of centers)
            expect(
              Math.hypot(x + ray - center.x, z + ray - center.z),
              `covered pivot at ${pose}/${i}/${t}`,
            ).toBeGreaterThanOrEqual(center.radius * Math.cos(Math.PI / 24) - 1e-5);
        }
      }
    }
  });

  it("the head moves right with input and intensity zero preserves the resting geometry", () => {
    const scene = new Scene(),
      x: number[] = [];
    for (const aim of [0, 0.5, 1]) {
      scene.internalReset();
      deskLamp.build(scene, { aim, intensity: 1 });
      x.push((pivots(scene)[2] as Pivot).x);
    }
    expect(x[0]).toBeLessThan(x[1] as number);
    expect(x[1]).toBeLessThan(x[2] as number);
    scene.internalReset();
    deskLamp.build(scene, { aim: 0, intensity: 0 });
    const rest = Array.from(scene.internalLines.subarray(0, scene.internalCount * 6));
    scene.internalReset();
    deskLamp.build(scene, { aim: 1, intensity: 0 });
    expect(Array.from(scene.internalLines.subarray(0, scene.internalCount * 6))).toEqual(rest);
  });
});
