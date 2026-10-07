import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };
const TEETH = new Float64Array(49 * 2);
const PITCH = 2.25 / 2,
  BASE = PITCH * Math.cos(Math.PI / 9);
const involute = (radius: number): number => {
  const t = Math.sqrt((radius / BASE) ** 2 - 1);
  return t - Math.atan(t);
};
for (let i = 0; i <= 48; i++) {
  const side = i % 6,
    radius = side === 0 || side === 5 ? 0.75 : side === 1 || side === 4 ? BASE : 1.25;
  const half = Math.PI / 16 + involute(PITCH) - (side === 2 || side === 3 ? involute(1.25) : 0);
  const angle = (Math.floor(i / 6) * Math.PI) / 4 + (side < 3 ? -half : half);
  TEETH[i * 2] = Math.cos(angle) * radius;
  TEETH[i * 2 + 1] = Math.sin(angle) * radius;
}
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
    // MOT-05: avoid whole-tooth turns that make maximum response look identical to rest.
    const angle = (((p.turn ?? 0.5) - 0.5) * (p.intensity ?? 0.5) * Math.PI) / 6;
    for (let g = 0; g < 3; g++) {
      const cx = g * 2.25,
        cy = 0,
        rotation = g % 2 ? -angle + Math.PI / 8 : angle;
      const cosine = Math.cos(rotation),
        sine = Math.sin(rotation);
      for (let i = 0; i < 48; i++) {
        const ax = TEETH[i * 2] as number,
          ay = TEETH[i * 2 + 1] as number;
        const bx = TEETH[(i + 1) * 2] as number,
          by = TEETH[(i + 1) * 2 + 1] as number;
        A[0] = cx + ax * cosine - ay * sine;
        A[1] = cy + ax * sine + ay * cosine;
        A[2] = 0.5;
        B[0] = cx + bx * cosine - by * sine;
        B[1] = cy + bx * sine + by * cosine;
        B[2] = 0.5;
        ctx.line(A, B, g === 1 ? HI : EDGE);
        // A solid gear exposes lower edges only on faces turned toward the camera.
        if (B[1] - A[1] - (B[0] - A[0]) <= 0) continue;
        A[2] = B[2] = 0.25;
        ctx.line(A, B, MID);
        if (i % 6 === 2) {
          B[0] = A[0];
          B[1] = A[1];
          B[2] = 0.5;
          ctx.line(A, B, EDGE);
        }
      }
      O[0] = cx;
      O[1] = cy;
      O[2] = 0.5;
      ctx.arc(O, 0.5, 0, Math.PI * 2, MID, 16);
      ctx.arc(O, 0.25, 0, Math.PI * 2, EDGE, 16);
    }
  },
});
export default gearTrain;
