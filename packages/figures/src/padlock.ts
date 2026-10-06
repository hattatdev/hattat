import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };
const SHACKLE = new Float64Array(17 * 2);
for (let i = 0; i <= 16; i++) {
  SHACKLE[i * 2] = Math.cos((Math.PI * i) / 16);
  SHACKLE[i * 2 + 1] = Math.sin((Math.PI * i) / 16);
}
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
    for (let layer = 0; layer < 2; layer++) {
      const y = 0.5 + layer * 0.5;
      for (let i = 0; i < 16; i++) {
        A[0] = 1.5 + (SHACKLE[i * 2] as number);
        A[1] = y;
        A[2] = 3.5 + lift + (SHACKLE[i * 2 + 1] as number);
        B[0] = 1.5 + (SHACKLE[(i + 1) * 2] as number);
        B[1] = y;
        B[2] = 3.5 + lift + (SHACKLE[(i + 1) * 2 + 1] as number);
        ctx.line(A, B, HI);
      }
      A[0] = 0.5;
      A[1] = y;
      A[2] = 3.5 + lift;
      B[0] = 0.5;
      B[1] = y;
      B[2] = 2.5 + lift;
      ctx.line(A, B, HI);
      A[0] = 2.5;
      B[0] = 2.5;
      B[2] = 2.5;
      ctx.line(A, B, HI);
    }
    for (let i = 0; i <= 16; i += 8) {
      A[0] = B[0] = 1.5 + (SHACKLE[i * 2] as number);
      A[1] = 0.5;
      B[1] = 1;
      A[2] = B[2] = 3.5 + lift + (SHACKLE[i * 2 + 1] as number);
      ctx.line(A, B, MID);
    }
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12,
        b = ((i + 1) * Math.PI * 2) / 12;
      A[0] = 1.5 + Math.cos(a) * 0.25;
      A[1] = 1.5;
      A[2] = 1.75 + Math.sin(a) * 0.25;
      B[0] = 1.5 + Math.cos(b) * 0.25;
      B[1] = 1.5;
      B[2] = 1.75 + Math.sin(b) * 0.25;
      ctx.line(A, B, MID);
    }
    A[0] = 1.5;
    A[1] = 1.5;
    A[2] = 1.5;
    B[0] = 1.5;
    B[1] = 1.5;
    B[2] = 1;
    ctx.line(A, B, EDGE);
  },
});
export default padlock;
