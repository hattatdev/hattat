import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };
/** A lock that opens on approach. @example mount(host, padlock); */
export const padlock = defineFigure({
  name: "padlock",
  category: "security",
  intents: ["login", "authentication", "privacy", "encryption"],
  mood: ["calm", "secure"],
  interaction: "Pointer approach lifts the padlock shackle.",
  aspect: "1:1",
  a11y: { label: "A padlock whose shackle opens as the pointer approaches" },
  params: { open: { input: "pointer.inside", rest: 0 } },
  bounds: { x: -4.25, y: -6.25, width: 9.5, height: 9.5 },
  build(ctx, p) {
    const lift = (p.open ?? 0) * (p.intensity ?? 0.5) * 1.5;
    O[0] = 0;
    O[1] = 0;
    O[2] = 0;
    S[0] = 3;
    S[1] = 1.5;
    S[2] = 3;
    ctx.box(O, S, EDGE);
    for (let ring = 0; ring < 2; ring++) {
      const radius = ring ? 0.75 : 1;
      for (let i = 0; i < 24; i++) {
        const a = (i * Math.PI) / 24,
          b = ((i + 1) * Math.PI) / 24;
        A[0] = 1.5 + Math.cos(a) * radius;
        B[0] = 1.5 + Math.cos(b) * radius;
        A[1] = B[1] = 1;
        A[2] = 3.5 + lift + Math.sin(a) * radius;
        B[2] = 3.5 + lift + Math.sin(b) * radius;
        ctx.line(A, B, HI);
      }
      A[0] = B[0] = 1.5 - radius;
      A[1] = B[1] = 1;
      A[2] = 3.5 + lift;
      B[2] = 2.5 + lift;
      ctx.line(A, B, HI);
      A[0] = B[0] = 1.5 + radius;
      B[2] = 2.5;
      ctx.line(A, B, HI);
    }
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 16,
        b = ((i + 1) * Math.PI) / 16;
      A[0] = 1.5 + Math.cos(a);
      B[0] = 1.5 + Math.cos(b);
      A[1] = B[1] = 0.75;
      A[2] = 3.5 + lift + Math.sin(a);
      B[2] = 3.5 + lift + Math.sin(b);
      ctx.line(A, B, MID);
    }
    for (let side = 0; side < 2; side++) {
      A[0] = side ? 2.25 : 0.5;
      B[0] = A[0] + 0.25;
      A[1] = B[1] = 1;
      A[2] = B[2] = side ? 2.5 : 2.5 + lift;
      ctx.line(A, B, HI);
    }
    for (let edge = 0; edge < 4; edge++) {
      const next = (edge + 1) % 4;
      A[0] = edge === 0 || edge === 3 ? 0.25 : 2.75;
      B[0] = next === 0 || next === 3 ? 0.25 : 2.75;
      A[1] = B[1] = 1.5;
      A[2] = edge < 2 ? 0.25 : 2.75;
      B[2] = next < 2 ? 0.25 : 2.75;
      ctx.line(A, B, MID);
    }
    for (let i = 0; i < 24; i++) {
      const a = -Math.PI / 3 + (i * Math.PI * 5) / 72,
        b = -Math.PI / 3 + ((i + 1) * Math.PI * 5) / 72;
      A[0] = 1.5 + Math.cos(a) * 0.25;
      A[1] = 1.5;
      A[2] = 1.75 + Math.sin(a) * 0.25;
      B[0] = 1.5 + Math.cos(b) * 0.25;
      B[1] = 1.5;
      B[2] = 1.75 + Math.sin(b) * 0.25;
      ctx.line(A, B, MID);
    }
    A[0] = B[0] = 1.5 + Math.cos(-Math.PI / 3) * 0.25;
    A[2] = 1.75 + Math.sin(-Math.PI / 3) * 0.25;
    B[2] = 1;
    ctx.line(A, B, EDGE);
    A[0] = B[0] = 1.5 + Math.cos((4 * Math.PI) / 3) * 0.25;
    A[2] = 1.75 + Math.sin((4 * Math.PI) / 3) * 0.25;
    ctx.line(A, B, EDGE);
    A[0] = 1.5 + Math.cos(-Math.PI / 3) * 0.25;
    A[2] = 1;
    ctx.line(A, B, EDGE);
  },
});
export default padlock;
