import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };

/** An articulated lamp reaches toward horizontal input. @example mount(host, deskLamp); */
export const deskLamp = defineFigure({
  name: "desk-lamp",
  category: "objects",
  intents: ["focus", "reading", "ideas", "workspace"],
  mood: ["thoughtful", "warm"],
  interaction: "Horizontal pointer movement guides the lamp head left and right.",
  aspect: "1:1",
  a11y: { label: "An articulated desk lamp that follows the pointer" },
  params: { aim: { input: "pointer.x", rest: 0.5 } },
  bounds: { x: -4.75, y: -7.75, width: 11, height: 11 },
  build(ctx, p) {
    O[0] = O[1] = O[2] = 0;
    ctx.cylinder(O, 1.5, 0.5, EDGE, 16);
    const aim = ((p.aim ?? 0.5) - 0.5) * (p.intensity ?? 0.5);
    const x = 2 + aim * 1.5,
      z = 5 + aim * 0.5;
    for (let side = 0; side < 2; side++) {
      A[0] = 0;
      A[1] = B[1] = side ? 0.25 : -0.25;
      A[2] = 0.5;
      B[0] = 0.25;
      B[2] = 3;
      ctx.line(A, B, EDGE);
      A[0] = 0.25;
      A[2] = 3;
      B[0] = x;
      B[2] = z;
      ctx.line(A, B, EDGE);
    }
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6,
        b = ((i + 1) * Math.PI) / 6;
      A[0] = 0.25 + Math.cos(a) * 0.25;
      A[1] = B[1] = 0.25;
      A[2] = 3 + Math.sin(a) * 0.25;
      B[0] = 0.25 + Math.cos(b) * 0.25;
      B[2] = 3 + Math.sin(b) * 0.25;
      ctx.line(A, B, MID);
    }
    for (let ring = 0; ring < 2; ring++) {
      const r = ring ? 1 : 0.5;
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8,
          b = ((i + 1) * Math.PI) / 8;
        A[0] = x + Math.cos(a) * r;
        A[1] = Math.sin(a) * r;
        A[2] = z - ring * 0.75;
        B[0] = x + Math.cos(b) * r;
        B[1] = Math.sin(b) * r;
        B[2] = A[2];
        ctx.line(A, B, ring ? HI : EDGE);
        if (!ring && i % 4 === 0) {
          B[0] = x + Math.cos(a);
          B[1] = Math.sin(a);
          B[2] = z - 0.75;
          ctx.line(A, B, EDGE);
        }
      }
    }
    O[0] = x;
    O[1] = 0;
    O[2] = z - 0.5;
    ctx.arc(O, 0.25, 0, Math.PI * 2, MID, 12);
  },
});
export default deskLamp;
