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
    const angle = ((p.swing ?? 0.5) - 0.5) * (p.intensity ?? 0.5) * 1.2;
    const x = Math.sin(angle) * 3.25,
      z = 5.5 - Math.cos(angle) * 3.25;
    for (let side = 0; side < 2; side++) {
      A[0] = 0;
      A[1] = B[1] = 0.5 + side * 0.25;
      A[2] = 5.5;
      B[0] = x;
      B[2] = z;
      ctx.line(A, B, EDGE);
    }
    for (let ring = 0; ring < 3; ring++) {
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8,
          b = ((i + 1) * Math.PI) / 8;
        A[0] = x + (ring === 1 ? 0 : Math.cos(a) * 0.5);
        A[1] = 0.75 + (ring === 0 ? 0 : (ring === 1 ? Math.cos(a) : Math.sin(a)) * 0.5);
        A[2] = z + (ring === 2 ? 0 : Math.sin(a) * 0.5);
        B[0] = x + (ring === 1 ? 0 : Math.cos(b) * 0.5);
        B[1] = 0.75 + (ring === 0 ? 0 : (ring === 1 ? Math.cos(b) : Math.sin(b)) * 0.5);
        B[2] = z + (ring === 2 ? 0 : Math.sin(b) * 0.5);
        ctx.line(A, B, ring === 0 ? HI : MID);
      }
    }
  },
});
export default pendulum;
