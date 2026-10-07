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
    S[2] = 6.5;
    ctx.box(O, S, EDGE);
    for (let foot = 0; foot < 4; foot++) {
      O[0] = foot % 2 ? 3.25 : 0.25;
      O[1] = foot < 2 ? 0.25 : 2.25;
      O[2] = -0.5;
      S[0] = S[1] = S[2] = 0.5;
      ctx.box(O, S, MID);
    }
    for (let side = 0; side < 2; side++) {
      A[0] = B[0] = side ? 3.75 : 0.25;
      A[1] = B[1] = 3;
      A[2] = 0.25;
      B[2] = 6.25;
      ctx.line(A, B, MID);
    }
    for (let edge = 0; edge < 4; edge++) {
      const next = (edge + 1) % 4;
      A[0] = B[0] = 4;
      A[1] = edge === 0 || edge === 3 ? 0.25 : 2.75;
      A[2] = edge < 2 ? 0.5 : 5.75;
      B[1] = next === 0 || next === 3 ? 0.25 : 2.75;
      B[2] = next < 2 ? 0.5 : 5.75;
      ctx.line(A, B, MID);
    }
    for (let vent = 0; vent < 8; vent++) {
      A[0] = B[0] = 4;
      A[1] = 0.75;
      B[1] = 2.25;
      A[2] = B[2] = 1.25 + vent * 0.5;
      ctx.line(A, B, MID);
    }
    for (let i = 0; i < 5; i++) {
      const pull = ctx.falloff(select, 1 - i / 4, 0.3) * intensity * 1.5;
      O[0] = 0.5;
      O[1] = pull;
      O[2] = 0.5 + i;
      S[0] = 3;
      S[1] = 3;
      S[2] = 0.75;
      ctx.box(O, S, i === ctx.nearest(1 - select, 5) ? HI : MID);
      // Two recessed fan apertures give each removable server a readable front panel.
      for (let fan = 0; fan < 2; fan++)
        for (let segment = 0; segment < 16; segment++) {
          const a = (segment * Math.PI) / 8,
            b = ((segment + 1) * Math.PI) / 8;
          A[0] = 1.5 + fan + Math.cos(a) * 0.25;
          B[0] = 1.5 + fan + Math.cos(b) * 0.25;
          A[1] = B[1] = 3 + pull;
          A[2] = O[2] + 0.5 + Math.sin(a) * 0.25;
          B[2] = O[2] + 0.5 + Math.sin(b) * 0.25;
          ctx.line(A, B, MID);
        }
      for (let handle = 0; handle < 2; handle++) {
        A[0] = B[0] = handle ? 3.25 : 0.75;
        A[1] = 3 + pull;
        B[1] = 3.25 + pull;
        A[2] = B[2] = O[2] + 0.25;
        ctx.line(A, B, EDGE);
        A[1] = B[1];
        B[2] = O[2] + 0.5;
        ctx.line(A, B, EDGE);
        A[2] = B[2];
        B[1] = 3 + pull;
        ctx.line(A, B, EDGE);
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
