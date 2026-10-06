import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };

/** A suspension bridge gently tensions its cables. @example mount(host, bridge); */
export const bridge = defineFigure({
  name: "bridge",
  category: "architecture",
  intents: ["connection", "partnership", "migration", "collaboration"],
  mood: ["steady", "connected"],
  interaction: "Pointer approach gently lifts the suspension cables.",
  aspect: "1:1",
  a11y: { label: "A suspension bridge with two towers and responsive cables" },
  params: { tension: { input: "pointer.inside", rest: 0 } },
  bounds: { x: -6.5, y: -8.75, width: 13, height: 13 },
  build(ctx, p) {
    O[0] = -4;
    O[1] = -1.5;
    O[2] = 0;
    S[0] = 8;
    S[1] = 3;
    S[2] = 0.5;
    ctx.box(O, S, EDGE);
    for (let tower = 0; tower < 2; tower++) {
      const x = tower ? 2.5 : -2.5;
      for (let side = 0; side < 2; side++) {
        O[0] = x - 0.25;
        O[1] = side ? 0.75 : -1.25;
        O[2] = 0.5;
        S[0] = 0.5;
        S[1] = 0.5;
        S[2] = 4;
        ctx.box(O, S, EDGE);
      }
      O[0] = x - 0.25;
      O[1] = -1.25;
      O[2] = 4.5;
      S[0] = 0.5;
      S[1] = 2.5;
      S[2] = 0.5;
      ctx.box(O, S, EDGE);
    }
    const rise = (p.tension ?? 0) * (p.intensity ?? 0.5) * 0.75;
    for (let side = 0; side < 2; side++) {
      A[1] = B[1] = side ? 1.25 : -1.25;
      A[0] = -4;
      A[2] = 0.5;
      B[0] = -2.5;
      B[2] = 4.75;
      ctx.line(A, B, HI);
      A[0] = 2.5;
      A[2] = 4.75;
      B[0] = 4;
      B[2] = 0.5;
      ctx.line(A, B, HI);
      for (let i = 0; i < 16; i++) {
        const t = i / 16,
          next = (i + 1) / 16;
        A[0] = -2.5 + 5 * t;
        A[2] = 4.75 - (3 - rise) * 4 * t * (1 - t);
        B[0] = -2.5 + 5 * next;
        B[2] = 4.75 - (3 - rise) * 4 * next * (1 - next);
        ctx.line(A, B, HI);
        if (i % 2 === 0) {
          B[0] = A[0];
          B[2] = 0.5;
          ctx.line(A, B, MID);
        }
      }
    }
  },
});
export default bridge;
