import { describe, expect, it } from "vitest";
import { defineFigure } from "../../packages/core/src/define-figure.js";
import { advance, COS_30, project } from "../../packages/core/src/math.js";
import { Projection } from "../../packages/core/src/projection.js";
import { Scene } from "../../packages/core/src/scene.js";
import { renderSVG } from "../../packages/core/src/svg.js";
import type { FigureDefinition, Vec3 } from "../../packages/core/src/types.js";

const ORIGIN: Vec3 = [0, 0, 0];
const FIGURE: FigureDefinition = {
  name: "test-cabinet",
  category: "objects",
  intents: ["archive", "storage", "files"],
  mood: ["calm"],
  interaction: "The pointer lifts the cabinet.",
  aspect: "1:1",
  a11y: { label: "A cabinet" },
  params: { open: { input: "pointer.y" } },
  bounds: { x: -3, y: -3, width: 6, height: 6 },
  build(ctx) {
    ctx.box(ORIGIN, [1, 1, 1]);
  },
};

describe("isometric projection and critical damping", () => {
  it("projects all three axes at the specified angles", () => {
    const out = new Float64Array(2);
    project([1, 0, 0], out);
    expect([...out]).toEqual([COS_30, 0.5]);
    project([0, 1, 0], out);
    expect([...out]).toEqual([-COS_30, 0.5]);
    project([0, 0, 1], out);
    expect([...out]).toEqual([0, -1]);
    project([], out);
    expect([...out]).toEqual([0, 0]);
  });
  it("converges in less than 1.5 seconds at different refresh rates without overshoot", () => {
    for (const hz of [30, 60, 120]) {
      const s = { value: 0, velocity: 0, target: 1, frequency: 10 };
      for (let i = 0; i < hz * 1.5; i++) {
        advance(s, 1 / hz);
        expect(s.value).toBeLessThanOrEqual(1);
      }
      expect(advance(s, 1 / hz)).toBe(false);
      expect(s.value).toBe(1);
    }
  });
  it("clamps negative deltas and tab-resumption gaps", () => {
    const s = { value: 0, velocity: 0, target: 1, frequency: 18 };
    advance(s, -10);
    expect(s.value).toBe(0);
    advance(s, 100);
    expect(s.value).toBeGreaterThan(0);
    expect(s.value).toBeLessThan(1);
  });
});
describe("scene helpers and hidden lines", () => {
  it("reuses buffers and seeded randomness across resets", () => {
    const s = new Scene(),
      lines = s.internalLines;
    const random = s.random();
    s.box(ORIGIN, [1, 1, 1]);
    expect(s.internalCount).toBe(12);
    expect(s.internalPlateCount).toBe(3);
    s.internalReset();
    expect(s.internalLines).toBe(lines);
    expect(s.internalCount).toBe(0);
    expect(s.random()).toBe(random);
  });
  it("supports line, closed outline, extrusion, cylinder, grid, arc and curve geometry", () => {
    const s = new Scene();
    const points: Vec3[] = [
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
    ];
    s.polyline(points, { tone: "hi" }, true);
    expect(s.internalCount).toBe(3);
    s.prism(points, 1);
    expect(s.internalCount).toBe(12);
    s.cylinder(ORIGIN, 1, 1, { tone: "mid" }, 8);
    expect(s.internalCount).toBe(30);
    s.grid(ORIGIN, 2, 2);
    expect(s.internalCount).toBe(36);
    s.arc(ORIGIN, 1, 0, Math.PI, { tone: "lo" }, 4);
    expect(s.internalCount).toBe(40);
    s.curve(points[0] as Vec3, points[1] as Vec3, points[2] as Vec3, { tone: "accent" }, 4);
    expect(s.internalCount).toBe(44);
    expect([...s.internalLines.subarray(0, s.internalCount * 6)].every(Number.isFinite)).toBe(true);
    expect(s.lerp(1, 3, 0.5)).toBe(2);
    expect(s.nearest(0.8, 5)).toBe(3);
    expect(s.falloff(0.5, 0.5)).toBe(1);
    expect(s.falloff(0, 1)).toBe(0);
    let repeats = 0;
    s.repeat(3, () => {
      repeats++;
    });
    expect(repeats).toBe(3);
  });
  it("omits hidden portions while preserving edges on front plates", () => {
    const s = new Scene();
    s.box(ORIGIN, [2, 2, 2]);
    const p = new Projection();
    p.internalRender(s);
    expect(p.internalVisibleCount).toBeLessThan(12);
    expect(p.internalVisibleCount).toBeGreaterThan(0);
    const outlines = p.internalPaths.join("");
    expect(outlines).not.toContain("NaN");
    expect(p.internalPlatePath.match(/Z/g)).toHaveLength(3);
  });
  it("splits a line behind a box, leaves foreground lines and handles crossings", () => {
    const s = new Scene();
    s.box(ORIGIN, [2, 2, 2]);
    s.line([-3, 0, 0], [4, 0, 0], { tone: "accent" });
    const p = new Projection();
    p.internalRender(s);
    expect(p.internalPaths[4]?.match(/M/g)?.length).toBeGreaterThanOrEqual(1);
    s.internalReset();
    s.box(ORIGIN, [2, 2, 2]);
    s.line([-3, 0, 4], [4, 0, 4], { tone: "hi" });
    p.internalRender(s);
    expect(p.internalPaths[0]).toContain("L");
    s.internalReset();
    s.box(ORIGIN, [2, 2, 2]);
    s.line([0, 0, 0], [1, 1, 1], { tone: "accent" });
    p.internalRender(s);
    expect(p.internalPaths[4]).toBe("");
  });
  it("handles plate-free shapes and enforces storage capacities", () => {
    const s = new Scene();
    s.box(ORIGIN, [1, 1, 1], { plate: false });
    expect(s.internalPlateCount).toBe(0);
    const p = new Projection();
    p.internalRender(s);
    expect(p.internalVisibleCount).toBe(12);
    s.internalReset();
    for (let i = 0; i < 600; i++) s.line(ORIGIN, ORIGIN);
    expect(() => s.line(ORIGIN, ORIGIN)).toThrow("HATTAT_E004");
    s.internalReset();
    s.internalPlateCount = 159;
    expect(() => s.box(ORIGIN, [1, 1, 1])).toThrow("HATTAT_E004");
    s.internalReset();
    s.line([NaN, 0, 0], ORIGIN);
    expect(() => p.internalRender(s)).toThrow("HATTAT_E004");
    s.polyline([]);
    s.polyline([ORIGIN], {}, true);
  });
});
describe("figure metadata and static SVG", () => {
  it("freezes valid metadata and produces repeatable accessible, escaped SVG without DOM", () => {
    const d = defineFigure({
      ...FIGURE,
      params: { open: { input: "pointer.y", rest: 0.5, spring: "gentle" } },
    });
    expect(Object.isFrozen(d)).toBe(true);
    const svg = renderSVG(d, 0.5, 'Cabinet <script>"&');
    expect(svg).toContain('role="img"');
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("vector-effect");
    expect(svg).toBe(renderSVG(d, 0.5, 'Cabinet <script>"&'));
    expect(renderSVG(FIGURE)).toContain("A cabinet");
  });
  it.each([
    { name: "Bad Name" },
    { intents: ["one"] },
    { mood: [] },
    { mood: ["1", "2", "3", "4"] },
    { interaction: "" },
    { a11y: { label: "" } },
    { aspect: "2:1" },
    { category: "" },
    { bounds: { x: 0, y: 0, width: 0, height: 1 } },
    { bounds: { x: NaN, y: 0, width: 1, height: 1 } },
    { params: { open: { input: "scroll.progress" } } },
    { params: { open: { input: "pointer.y", spring: "unknown" } } },
    { params: { open: { input: "pointer.y", rest: -1 } } },
  ])("rejects invalid metadata with an actionable code: %j", (change) => {
    expect(() => defineFigure({ ...FIGURE, ...change } as FigureDefinition)).toThrow("HATTAT_E003");
  });
});
