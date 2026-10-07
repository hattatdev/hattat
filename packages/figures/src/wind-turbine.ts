import { type BuildContext, defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };
const BLADE = [0.5, -0.25, 2.75, 0, 3, 0.25, 2.5, 0.5, 1, 0.5, 0.5, 0.25] as const;
const HOUSING = [
  -0.25, 6, 0.25, 6, 0.5, 5.75, 0.5, 5.25, 0.25, 5, -0.25, 5, -0.5, 5.25, -0.5, 5.75,
] as const;
const ROTOR = new Float64Array(36),
  INTERVALS = new Float64Array(8);

function bladeLine(ctx: BuildContext, style: Style): void {
  const ax = A[0],
    ay = A[1],
    az = A[2],
    bx = B[0],
    by = B[1],
    bz = B[2],
    px = ax + 1 - ay,
    pz = az + 1 - ay,
    qx = bx + 1 - by,
    qz = bz + 1 - by;
  let count = 1;
  INTERVALS[0] = 0;
  INTERVALS[1] = 1;
  for (let blade = 0; blade < 3 && count; blade++) {
    let low = 0,
      high = 1;
    if (ay >= 1 - 1e-7 && by >= 1 - 1e-7) break;
    if (ay >= 1 - 1e-7) low = (1 - 1e-7 - ay) / (by - ay);
    if (by >= 1 - 1e-7) high = (1 - 1e-7 - ay) / (by - ay);
    for (let edge = 0; edge < 6; edge++) {
      const i = blade * 12 + edge * 2,
        j = blade * 12 + ((edge + 1) % 6) * 2,
        x = ROTOR[i] as number,
        z = ROTOR[i + 1] as number,
        dx = (ROTOR[j] as number) - x,
        dz = (ROTOR[j + 1] as number) - z,
        c0 = dx * (pz - z) - dz * (px - x),
        c1 = dx * (qz - z) - dz * (qx - x);
      if (c0 < 0 && c1 < 0) {
        high = -1;
        break;
      }
      if (c0 < 0) low = Math.max(low, c0 / (c0 - c1));
      if (c1 < 0) high = Math.min(high, c0 / (c0 - c1));
    }
    if (low >= high) continue;
    for (let i = 0; i < count; i++) {
      const start = INTERVALS[i * 2] as number,
        end = INTERVALS[i * 2 + 1] as number;
      if (low >= end || high <= start) continue;
      if (low <= start && high >= end) {
        INTERVALS.copyWithin(i * 2, (i + 1) * 2, count * 2);
        count--;
        i--;
      } else if (low <= start) INTERVALS[i * 2] = high;
      else if (high >= end) INTERVALS[i * 2 + 1] = low;
      else {
        INTERVALS.copyWithin((i + 2) * 2, (i + 1) * 2, count * 2);
        INTERVALS[i * 2 + 1] = low;
        INTERVALS[(i + 1) * 2] = high;
        INTERVALS[(i + 1) * 2 + 1] = end;
        count++;
        i++;
      }
    }
  }
  for (let i = 0; i < count; i++) {
    const low = INTERVALS[i * 2] as number,
      high = INTERVALS[i * 2 + 1] as number;
    if (high - low < 1e-7) continue;
    A[0] = ax + (bx - ax) * low;
    A[1] = ay + (by - ay) * low;
    A[2] = az + (bz - az) * low;
    B[0] = ax + (bx - ax) * high;
    B[1] = ay + (by - ay) * high;
    B[2] = az + (bz - az) * high;
    ctx.line(A, B, style);
  }
}

function enclosure(ctx: BuildContext): void {
  for (let axis = 0; axis < 3; axis++) {
    for (let side = 1; side < 4; side++) {
      for (let coordinate = 0; coordinate < 3; coordinate++) {
        const first = (axis + 1) % 3;
        A[coordinate] = B[coordinate] =
          (O[coordinate] as number) +
          (coordinate === axis
            ? 0
            : (S[coordinate] as number) * (coordinate === first ? side & 1 : (side >> 1) & 1));
      }
      B[axis] = (A[axis] as number) + (S[axis] as number);
      rotorLine(ctx, EDGE);
    }
  }
}

function rotorLine(ctx: BuildContext, style: Style): void {
  if (A[1] >= 1 && B[1] >= 1) {
    bladeLine(ctx, style);
    return;
  }
  // Project behind-hub edges onto the foremost disk and remove the covered interval.
  const ax = A[0],
    ay = A[1],
    az = A[2],
    bx = B[0],
    by = B[1],
    bz = B[2],
    x = ax + 1 - ay,
    z = az + 1 - ay - 5.5,
    dx = bx - ax - by + ay,
    dz = bz - az - by + ay,
    quadratic = dx * dx + dz * dz,
    linear = x * dx + z * dz,
    discriminant = linear * linear - quadratic * (x * x + z * z - 0.25);
  if (quadratic < 1e-10 || discriminant <= 0) {
    bladeLine(ctx, style);
    return;
  }
  const root = Math.sqrt(discriminant),
    low = Math.max(0, (-linear - root) / quadratic),
    high = Math.min(1, (-linear + root) / quadratic);
  if (low >= high) {
    bladeLine(ctx, style);
    return;
  }
  if (low > 0) {
    B[0] = ax + (bx - ax) * low;
    B[1] = ay + (by - ay) * low;
    B[2] = az + (bz - az) * low;
    bladeLine(ctx, style);
  }
  if (high < 1) {
    A[0] = ax + (bx - ax) * high;
    A[1] = ay + (by - ay) * high;
    A[2] = az + (bz - az) * high;
    B[0] = bx;
    B[1] = by;
    B[2] = bz;
    bladeLine(ctx, style);
  }
}

