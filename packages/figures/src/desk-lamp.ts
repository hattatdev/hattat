import { type BuildContext, defineFigure, type Style } from "@hattatdev/core";

const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const CORNERS = new Float64Array(8),
  JOINTS = new Float64Array(6);
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };

// Camera rays travel along (1, 1, 1). Opaque pivot drums hide arm and rear-ring edges.
function hidden(x: number, y: number, z: number): boolean {
  for (let joint = 0; joint < 3; joint++) {
    const dx = x - (JOINTS[joint * 2] as number),
      dz = z - (JOINTS[joint * 2 + 1] as number),
      discriminant = 0.5 - (dx - dz) ** 2;
    if (discriminant <= 0) continue;
    const root = Math.sqrt(discriminant),
      near = (-dx - dz - root) / 2,
      far = (-dx - dz + root) / 2;
    if (Math.min(far, 0.25 - y) > Math.max(0.0001, near, -0.25 - y)) return true;
  }
  return false;
}

function visibleLine(ctx: BuildContext, style: Style): void {
  const ax = A[0],
    ay = A[1],
    az = A[2],
    bx = B[0],
    by = B[1],
    bz = B[2],
    start = hidden(ax, ay, az),
    end = hidden(bx, by, bz);
  if (start && end) {
    const mx = (ax + bx) / 2,
      my = (ay + by) / 2,
      mz = (az + bz) / 2;
    if (hidden(mx, my, mz)) return;
    B[0] = mx;
    B[1] = my;
    B[2] = mz;
    visibleLine(ctx, style);
    A[0] = mx;
    A[1] = my;
    A[2] = mz;
    B[0] = bx;
    B[1] = by;
    B[2] = bz;
    visibleLine(ctx, style);
    return;
  }
  if (start !== end) {
    let low = 0,
      high = 1;
    for (let i = 0; i < 12; i++) {
      const t = (low + high) / 2;
      if (hidden(ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t) === start) low = t;
      else high = t;
    }
    const t = (low + high) / 2;
    if (start) {
      A[0] = ax + (bx - ax) * t;
      A[1] = ay + (by - ay) * t;
      A[2] = az + (bz - az) * t;
    } else {
      B[0] = ax + (bx - ax) * t;
      B[1] = ay + (by - ay) * t;
      B[2] = az + (bz - az) * t;
    }
  }
  ctx.line(A, B, style);
}

function arm(ctx: BuildContext, ax: number, az: number, bx: number, bz: number): void {
  const length = Math.hypot(bx - ax, bz - az),
    nx = ((bz - az) / length) * 0.25,
    nz = ((ax - bx) / length) * 0.25;
  CORNERS[0] = ax - nx;
  CORNERS[1] = az - nz;
  CORNERS[2] = bx - nx;
  CORNERS[3] = bz - nz;
  CORNERS[4] = bx + nx;
  CORNERS[5] = bz + nz;
  CORNERS[6] = ax + nx;
  CORNERS[7] = az + nz;
  // The front rectangle and one exposed side form a solid beam, without rear wireframes.
  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;
    A[0] = CORNERS[i * 2] as number;
    A[2] = CORNERS[i * 2 + 1] as number;
    B[0] = CORNERS[next * 2] as number;
    B[2] = CORNERS[next * 2 + 1] as number;
    A[1] = B[1] = 0;
    visibleLine(ctx, EDGE);
  }
  const first = nx + nz >= 0 ? 2 : 0,
    last = first + 1;
  A[0] = CORNERS[first * 2] as number;
  A[2] = CORNERS[first * 2 + 1] as number;
  B[0] = CORNERS[last * 2] as number;
  B[2] = CORNERS[last * 2 + 1] as number;
  A[1] = B[1] = -0.25;
  visibleLine(ctx, MID);
}

function joint(ctx: BuildContext, x: number, z: number): void {
  for (let face = 0; face < 2; face++) {
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12,
        b = ((i + 1) * Math.PI) / 12;
      A[0] = x + Math.cos(a) * 0.5;
      A[2] = z + Math.sin(a) * 0.5;
      B[0] = x + Math.cos(b) * 0.5;
      B[2] = z + Math.sin(b) * 0.5;
      A[1] = B[1] = face ? 0.25 : -0.25;
      visibleLine(ctx, face ? EDGE : MID);
    }
  }
  for (let side = 0; side < 2; side++) {
    const angle = -Math.PI / 4 + side * Math.PI;
    A[0] = B[0] = x + Math.cos(angle) * 0.5;
    A[2] = B[2] = z + Math.sin(angle) * 0.5;
    A[1] = -0.25;
    B[1] = 0.25;
    visibleLine(ctx, MID);
  }
  A[0] = x - 0.25;
  B[0] = x + 0.25;
  A[1] = B[1] = 0.25;
  A[2] = B[2] = z;
  ctx.line(A, B, MID);
}

/** An articulated lamp guides its head toward input. @example mount(host, deskLamp); */
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
      x = 1.25 + aim * 1.5,
      z = 5.25 + aim * 0.5;
    JOINTS[0] = 0;
    JOINTS[1] = 1;
    JOINTS[2] = -0.75;
    JOINTS[3] = 3.5;
    JOINTS[4] = x;
    JOINTS[5] = z;
    for (let ring = 0; ring < 2; ring++) {
      const count = ring ? 32 : 16,
        start = ring ? 0 : -Math.PI / 4,
        span = ring ? Math.PI * 2 : Math.PI;
      for (let i = 0; i < count; i++) {
        const a = start + (i * span) / count,
          b = start + ((i + 1) * span) / count;
        A[0] = Math.cos(a) * 1.5;
        A[1] = Math.sin(a) * 1.5;
        B[0] = Math.cos(b) * 1.5;
        B[1] = Math.sin(b) * 1.5;
        A[2] = B[2] = ring * 0.5;
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
    arm(ctx, 0, 1, -0.75, 3.5);
    arm(ctx, -0.75, 3.5, x, z);
    arm(ctx, x, z, x + 1, z);
    joint(ctx, 0, 1);
    joint(ctx, -0.75, 3.5);
    joint(ctx, x, z);
    // A wider shade is the visual focal point; the opaque shell has no inner wire ring.
    for (let ring = 0; ring < 2; ring++) {
      const radius = ring ? 1 : 0.5,
        count = ring ? 24 : 32,
        start = ring ? -Math.PI / 4 : 0,
        span = ring ? Math.PI : Math.PI * 2;
      for (let i = 0; i < count; i++) {
        const a = start + (i * span) / count,
          b = start + ((i + 1) * span) / count;
        A[0] = x + 1.5 + Math.cos(a) * radius;
        A[1] = Math.sin(a) * radius;
        B[0] = x + 1.5 + Math.cos(b) * radius;
        B[1] = Math.sin(b) * radius;
        A[2] = B[2] = z - ring;
        ctx.line(A, B, ring ? HI : EDGE);
      }
    }
    for (let side = 0; side < 2; side++) {
      const a = -Math.PI / 4 + side * Math.PI;
      A[0] = x + 1.5 + Math.cos(a) * 0.5;
      A[1] = Math.sin(a) * 0.5;
      A[2] = z;
      B[0] = x + 1.5 + Math.cos(a);
      B[1] = Math.sin(a);
      B[2] = z - 1;
      ctx.line(A, B, EDGE);
    }
  },
});
export default deskLamp;
