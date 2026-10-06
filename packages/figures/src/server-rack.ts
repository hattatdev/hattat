import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  MID: Style = { tone: "mid" },
  HI: Style = { tone: "hi" },
  ACCENT: Style = { tone: "accent" };
/** Infrastructure cards pull forward at pointer height. @example mount(host, serverRack); */
export const serverRack = defineFigure({
  name: "server-rack",
  category: "technology",
  intents: ["hosting", "infrastructure", "operations", "deployment"],
  mood: ["technical", "orderly"],
  interaction: "Pointer height draws the nearest server card forward.",
  aspect: "1:1",
  a11y: { label: "A server rack with cards that slide toward the pointer" },
  params: { select: { input: "pointer.y", rest: 0.5 } },
  bounds: { x: -6.5, y: -8, width: 13, height: 13 },
  build(ctx, p) {
    const select = p.select ?? 0.5,
      intensity = p.intensity ?? 0.5;
    O[0] = 0;
    O[1] = 0;
    O[2] = 0;
    S[0] = 4;
    S[1] = 3;
    S[2] = 0.5;
    ctx.box(O, S, EDGE);
    O[2] = 6;
    ctx.box(O, S, EDGE);
    O[2] = 0.5;
    S[0] = 0.5;
    S[2] = 5.5;
    ctx.box(O, S, EDGE);
    O[0] = 3.5;
    ctx.box(O, S, EDGE);
    for (let i = 0; i < 5; i++) {
      const pull = ctx.falloff(select, 1 - i / 4, 0.3) * intensity * 1.5;
      O[0] = 0.5;
      O[1] = pull;
      O[2] = 0.5 + i;
      S[0] = 3;
      S[1] = 3;
      S[2] = 0.5;
      ctx.box(O, S, i === ctx.nearest(1 - select, 5) ? HI : MID);
      for (let j = 0; j < 4; j++) {
        A[0] = 1 + j * 0.5;
        A[1] = 3 + pull;
        A[2] = O[2] + 0.25;
        B[0] = A[0] + 0.25;
        B[1] = A[1];
        B[2] = A[2];
        ctx.line(A, B, MID);
      }
      A[0] = 3;
      A[1] = 3 + pull;
      A[2] = O[2] + 0.25;
      B[0] = 3.25;
      B[1] = A[1];
      B[2] = A[2];
      ctx.line(A, B, i === 2 ? ACCENT : EDGE);
    }
  },
});
export default serverRack;
