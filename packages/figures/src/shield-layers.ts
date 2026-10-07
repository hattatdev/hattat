import { type BuildContext, defineFigure, type Style } from "@hattatdev/core";

const OUTLINE = [-2, 5, 0, 5.75, 2, 5, 1.75, 2.5, 1, 1.25, 0, 0.5, -1, 1.25, -1.75, 2.5] as const;
const INSET = [
  -1.5, 4.75, 0, 5.25, 1.5, 4.75, 1.25, 2.75, 0.75, 1.75, 0, 1, -0.75, 1.75, -1.25, 2.75,
] as const;
const FASTENERS = [-1, 4.5, 1, 4.5] as const;
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };

// Project a camera ray onto each nearer convex shield face; keep only exposed edges.
function hidden(x: number, y: number, z: number, layer: number, spacing: number): boolean {
  for (let front = layer; front < 3; front++) {
    const t = (front - 1) * spacing + 0.25 - y;
    if (t <= 0.0001) continue;
    let inside = true;
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8,
        ax = OUTLINE[i * 2] as number,
        az = OUTLINE[i * 2 + 1] as number,
        bx = OUTLINE[j * 2] as number,
        bz = OUTLINE[j * 2 + 1] as number;
      if ((bx - ax) * (z + t - az) - (bz - az) * (x + t - ax) > 0.0001) {
        inside = false;
        break;
      }
    }
    if (inside) return true;
  }
  return false;
}

function visibleLine(ctx: BuildContext, layer: number, spacing: number, style: Style): void {
  const ax = A[0],
    ay = A[1],
    az = A[2],
    bx = B[0],
    by = B[1],
    bz = B[2],
    start = hidden(ax, ay, az, layer, spacing),
    end = hidden(bx, by, bz, layer, spacing);
  if (start && end) return;
  if (start !== end) {
    let low = 0,
      high = 1;
    for (let i = 0; i < 12; i++) {
      const t = (low + high) / 2;
      if (
        hidden(ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t, layer, spacing) === start
      )
        low = t;
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

/** Three thick shield layers open on approach. @example mount(host, shieldLayers); */
export const shieldLayers = defineFigure({
  name: "shield-layers",
  category: "security",
  intents: ["protection", "compliance", "privacy", "defense in depth"],
  mood: ["secure", "calm"],
  interaction: "Pointer approach separates the three shield layers.",
  aspect: "1:1",
  a11y: { label: "Three protective shield layers that separate as the pointer approaches" },
  params: { open: { input: "pointer.inside", rest: 0 } },
  bounds: { x: -5.5, y: -8, width: 11, height: 11 },
  build(ctx, p) {
    const spacing = 0.75 + (p.open ?? 0) * (p.intensity ?? 0.5) * 1.25;
    for (let layer = 0; layer < 3; layer++) {
      const y = (layer - 1) * spacing,
        style = layer === 2 ? HI : layer === 1 ? EDGE : MID;
      for (let side = 0; side < 2; side++) {
        for (let i = 0; i < 8; i++) {
          const next = (i + 1) % 8;
          A[0] = OUTLINE[i * 2] as number;
          A[1] = B[1] = y + side * 0.25;
          A[2] = OUTLINE[i * 2 + 1] as number;
          B[0] = OUTLINE[next * 2] as number;
          B[2] = OUTLINE[next * 2 + 1] as number;
          visibleLine(ctx, layer, spacing, style);
          if (side === 0) {
            B[0] = A[0];
            B[1] = y + 0.25;
            B[2] = A[2];
            visibleLine(ctx, layer, spacing, style);
          }
        }
      }
      if (layer !== 2) continue;
      for (let i = 0; i < 8; i++) {
        const next = (i + 1) % 8;
        A[0] = INSET[i * 2] as number;
        A[1] = B[1] = y + 0.25;
        A[2] = INSET[i * 2 + 1] as number;
        B[0] = INSET[next * 2] as number;
        B[2] = INSET[next * 2 + 1] as number;
        if (i === 1 || i === 5) A[1] = y + 0.5;
        if (next === 1 || next === 5) B[1] = y + 0.5;
        visibleLine(ctx, layer, spacing, MID);
      }
      for (let rivet = 0; rivet < 2; rivet++) {
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4,
            b = ((i + 1) * Math.PI) / 4;
          A[0] = (FASTENERS[rivet * 2] as number) + Math.cos(a) * 0.25;
          A[1] = B[1] = y + 0.25;
          A[2] = (FASTENERS[rivet * 2 + 1] as number) + Math.sin(a) * 0.25;
          B[0] = (FASTENERS[rivet * 2] as number) + Math.cos(b) * 0.25;
          B[2] = (FASTENERS[rivet * 2 + 1] as number) + Math.sin(b) * 0.25;
          visibleLine(ctx, layer, spacing, MID);
        }
      }
      A[0] = B[0] = 0;
      A[1] = B[1] = y + 0.5;
      A[2] = 1;
      B[2] = 5.25;
      ctx.line(A, B, MID);
    }
  },
});
export default shieldLayers;
