import { defineFigure } from "@hattatdev/core";
import { extrude, panel, reset } from "./internal/solid.js";

const FLOOR = [-2, -1.5, 2, -1.5, 2, 1.5, -2, 1.5] as const;
const WALL = new Float64Array(8),
  FLAP = new Float64Array(12);
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
    const angle = 0.35 + (p.open ?? 0) * (p.intensity ?? 0.5) * 0.8;
    reset();
    for (let pass = 0; pass < 2; pass++) {
      extrude(ctx, FLOOR, 0, 0.25, 2, 2, pass);
      for (let side = 0; side < 4; side++) {
        const alongX = side < 2,
          sign = side % 2 ? 1 : -1;
        const x0 = alongX ? -2 : sign > 0 ? 1.75 : -2,
          x1 = alongX ? 2 : sign > 0 ? 2 : -1.75,
          y0 = alongX ? (sign > 0 ? 1.25 : -1.5) : -1.25,
          y1 = alongX ? (sign > 0 ? 1.5 : -1.25) : 1.25;
        WALL[0] = x0;
        WALL[1] = y0;
        WALL[2] = x1;
        WALL[3] = y0;
        WALL[4] = x1;
        WALL[5] = y1;
        WALL[6] = x0;
        WALL[7] = y1;
        extrude(ctx, WALL, 0.25, 2.5, 2, 1, pass);
        // VIS-05: the closed flap surface hides the floor and neighboring folds.
        const length = alongX ? 1.5 : 2,
          dx = Math.cos(angle) * length,
          dz = Math.sin(angle) * length;
        for (let i = 0; i < 4; i++) {
          const out = i === 1 || i === 2;
          FLAP[i * 3] = alongX ? (i < 2 ? -2 : 2) : sign * (2 + (out ? dx : 0));
          FLAP[i * 3 + 1] = alongX ? sign * (1.5 + (out ? dx : 0)) : i < 2 ? -1.25 : 1.25;
          FLAP[i * 3 + 2] = 2.5 + (out ? dz : 0);
        }
        // Order each top surface counterclockwise in its projected plane.
        if (sign * (alongX ? -1 : 1) < 0) {
          for (let k = 0; k < 3; k++) {
            const t = FLAP[3 + k] as number;
            FLAP[3 + k] = FLAP[9 + k] as number;
            FLAP[9 + k] = t;
          }
        }
        panel(ctx, FLAP, 0.25, 0, pass);
      }
    }
  },
});
export default emptyBox;
