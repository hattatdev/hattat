import { defineFigure, type Style } from "@hattatdev/core";

const ORIGIN: [number, number, number] = [0, 0, 0],
  SIZE: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  MID: Style = { tone: "mid" },
  HI: Style = { tone: "hi" };
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
/** A cabinet whose drawers open toward pointer height. @example mount(host, drawerStack); */
export const drawerStack = defineFigure({
  name: "drawer-stack",
  category: "objects",
  intents: ["storage", "archive", "files", "organize"],
  mood: ["calm", "orderly"],
  interaction: "Pointer height opens the nearest drawer and its neighbors less.",
  aspect: "1:1",
  a11y: { label: "A cabinet of drawers that open toward the pointer" },
  params: { open: { input: "pointer.y", rest: 0.5 } },
  bounds: { x: -7, y: -8.25, width: 13.5, height: 13.5 },
  build(ctx, p) {
    const intensity = p.intensity ?? 0.5,
      open = p.open ?? 0.5;
    SIZE[0] = 4;
    SIZE[1] = 3;
    SIZE[2] = 6.5;
    ORIGIN[0] = 0;
    ORIGIN[1] = 0;
    ORIGIN[2] = 0;
    ctx.box(ORIGIN, SIZE, EDGE);
    for (let foot = 0; foot < 4; foot++) {
      ORIGIN[0] = foot % 2 ? 3.25 : 0.25;
      ORIGIN[1] = foot < 2 ? 0.25 : 2.25;
      ORIGIN[2] = -0.5;
      SIZE[0] = SIZE[1] = SIZE[2] = 0.5;
      ctx.box(ORIGIN, SIZE, MID);
    }
    for (let i = 0; i < 4; i++) {
      const pull = ctx.falloff(open, 1 - i / 3) * intensity * 2;
      ORIGIN[0] = 0.5;
      ORIGIN[1] = pull;
      ORIGIN[2] = 0.5 + i * 1.5;
      SIZE[0] = 3;
      SIZE[1] = 3;
      SIZE[2] = 0.25;
      ctx.box(ORIGIN, SIZE, MID);
      // A drawer is an open tray, with a floor and four opaque walls.
      for (let side = 0; side < 4; side++) {
        ORIGIN[0] = side === 1 ? 3.25 : 0.5;
        ORIGIN[1] = pull + (side === 3 ? 2.75 : side < 2 ? 0.25 : 0);
        ORIGIN[2] = 0.75 + i * 1.5;
        SIZE[0] = side < 2 ? 0.25 : 3;
        SIZE[1] = side < 2 ? 2.5 : 0.25;
        SIZE[2] = 0.75;
        ctx.box(ORIGIN, SIZE, i === ctx.nearest(1 - open, 4) ? HI : MID);
      }
      // VIS-09: an open bent-metal pull has a real gap behind its grip.
      for (let side = 0; side < 2; side++) {
        A[0] = B[0] = side ? 2.5 : 1.5;
        A[1] = 3 + pull;
        B[1] = 3.25 + pull;
        A[2] = B[2] = 1 + i * 1.5;
        ctx.line(A, B, EDGE);
      }
      A[0] = 1.5;
      B[0] = 2.5;
      A[1] = B[1] = 3.25 + pull;
      ctx.line(A, B, EDGE);
      A[2] = B[2] = 1.25 + i * 1.5;
      ctx.line(A, B, EDGE);
      for (let side = 0; side < 2; side++) {
        A[0] = B[0] = side ? 2.5 : 1.5;
        A[2] = 1 + i * 1.5;
        B[2] = 1.25 + i * 1.5;
        ctx.line(A, B, EDGE);
      }
      // A recessed label holder stays on the drawer face, below its rim.
      A[0] = 1.5;
      B[0] = 2.5;
      A[1] = B[1] = 3 + pull;
      A[2] = B[2] = 0.75 + i * 1.5;
      ctx.line(A, B, MID);
    }
  },
});
export default drawerStack;
