import { defineFigure, type Style } from "@hattatdev/core";

const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" };

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
      const z = layer * 1.25 + separation,
        style = layer === 2 - ctx.nearest(select, 3) ? HI : EDGE;
      for (let ring = 0; ring < 2; ring++) {
        const start = ring === 0 ? -Math.PI / 4 : 0,
          span = ring === 0 ? Math.PI : Math.PI * 2,
          count = ring === 0 ? 16 : 32;
        for (let i = 0; i < count; i++) {
          const a = start + (i * span) / count,
            b = start + ((i + 1) * span) / count;
          A[0] = Math.cos(a) * 2;
          A[1] = Math.sin(a) * 2;
          A[2] = B[2] = z + (ring === 0 ? 0 : 0.75);
          B[0] = Math.cos(b) * 2;
          B[1] = Math.sin(b) * 2;
          ctx.line(A, B, style);
        }
      }
      for (let side = 0; side < 2; side++) {
        const angle = -Math.PI / 4 + side * Math.PI;
        A[0] = B[0] = Math.cos(angle) * 2;
        A[1] = B[1] = Math.sin(angle) * 2;
        A[2] = z;
        B[2] = z + 0.75;
        ctx.line(A, B, style);
      }
    }
  },
});
export default dbStack;
