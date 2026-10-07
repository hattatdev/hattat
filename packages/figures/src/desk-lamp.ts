import { type BuildContext, defineFigure } from "@hattatdev/core";
import { face, line, point, reset } from "./internal/solid.js";

const CORNERS = new Float64Array(8);
let pass = 0;

function radial(
  i: number,
  x: number,
  y: number,
  z: number,
  r: number,
  h: number,
  angle: number,
  axis: number,
): void {
  point(
    i,
    x + r * Math.cos(angle),
    y + (axis ? h : r * Math.sin(angle)),
    z + (axis ? -r * Math.sin(angle) : h),
  );
}

function round(
  ctx: BuildContext,
  x: number,
  y: number,
  z: number,
  r0: number,
  r1: number,
  h: number,
  axis: number,
  n: number,
  tone: number,
  bottom = true,
): void {
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step,
      b = a + step;
    radial(0, x, y, z, r0, 0, a, axis);
    radial(1, x, y, z, r0, 0, b, axis);
    radial(2, x, y, z, r1, h, b, axis);
    radial(3, x, y, z, r1, h, a, axis);
    if (!pass) face(4);
    else {
      if (bottom) line(ctx, 0, 1, 2);
      line(ctx, 3, 2, tone);
      const angle = a + step / 2,
        previous = a - step / 2,
        slope = (r0 - r1) / h,
        sign = axis ? -1 : 1;
      if (
        (Math.cos(angle) + sign * Math.sin(angle) + slope) *
          (Math.cos(previous) + sign * Math.sin(previous) + slope) <
        0
      )
        line(ctx, 0, 3, tone);
    }
  }
  if (!pass) {
    for (let i = 0; i < n; i++) radial(i, x, y, z, r1, h, i * step, axis);
    face(n);
  }
}

function beam(ctx: BuildContext, ax: number, az: number, bx: number, bz: number): void {
  const length = Math.hypot(bx - ax, bz - az),
    nx = ((bz - az) / length) * 0.125,
    nz = ((ax - bx) / length) * 0.125;
  CORNERS[0] = ax - nx;
  CORNERS[1] = az - nz;
  CORNERS[2] = bx - nx;
  CORNERS[3] = bz - nz;
  CORNERS[4] = bx + nx;
  CORNERS[5] = bz + nz;
  CORNERS[6] = ax + nx;
  CORNERS[7] = az + nz;
  for (let side = 0; side < 4; side++) {
    const next = (side + 1) % 4;
    point(0, CORNERS[side * 2] as number, -0.25, CORNERS[side * 2 + 1] as number);
    point(1, CORNERS[next * 2] as number, -0.25, CORNERS[next * 2 + 1] as number);
    point(2, CORNERS[next * 2] as number, 0, CORNERS[next * 2 + 1] as number);
    point(3, CORNERS[side * 2] as number, 0, CORNERS[side * 2 + 1] as number);
    if (!pass) face(4);
    else {
      line(ctx, 0, 1, 2);
      line(ctx, 3, 2, 1);
      line(ctx, 0, 3, 2);
    }
  }
  if (!pass) {
    for (let i = 0; i < 4; i++) point(i, CORNERS[i * 2] as number, 0, CORNERS[i * 2 + 1] as number);
    face(4);
  }
}

/** A solid articulated lamp follows input with fixed-length arms. @example mount(host, deskLamp); */
export const deskLamp = defineFigure({
  name: "desk-lamp",
  category: "objects",
  intents: ["focus", "reading", "ideas", "workspace"],
  mood: ["thoughtful", "warm"],
  interaction: "Horizontal pointer movement guides the lamp head left and right.",
  aspect: "1:1",
  a11y: { label: "An articulated desk lamp that follows the pointer" },
  params: { aim: { input: "pointer.x", rest: 0.5, spring: "default" } },
  bounds: { x: -3.5, y: -6.75, width: 9, height: 9 },
  build(ctx, p) {
    // MOT-05: positive pointer displacement moves the head right, without stretching.
    const d = (2 * (p.aim ?? 0.5) - 1) * (p.intensity ?? 0.5),
      lower = ((108 - 6 * d) * Math.PI) / 180,
      upper = ((38 - 14 * d) * Math.PI) / 180,
      ex = Math.cos(lower) * 2.5,
      ez = 1 + Math.sin(lower) * 2.5,
      hx = ex + Math.cos(upper) * 2.75,
      hz = ez + Math.sin(upper) * 2.75;
    reset();
    for (pass = 0; pass < 2; pass++) {
      round(ctx, 0, 0, 0, 1.5, 1.5, 0.25, 0, 48, 0);
      round(ctx, 0, 0, 0.25, 1.5, 1.25, 0.25, 0, 48, 1, false);
      beam(ctx, 0, 0.5, 0, 1);
      beam(ctx, 0, 1, ex, ez);
      beam(ctx, ex, ez, hx, hz);
      beam(ctx, hx, hz, hx + 0.75, hz);
      for (let i = 0; i < 3; i++) {
        const x = i === 0 ? 0 : i === 1 ? ex : hx,
          z = i === 0 ? 1 : i === 1 ? ez : hz;
        round(ctx, x, 0, z, 0.25, 0.25, 0.25, 1, 24, 1);
        if (pass) {
          point(0, x - 0.125, 0.25, z);
          point(1, x + 0.125, 0.25, z);
          line(ctx, 0, 1, 3);
        }
      }
      round(ctx, hx + 0.75, 0, hz - 1.25, 1, 1, 0.25, 0, 32, 0);
      round(ctx, hx + 0.75, 0, hz - 1, 1, 0.5, 1.25, 0, 32, 0, false);
    }
  },
});
export default deskLamp;
