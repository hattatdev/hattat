import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };
/** Coupled gears turn under horizontal pointer input. @example mount(host, gearTrain); */
export const gearTrain = defineFigure({
  name: "gear-train",
  category: "mechanics",
  intents: ["automation", "workflow", "processing", "integration"],
  mood: ["technical", "precise"],
  interaction: "Horizontal pointer movement rotates three coupled gears.",
  aspect: "1:1",
  a11y: { label: "Three coupled gears that rotate with the pointer" },
  params: { turn: { input: "pointer.x", rest: 0.5 } },
  bounds: { x: -6, y: -5.75, width: 14.5, height: 14.5 },
  build(ctx, p) {
    O[0] = -2;
    O[1] = -2;
    O[2] = -0.5;
    S[0] = 8;
    S[1] = 5;
    S[2] = 0.5;
    ctx.box(O, S, EDGE);
    const angle = ((p.turn ?? 0.5) - 0.5) * (p.intensity ?? 0.5) * Math.PI;
    for (let g = 0; g < 3; g++) {
      const cx = g * 2,
        cy = g % 2 ? 1 : 0,
        rotation = g % 2 ? -angle : angle;
      for (let i = 0; i < 32; i++) {
        const a = (i * Math.PI * 2) / 32 + rotation,
          b = ((i + 1) * Math.PI * 2) / 32 + rotation;
        const ra = i % 4 === 1 || i % 4 === 2 ? 1.25 : 1,
          rb = (i + 1) % 4 === 1 || (i + 1) % 4 === 2 ? 1.25 : 1;
        A[0] = cx + Math.cos(a) * ra;
        A[1] = cy + Math.sin(a) * ra;
        A[2] = 0.5;
        B[0] = cx + Math.cos(b) * rb;
        B[1] = cy + Math.sin(b) * rb;
        B[2] = 0.5;
        ctx.line(A, B, g === 1 ? HI : EDGE);
      }
      O[0] = cx;
      O[1] = cy;
      O[2] = 0.5;
      ctx.arc(O, 0.5, 0, Math.PI * 2, MID, 12);
      for (let k = 0; k < 4; k++) {
        const a = rotation + (k * Math.PI) / 2;
        A[0] = cx + Math.cos(a) * 0.5;
        A[1] = cy + Math.sin(a) * 0.5;
        A[2] = 0.5;
        B[0] = cx + Math.cos(a);
        B[1] = cy + Math.sin(a);
        B[2] = 0.5;
        ctx.line(A, B, MID);
      }
    }
  },
});
export default gearTrain;