/** Three tapered blades turn together. @example mount(host, windTurbine); */
export const windTurbine = defineFigure({
  name: "wind-turbine",
  category: "nature-abstract",
  intents: ["renewable energy", "sustainability", "climate", "clean power"],
  mood: ["light", "optimistic"],
  interaction: "Horizontal pointer movement rotates three wind turbine blades.",
  aspect: "1:1",
  a11y: { label: "A wind turbine with three blades that rotate with the pointer" },
  params: { turn: { input: "pointer.x", rest: 0.5 } },
  bounds: { x: -6.25, y: -10, width: 12, height: 12 },
  build(ctx, p) {
    const turn = ((p.turn ?? 0.5) - 0.5) * (p.intensity ?? 0.5) * Math.PI;
    for (let blade = 0; blade < 3; blade++) {
      const angle = (blade * Math.PI * 2) / 3 + turn + Math.PI / 2,
        c = Math.cos(angle),
        s = Math.sin(angle);
      for (let i = 0; i < 6; i++) {
        const x = BLADE[i * 2] as number,
          z = BLADE[i * 2 + 1] as number;
        ROTOR[blade * 12 + i * 2] = x * c - z * s;
        ROTOR[blade * 12 + i * 2 + 1] = 5.5 + x * s + z * c;
      }
    }
    O[0] = O[1] = -1;
    O[2] = 0;
    S[0] = S[1] = 2;
    S[2] = 0.5;
    enclosure(ctx);
    {
      const count = 12,
        start = -Math.PI / 4,
        span = Math.PI,
        radius = 0.5;
      for (let i = 0; i < count; i++) {
        const a = start + (i * span) / count,
          b = start + ((i + 1) * span) / count;
        A[0] = Math.cos(a) * radius;
        A[1] = Math.sin(a) * radius;
        B[0] = Math.cos(b) * radius;
        B[1] = Math.sin(b) * radius;
        A[2] = B[2] = 0.5;
        rotorLine(ctx, EDGE);
      }
    }
    for (let side = 0; side < 2; side++) {
      const a = -Math.PI / 4 + side * Math.PI;
      A[0] = Math.cos(a) * 0.5;
      A[1] = Math.sin(a) * 0.5;
      A[2] = 0.5;
      B[0] = Math.cos(a) * 0.25;
      B[1] = Math.sin(a) * 0.25;
      B[2] = 5;
      rotorLine(ctx, EDGE);
    }
    O[0] = -0.5;
    O[1] = -1;
    O[2] = 5;
    S[0] = S[2] = 1;
    S[1] = 1.5;
    // VIS-09: chamfered nacelle edges describe a casing rather than a raw cube.
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8,
        ax = HOUSING[i * 2] as number,
        az = HOUSING[i * 2 + 1] as number,
        bx = HOUSING[j * 2] as number,
        bz = HOUSING[j * 2 + 1] as number;
      A[0] = ax;
      A[2] = az;
      B[0] = bx;
      B[2] = bz;
      A[1] = B[1] = 0.5;
      rotorLine(ctx, EDGE);
      if (bx - ax - bz + az <= 0) continue;
      A[1] = B[1] = -1;
      rotorLine(ctx, MID);
      B[0] = ax;
      B[2] = az;
      B[1] = 0.5;
      rotorLine(ctx, EDGE);
    }
    for (let blade = 0; blade < 3; blade++) {
      const angle = (blade * Math.PI * 2) / 3 + turn + Math.PI / 2;
      const c = Math.cos(angle),
        s = Math.sin(angle);
      for (let layer = 0; layer < 2; layer++) {
        for (let i = 0; i < 6; i++) {
          const j = (i + 1) % 6,
            ax = BLADE[i * 2] ?? 0,
            az = BLADE[i * 2 + 1] ?? 0;
          const bx = BLADE[j * 2] ?? 0,
            bz = BLADE[j * 2 + 1] ?? 0;
          A[0] = ax * c - az * s;
          A[1] = B[1] = 0.75 + layer * 0.25;
          A[2] = 5.5 + ax * s + az * c;
          B[0] = bx * c - bz * s;
          B[2] = 5.5 + bx * s + bz * c;
          // Rear-facing blade outlines make the rotor look transparent; keep exposed sides.
          const facing = B[2] - A[2] - (B[0] - A[0]) > 0;
          if (layer || facing) rotorLine(ctx, layer ? HI : MID);
          if (!layer && facing && i > 0 && i < 3) {
            A[0] = ax * c - az * s;
            A[1] = 0.75;
            A[2] = 5.5 + ax * s + az * c;
            B[0] = A[0];
            B[1] = 1;
            B[2] = A[2];
            rotorLine(ctx, EDGE);
          }
        }
      }
    }
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12,
        b = ((i + 1) * Math.PI) / 12;
      A[0] = Math.cos(a) * 0.5;
      A[1] = B[1] = 1;
      A[2] = 5.5 + Math.sin(a) * 0.5;
      B[0] = Math.cos(b) * 0.5;
      B[2] = 5.5 + Math.sin(b) * 0.5;
      ctx.line(A, B, HI);
    }
  },
});
export default windTurbine;
