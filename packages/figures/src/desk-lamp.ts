import { type BuildContext, defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const CORNERS = new Float64Array(8);
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };

function arm(ctx: BuildContext, ax: number, az: number, bx: number, bz: number, y: number): void {
  const length = Math.hypot(bx - ax, bz - az),
    nx = ((bz - az) / length) * (0.25 / 2),
    nz = ((ax - bx) / length) * (0.25 / 2);
  CORNERS[0] = ax - nx;
  CORNERS[1] = az - nz;
  CORNERS[2] = bx - nx;
  CORNERS[3] = bz - nz;
  CORNERS[4] = bx + nx;
  CORNERS[5] = bz + nz;
  CORNERS[6] = ax + nx;
  CORNERS[7] = az + nz;
  for (let face = 0; face < 2; face++) {
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      A[0] = CORNERS[i * 2] as number;
      A[1] = B[1] = y + face * 0.25;
      A[2] = CORNERS[i * 2 + 1] as number;
      B[0] = CORNERS[next * 2] as number;
      B[2] = CORNERS[next * 2 + 1] as number;
      ctx.line(A, B, EDGE);
      if (face === 0) {
        B[0] = A[0];
        B[1] = y + 0.25;
        B[2] = A[2];
        ctx.line(A, B, MID);
      }
    }
  }
}

function joint(ctx: BuildContext, x: number, z: number): void {
  for (let ring = 0; ring < 3; ring++) {
    const count = ring === 1 || ring === 2 ? 8 : 16,
      start = ring === 1 ? -Math.PI / 4 : 0,
      span = ring === 1 ? Math.PI : Math.PI * 2,
      radius = ring === 2 ? 0.25 : 0.5;
    for (let i = 0; i < count; i++) {
      const a = start + (i * span) / count,
        b = start + ((i + 1) * span) / count;
      A[0] = x + Math.cos(a) * radius;
      A[1] = B[1] = ring === 1 ? -0.5 : 0.5;
      A[2] = z + Math.sin(a) * radius;
      B[0] = x + Math.cos(b) * radius;
      B[2] = z + Math.sin(b) * radius;
      ctx.line(A, B, ring === 2 ? MID : EDGE);
    }
  }
  for (let side = 0; side < 2; side++) {
    const angle = -Math.PI / 4 + side * Math.PI;
    A[0] = B[0] = x + Math.cos(angle) * 0.5;
    A[1] = -0.5;
    B[1] = 0.5;
    A[2] = B[2] = z + Math.sin(angle) * 0.5;
    ctx.line(A, B, MID);
  }
  A[0] = x - 0.25;
  B[0] = x + 0.25;
  A[1] = B[1] = 0.5;
  A[2] = B[2] = z;
  ctx.line(A, B, MID);
}

/** A counterbalanced lamp guides its head toward input. @example mount(host, deskLamp); */
export const deskLamp = defineFigure({
  name: "desk-lamp",
  category: "objects",
  intents: ["focus", "reading", "ideas", "workspace"],
  mood: ["thoughtful", "warm"],
  interaction: "Horizontal pointer movement guides the lamp head left and right.",
  aspect: "1:1",
  a11y: { label: "An articulated desk lamp that follows the pointer" },
  params: { aim: { input: "pointer.x", rest: 0.5 } },
  bounds: { x: -4.75, y: -7.75, width: 11, height: 11 },
  build(ctx, p) {
    const aim = ((p.aim ?? 0.5) - 0.5) * (p.intensity ?? 0.5),
      x = 2 + aim * 1.5,
      z = 5.25 + aim * 0.5;
    for (let ring = 0; ring < 2; ring++) {
      const count = ring ? 24 : 12,
        start = ring ? 0 : -Math.PI / 4,
        span = ring ? Math.PI * 2 : Math.PI;
      for (let i = 0; i < count; i++) {
        const a = start + (i * span) / count,
          b = start + ((i + 1) * span) / count;
        A[0] = Math.cos(a) * 1.5;
        A[1] = Math.sin(a) * 1.5;
        A[2] = B[2] = ring * 0.5;
        B[0] = Math.cos(b) * 1.5;
        B[1] = Math.sin(b) * 1.5;
        ctx.line(A, B, EDGE);
      }
    }
    for (let side = 0; side < 2; side++) {
      const a = -Math.PI / 4 + side * Math.PI;
      A[0] = B[0] = Math.cos(a) * 1.5;
      A[1] = B[1] = Math.sin(a) * 1.5;
      A[2] = 0;
      B[2] = 0.5;
      ctx.line(A, B, EDGE);
    }
    O[0] = O[1] = -0.25;
    O[2] = 0.5;
    S[0] = S[1] = 0.5;
    S[2] = 0.75;
    ctx.box(O, S, MID);
    O[0] = -0.75;
    O[1] = 0.5;
    S[0] = S[2] = 0.25;
    S[1] = 0.5;
    ctx.box(O, S, MID);
    for (let side = 0; side < 2; side++) {
      const y = side ? 0.25 : -0.5;
      arm(ctx, 0, 1.25, 0.25, 3.5, y);
      arm(ctx, 0.25, 3.5, x, z, y);
      for (let i = 0; i < 24; i++) {
        const t = i / 24,
          next = (i + 1) / 24,
          angle = t * Math.PI * 6,
          nextAngle = next * Math.PI * 6;
        A[0] = t * 0.25 + Math.sin(angle) * 0.25;
        A[1] = y + Math.cos(angle) * 0.25;
        A[2] = 1.75 + t * 1.25;
        B[0] = next * 0.25 + Math.sin(nextAngle) * 0.25;
        B[1] = y + Math.cos(nextAngle) * 0.25;
        B[2] = 1.75 + next * 1.25;
        ctx.line(A, B, MID);
      }
    }
    joint(ctx, 0, 1.25);
    joint(ctx, 0.25, 3.5);
    joint(ctx, x, z);
    arm(ctx, x, z, x + 0.75, z, -0.25);
    O[0] = x + 0.5;
    O[1] = -0.25;
    O[2] = z;
    S[0] = S[1] = 0.5;
    S[2] = 0.25;
    ctx.box(O, S, MID);
    for (let ring = 0; ring < 3; ring++) {
      const radius = ring === 0 ? 0.5 : ring === 1 ? 1 : 0.75,
        count = ring === 0 ? 24 : 16,
        start = ring === 0 ? 0 : -Math.PI / 4,
        span = ring === 0 ? Math.PI * 2 : Math.PI;
      for (let i = 0; i < count; i++) {
        const a = start + (i * span) / count,
          b = start + ((i + 1) * span) / count;
        A[0] = x + 0.75 + Math.cos(a) * radius;
        A[1] = Math.sin(a) * radius;
        A[2] = B[2] = z - (ring ? 0.75 : 0);
        B[0] = x + 0.75 + Math.cos(b) * radius;
        B[1] = Math.sin(b) * radius;
        ctx.line(A, B, ring === 1 ? HI : MID);
      }
    }
    for (let side = 0; side < 2; side++) {
      const a = -Math.PI / 4 + side * Math.PI;
      A[0] = x + 0.75 + Math.cos(a) * 0.5;
      A[1] = Math.sin(a) * 0.5;
      A[2] = z;
      B[0] = x + 0.75 + Math.cos(a);
      B[1] = Math.sin(a);
      B[2] = z - 0.75;
      ctx.line(A, B, EDGE);
    }
  },
});
export default deskLamp;
