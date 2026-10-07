import { type BuildContext, defineFigure, type Style } from "@hattatdev/core";

const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };
const HEIGHTS = new Float64Array(3);

// Camera rays travel along (1, 1, 1); upper closed cylinders hide lower rear contours.
function hidden(x: number, y: number, z: number, layer: number): boolean {
  const discriminant = 8 - (x - y) ** 2;
  if (discriminant < 0) return false;
  const root = Math.sqrt(discriminant),
    near = (-x - y - root) / 2,
    far = (-x - y + root) / 2;
  for (let i = layer + 1; i < 3; i++) {
    const bottom = HEIGHTS[i] as number;
    if (Math.min(far, bottom + 0.75 - z) > Math.max(0.0001, near, bottom - z)) return true;
  }
  return false;
}

function visibleLine(ctx: BuildContext, layer: number, style: Style): void {
  const ax = A[0],
    ay = A[1],
    az = A[2],
    bx = B[0],
    by = B[1],
    bz = B[2],
    startHidden = hidden(ax, ay, az, layer),
    endHidden = hidden(bx, by, bz, layer);
  if (startHidden && endHidden) return;
  if (startHidden !== endHidden) {
    let low = 0,
      high = 1;
    for (let i = 0; i < 12; i++) {
      const t = (low + high) / 2;
      if (hidden(ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t, layer) === startHidden)
        low = t;
      else high = t;
    }
    const t = (low + high) / 2;
    if (startHidden) {
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

/** Three database layers separate toward input. @example mount(host, dbStack); */
export const dbStack = defineFigure({
  name: "db-stack",
  category: "technology",
  intents: ["databases", "backups", "data storage", "persistence"],
  mood: ["orderly", "reliable"],
  interaction: "Pointer height separates the nearest database layer.",
  aspect: "1:1",
  a11y: { label: "Three cylindrical database layers that separate toward the pointer" },
  params: {
    select: { input: "pointer.y", rest: 0.5 },
    inside: { input: "pointer.inside", rest: 0 },
  },
  bounds: { x: -4.5, y: -6.75, width: 9, height: 9 },
  build(ctx, p) {
    const select = p.select ?? 0.5,
      strength = (p.inside ?? 0) * (p.intensity ?? 0.5);
    let separation = 0;
    for (let layer = 0; layer < 3; layer++) {
      separation += ctx.falloff(select, 1 - layer / 2, 0.45) * strength * 0.75;
      HEIGHTS[layer] = layer * 1.25 + separation;
    }
    for (let layer = 0; layer < 3; layer++) {
      const z = HEIGHTS[layer] as number,
        style = layer === 2 - ctx.nearest(select, 3) ? HI : EDGE;
      for (let ring = 0; ring < 3; ring++) {
        if (ring === 2 && layer !== 2) continue;
        const front = ring === 0,
          start = front ? -Math.PI / 4 : 0,
          span = front ? Math.PI : Math.PI * 2,
          count = front ? 16 : 32,
          radius = ring === 2 ? 1.75 : 2,
          height = ring === 0 ? 0 : 0.75;
        for (let i = 0; i < count; i++) {
          const a = start + (i * span) / count,
            b = start + ((i + 1) * span) / count;
          A[0] = Math.cos(a) * radius;
          A[1] = Math.sin(a) * radius;
          A[2] = B[2] = z + height;
          B[0] = Math.cos(b) * radius;
          B[1] = Math.sin(b) * radius;
          visibleLine(ctx, layer, ring >= 2 ? MID : style);
        }
      }
      for (let side = 0; side < 2; side++) {
        const angle = -Math.PI / 4 + side * Math.PI;
        A[0] = B[0] = Math.cos(angle) * 2;
        A[1] = B[1] = Math.sin(angle) * 2;
        A[2] = z;
        B[2] = z + 0.75;
        visibleLine(ctx, layer, style);
      }
      for (let port = 0; port < 1; port++) {
        const angle = Math.PI / 4;
        for (let side = 0; side < 4; side++) {
          const next = (side + 1) % 4;
          A[0] = Math.cos(angle + (side === 0 || side === 3 ? -0.0625 : 0.0625)) * 2;
          A[1] = Math.sin(angle + (side === 0 || side === 3 ? -0.0625 : 0.0625)) * 2;
          A[2] = z + (side < 2 ? 0.5 : 0.25);
          B[0] = Math.cos(angle + (next === 0 || next === 3 ? -0.0625 : 0.0625)) * 2;
          B[1] = Math.sin(angle + (next === 0 || next === 3 ? -0.0625 : 0.0625)) * 2;
          B[2] = z + (next < 2 ? 0.5 : 0.25);
          visibleLine(ctx, layer, MID);
        }
      }
    }
  },
});
export default dbStack;
