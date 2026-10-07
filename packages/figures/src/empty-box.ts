import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };

/** An open carton lifts its two broad flaps. @example mount(host, emptyBox); */
export const emptyBox = defineFigure({
  name: "empty-box",
  category: "ui-concepts",
  intents: ["empty state", "no results", "inventory", "onboarding"],
  mood: ["quiet", "inviting"],
  interaction: "Pointer approach lifts the flaps of an empty box.",
  aspect: "1:1",
  a11y: { label: "An empty open box with flaps that lift on approach" },
  params: { open: { input: "pointer.inside", rest: 0 } },
  bounds: { x: -6.5, y: -8, width: 13, height: 13 },
  build(ctx, p) {
    O[0] = -2;
    O[1] = -1.5;
    O[2] = 0;
    S[0] = 4;
    S[1] = 3;
    S[2] = 0.25;
    ctx.box(O, S, MID);
    for (let side = 0; side < 4; side++) {
      O[0] = side === 1 ? 1.75 : -2;
      O[1] = side === 3 ? 1.25 : -1.5;
      O[2] = 0.25;
      S[0] = side < 2 ? 0.25 : 4;
      S[1] = side < 2 ? 3 : 0.25;
      S[2] = 2.25;
      ctx.box(O, S, EDGE);
    }
    const angle = 0.35 + (p.open ?? 0) * (p.intensity ?? 0.5) * 0.8;
    const dx = Math.cos(angle) * 2,
      dz = Math.sin(angle) * 2;
    for (let side = 0; side < 2; side++) {
      const sign = side ? 1 : -1;
      for (let layer = 0; layer < 2; layer++) {
        for (let edge = 0; edge < 4; edge++) {
          const j = (edge + 1) % 4;
          A[0] = sign * (2 + (edge === 1 || edge === 2 ? dx : 0));
          A[1] = edge < 2 ? -1.5 : 1.5;
          A[2] = 2.5 + (edge === 1 || edge === 2 ? dz : 0) - layer * 0.25;
          B[0] = sign * (2 + (j === 1 || j === 2 ? dx : 0));
          B[1] = j < 2 ? -1.5 : 1.5;
          B[2] = 2.5 + (j === 1 || j === 2 ? dz : 0) - layer * 0.25;
          // Only exposed underside edges explain flap thickness; omit rear wireframes.
          if (!layer || edge === 1 || (side === 0 && edge === 0) || (side === 1 && edge === 2))
            ctx.line(A, B, layer ? MID : HI);
          if (!layer && (edge === 1 || edge === 2)) {
            B[0] = A[0];
            B[1] = A[1];
            B[2] = A[2] - 0.25;
            ctx.line(A, B, EDGE);
          }
        }
      }
    }
    // Short end flaps complete the carton silhouette without a second wire outline.
    for (let side = 0; side < 2; side++) {
      const sign = side ? 1 : -1;
      for (let edge = 0; edge < 4; edge++) {
        const next = (edge + 1) % 4;
        A[0] = edge === 0 || edge === 3 ? -1.75 : 1.75;
        B[0] = next === 0 || next === 3 ? -1.75 : 1.75;
        A[1] = sign * (1.5 + (edge >= 2 ? dx * 0.5 : 0));
        B[1] = sign * (1.5 + (next >= 2 ? dx * 0.5 : 0));
        A[2] = 2.5 + (edge >= 2 ? dz * 0.5 : 0);
        B[2] = 2.5 + (next >= 2 ? dz * 0.5 : 0);
        ctx.line(A, B, HI);
      }
    }
  },
});
export default emptyBox;
