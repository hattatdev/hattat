import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };

/** A suspended bob follows a constrained arc. @example mount(host, pendulum); */
export const pendulum = defineFigure({
  name: "pendulum",
  category: "mechanics",
  intents: ["timing", "balance", "patience", "scheduling"],
  mood: ["calm", "measured"],
  interaction: "Horizontal pointer movement guides a pendulum along its arc.",
  aspect: "1:1",
  a11y: { label: "A framed pendulum that swings toward the pointer" },
  params: { swing: { input: "pointer.x", rest: 0.5 } },
  bounds: { x: -5.75, y: -8.25, width: 11.5, height: 11.5 },
  build(ctx, p) {
    O[0] = -2;
    O[1] = -1.25;
    O[2] = 0;
    S[0] = 4;
    S[1] = 2.5;
    S[2] = 0.5;
    ctx.box(O, S, EDGE);
    for (let side = 0; side < 2; side++) {
      O[0] = side ? 1.25 : -1.75;
      O[1] = -0.25;
      O[2] = 0.5;
      S[0] = S[1] = 0.5;
      S[2] = 5;
      ctx.box(O, S, EDGE);
    }
    O[0] = -1.75;
    O[1] = -0.25;
    O[2] = 5.5;
    S[0] = 3.5;
    S[1] = S[2] = 0.5;
    ctx.box(O, S, EDGE);
    // A visible bearing hangs from the crossbar instead of suspending the rod in air.
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12,
        b = ((i + 1) * Math.PI) / 12;
      A[0] = Math.cos(a) * 0.25;
      B[0] = Math.cos(b) * 0.25;
      A[1] = B[1] = 0.75;
      A[2] = 5.5 + Math.sin(a) * 0.25;
      B[2] = 5.5 + Math.sin(b) * 0.25;
      ctx.line(A, B, HI);
    }
    const angle = ((p.swing ?? 0.5) - 0.5) * (p.intensity ?? 0.5) * 1.2;
    const x = Math.sin(angle) * 3.25,
      z = 5.5 - Math.cos(angle) * 3.25;
    for (let side = 0; side < 2; side++) {
      A[0] = 0;
      A[1] = B[1] = 0.5 + side * 0.25;
      const ray = side ? 0 : 0.25,
        along = ray * (Math.sin(angle) - Math.cos(angle)),
        discriminant = along * along - (2 * ray * ray - 0.25 * 0.25),
        start = discriminant > 0 ? Math.max(0.25, -along + Math.sqrt(discriminant)) : 0.25;
      A[0] = Math.sin(angle) * start;
      A[2] = 5.5 - Math.cos(angle) * start;
      // Rods attach above the solid bob rather than passing through its face.
      B[0] = Math.sin(angle) * 2.75;
      B[2] = 5.5 - Math.cos(angle) * 2.75;
      ctx.line(A, B, EDGE);
    }
    for (let ring = 0; ring < 2; ring++) {
      // Only the camera-facing rear arc is exposed beside the foremost disk.
      const count = ring ? 32 : 16,
        start = ring ? 0 : -Math.PI / 4,
        span = ring ? Math.PI * 2 : Math.PI;
      for (let i = 0; i < count; i++) {
        const a = start + (i * span) / count,
          b = start + ((i + 1) * span) / count;
        A[0] = x + Math.cos(a) * 0.5;
        A[2] = z + Math.sin(a) * 0.5;
        B[0] = x + Math.cos(b) * 0.5;
        B[2] = z + Math.sin(b) * 0.5;
        A[1] = B[1] = ring ? 0.75 : 0.5;
        if (!ring) {
          const rayX = (A[0] + B[0]) / 2 + 0.25 - x,
            rayZ = (A[2] + B[2]) / 2 + 0.25 - z;
          if (Math.hypot(rayX, rayZ) < 0.5) continue;
        }
        ctx.line(A, B, ring ? HI : MID);
      }
    }
    for (let side = 0; side < 2; side++) {
      const a = -Math.PI / 4 + side * Math.PI;
      A[0] = B[0] = x + Math.cos(a) * 0.5;
      A[2] = B[2] = z + Math.sin(a) * 0.5;
      A[1] = 0.5;
      B[1] = 0.75;
      ctx.line(A, B, MID);
    }
    // Inset machining ring gives the bob a face without decorative spokes.
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12,
        b = ((i + 1) * Math.PI) / 12;
      A[0] = x + Math.cos(a) * 0.25;
      B[0] = x + Math.cos(b) * 0.25;
      A[1] = B[1] = 0.75;
      A[2] = z + Math.sin(a) * 0.25;
      B[2] = z + Math.sin(b) * 0.25;
      ctx.line(A, B, MID);
    }
  },
});
export default pendulum;
