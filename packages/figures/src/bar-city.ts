import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };
const HEIGHTS = [1.5, 3, 2.25, 4.25, 3.25] as const;

/** Five sculptural columns lift toward the pointer. @example mount(host, barCity); */
export const barCity = defineFigure({
  name: "bar-city",
  category: "data",
  intents: ["metrics", "growth", "comparison", "reporting"],
  mood: ["orderly", "optimistic"],
  interaction: "Horizontal pointer movement raises the nearest column.",
  aspect: "1:1",
  a11y: { label: "Five isometric chart columns that rise toward the pointer" },
  params: {
    select: { input: "pointer.x", rest: 0.5 },
    inside: { input: "pointer.inside", rest: 0 },
  },
  bounds: { x: -5.75, y: -7.25, width: 11.5, height: 11.5 },
  build(ctx, p) {
    O[0] = -3;
    O[1] = -2;
    O[2] = 0;
    S[0] = 6;
    S[1] = 4;
    S[2] = 0.5;
    ctx.box(O, S, EDGE);
    // Unlabeled quarter-scale ticks anchor the sculptural columns as a data chart.
    for (let tick = 0; tick <= 8; tick++) {
      A[0] = -2.5;
      B[0] = tick % 2 ? -2.25 : -2;
      A[1] = B[1] = 1.25;
      A[2] = B[2] = 0.5 + tick * 0.5;
      ctx.line(A, B, MID);
    }
    A[0] = B[0] = -2.5;
    A[1] = B[1] = 1.25;
    A[2] = 0.5;
    B[2] = 4.5;
    ctx.line(A, B, MID);
    A[0] = -2.5;
    B[0] = 2.5;
    A[2] = B[2] = 0.5;
    ctx.line(A, B, MID);
    const select = p.select ?? 0.5,
      intensity = (p.intensity ?? 0.5) * (p.inside ?? 0);
    for (let i = 0; i < 5; i++) {
      O[0] = -2.5 + i;
      O[1] = -0.5;
      O[2] = 0.5;
      S[0] = 0.75;
      S[1] = 1;
      S[2] = (HEIGHTS[i] ?? 2) + ctx.falloff(select, i / 4, 0.35) * intensity * 1.5;
      ctx.box(O, S, i === ctx.nearest(select, 5) ? HI : MID);
    }
  },
});
export default barCity;
