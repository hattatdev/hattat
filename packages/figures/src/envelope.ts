import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };

/** An envelope opens to reveal a letter. @example mount(host, envelope); */
export const envelope = defineFigure({
  name: "envelope",
  category: "ui-concepts",
  intents: ["contact", "inbox", "newsletter", "messages"],
  mood: ["welcoming", "personal"],
  interaction: "Pointer approach lifts the envelope flap and reveals a letter.",
  aspect: "1:1",
  a11y: { label: "An envelope whose flap opens to reveal a letter" },
  params: { open: { input: "pointer.inside", rest: 0 } },
  bounds: { x: -5.5, y: -8.25, width: 11.5, height: 11.5 },
  build(ctx, p) {
    const open = (p.open ?? 0) * (p.intensity ?? 0.5),
      angle = open * 2.1;
    const c = Math.cos(angle),
      s = Math.sin(angle),
      top = 3.25 + open * 2;
    O[0] = -2.5;
    O[1] = -0.25;
    O[2] = 0;
    S[0] = 5;
    S[1] = 0.5;
    S[2] = 3.5;
    ctx.box(O, S, EDGE);
    O[0] = -2;
    O[1] = -0.25;
    O[2] = 0.5 + open * 2;
    S[0] = 4;
    S[1] = 0.25;
    S[2] = 2.75;
    ctx.box(O, S, MID);
    for (let side = 0; side < 2; side++) {
      A[0] = side ? 2.5 : -2.5;
      A[1] = B[1] = 0.25;
      A[2] = 0;
      B[0] = 0;
      B[2] = 1.5;
      ctx.line(A, B, MID);
    }
    for (let layer = 0; layer < 2; layer++) {
      const y = 0.25 + layer * 0.25;
      for (let edge = 0; edge < 3; edge++) {
        const ax = edge === 0 ? -2.5 : edge === 1 ? 2.5 : 0;
        const bx = edge === 0 ? 2.5 : edge === 1 ? 0 : -2.5;
        A[0] = ax;
        A[1] = y + (edge === 2 ? 2 * s : 0);
        A[2] = 3.5 - (edge === 2 ? 2 * c : 0);
        B[0] = bx;
        B[1] = y + (edge === 1 ? 2 * s : 0);
        B[2] = 3.5 - (edge === 1 ? 2 * c : 0);
        ctx.line(A, B, HI);
        if (!layer) {
          B[0] = A[0];
          B[1] = A[1] + 0.25;
          B[2] = A[2];
          ctx.line(A, B, EDGE);
        }
      }
    }
    for (let i = 0; i < 5; i++) {
      A[0] = -1.5;
      A[1] = B[1] = 0;
      A[2] = B[2] = top - 0.5 - i * 0.5;
      B[0] = i === 4 ? 0 : 0.75;
      ctx.line(A, B, MID);
    }
    for (let i = 0; i < 4; i++) {
      A[0] = i === 0 || i === 3 ? 1 : 1.5;
      A[1] = B[1] = 0;
      A[2] = top - (i < 2 ? 0.5 : 1);
      const j = (i + 1) % 4;
      B[0] = j === 0 || j === 3 ? 1 : 1.5;
      B[2] = top - (j < 2 ? 0.5 : 1);
      ctx.line(A, B, MID);
    }
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8,
        b = ((i + 1) * Math.PI) / 8;
      const ta = 1.25 + Math.sin(a) * 0.25,
        tb = 1.25 + Math.sin(b) * 0.25;
      A[0] = Math.cos(a) * 0.25;
      A[1] = 0.5 + ta * s;
      A[2] = 3.5 - ta * c;
      B[0] = Math.cos(b) * 0.25;
      B[1] = 0.5 + tb * s;
      B[2] = 3.5 - tb * c;
      ctx.line(A, B, MID);
    }
  },
});
export default envelope;
