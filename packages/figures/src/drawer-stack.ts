import { defineFigure, type Style } from "@hattatdev/core";

const ORIGIN: [number, number, number] = [0, 0, 0],
  SIZE: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  MID: Style = { tone: "mid" },
  HI: Style = { tone: "hi" };
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
    for (let i = 0; i < 4; i++) {
      const pull = ctx.falloff(open, 1 - i / 3) * intensity * 2;
      ORIGIN[0] = 0.5;
      ORIGIN[1] = pull;
      ORIGIN[2] = 0.5 + i * 1.5;
      SIZE[0] = 3;
      SIZE[1] = 3;
      SIZE[2] = 1;
      ctx.box(ORIGIN, SIZE, i === ctx.nearest(1 - open, 4) ? HI : MID);
      ORIGIN[0] = 1.5;
      ORIGIN[1] = 3 + pull;
      ORIGIN[2] += 0.5;
      SIZE[0] = 1.5;
      SIZE[1] = ORIGIN[1] + 0.5;
      SIZE[2] = ORIGIN[2];
      ctx.line(ORIGIN, SIZE, EDGE);
      ORIGIN[1] += 0.5;
      SIZE[0] = 2.5;
      ctx.line(ORIGIN, SIZE, EDGE);
      ORIGIN[0] = 2.5;
      SIZE[1] -= 0.5;
      ctx.line(ORIGIN, SIZE, EDGE);
    }
  },
});
export default drawerStack;
