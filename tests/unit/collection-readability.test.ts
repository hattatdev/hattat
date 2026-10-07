import { describe, expect, it } from "vitest";
import { Scene } from "../../packages/core/src/scene.js";
import { FIGURES } from "../../packages/figures/src/index.js";

function cross(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

describe("collection readability defects", () => {
  it("gear teeth do not intersect neighboring gears across their full rotation", () => {
    const scene = new Scene();
    for (let pose = 0; pose <= 100; pose++) {
      scene.internalReset();
      FIGURES["gear-train"].build(scene, { intensity: 1, turn: pose / 100 });
      const lines = scene.internalLines;
      let intersections = 0;
      for (let i = 0; i < scene.internalCount; i++) {
        const a = i * 6;
        if (lines[a + 2] !== 0.5 || lines[a + 5] !== 0.5) continue;
        const ax = lines[a] as number,
          ay = lines[a + 1] as number,
          bx = lines[a + 3] as number,
          by = lines[a + 4] as number;
        for (let j = i + 1; j < scene.internalCount; j++) {
          const b = j * 6;
          if (lines[b + 2] !== 0.5 || lines[b + 5] !== 0.5) continue;
          const cx = lines[b] as number,
            cy = lines[b + 1] as number,
            dx = lines[b + 3] as number,
            dy = lines[b + 4] as number;
          if (
            cross(ax, ay, bx, by, cx, cy) * cross(ax, ay, bx, by, dx, dy) < -1e-10 &&
            cross(cx, cy, dx, dy, ax, ay) * cross(cx, cy, dx, dy, bx, by) < -1e-10
          )
            intersections++;
        }
      }
      expect(intersections, `gear contour crossings at pose ${pose}`).toBe(0);
    }
  });

  it("turbine blade edges stay outside the opaque hub face", () => {
    const scene = new Scene();
    for (let pose = 0; pose <= 20; pose++) {
      scene.internalReset();
      FIGURES["wind-turbine"].build(scene, { intensity: 1, turn: pose / 20 });
      const lines = scene.internalLines;
      let covered = 0;
      for (let i = 0; i < scene.internalCount; i++) {
        const k = i * 6,
          x = ((lines[k] as number) + (lines[k + 3] as number)) / 2,
          y = ((lines[k + 1] as number) + (lines[k + 4] as number)) / 2,
          z = ((lines[k + 2] as number) + (lines[k + 5] as number)) / 2,
          ray = 1 - y;
        if (ray > 0.001 && Math.hypot(x + ray, z + ray - 5.5) < 0.48) covered++;
      }
      expect(covered, `covered hub contours at pose ${pose}`).toBe(0);
    }
  });

  it("turbine body contours do not pass through the front blade surfaces", () => {
    const scene = new Scene(),
      outline = [0.5, -0.25, 2.75, 0, 3, 0.25, 2.5, 0.5, 1, 0.5, 0.5, 0.25];
    for (let pose = 0; pose <= 20; pose++) {
      scene.internalReset();
      FIGURES["wind-turbine"].build(scene, { intensity: 1, turn: pose / 20 });
      const lines = scene.internalLines;
      let covered = 0;
      for (let i = 0; i < scene.internalCount; i++) {
        const k = i * 6,
          y = ((lines[k + 1] as number) + (lines[k + 4] as number)) / 2;
        if (y >= 1 - 0.001) continue;
        const x = ((lines[k] as number) + (lines[k + 3] as number)) / 2 + 1 - y,
          z = ((lines[k + 2] as number) + (lines[k + 5] as number)) / 2 + 1 - y - 5.5;
        for (let blade = 0; blade < 3; blade++) {
          const angle = (blade * Math.PI * 2) / 3 + (pose / 20 - 0.5) * Math.PI + Math.PI / 2,
            c = Math.cos(angle),
            s = Math.sin(angle),
            px = x * c + z * s,
            pz = -x * s + z * c;
          let inside = true;
          for (let edge = 0; edge < 6; edge++) {
            const a = edge * 2,
              b = ((edge + 1) % 6) * 2;
            if (
              cross(
                outline[a] as number,
                outline[a + 1] as number,
                outline[b] as number,
                outline[b + 1] as number,
                px,
                pz,
              ) < 0.001
            )
              inside = false;
          }
          if (inside) covered++;
        }
      }
      expect(covered, `body contours behind blades at pose ${pose}`).toBe(0);
    }
  });
});
