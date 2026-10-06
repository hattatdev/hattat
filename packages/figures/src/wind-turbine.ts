import { defineFigure, type Style } from "@hattatdev/core";

const O: [number, number, number] = [0, 0, 0],
  S: [number, number, number] = [0, 0, 0];
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };
const BLADE = [0.5, -0.25, 3, 0, 2.5, 0.5, 0.5, 0.25] as const;

/** Three tapered blades turn together. @example mount(host, windTurbine); */
export const windTurbine = defineFigure({
  name: "wind-turbine",
  category: "nature-abstract",
  intents: ["renewable energy", "sustainability", "climate", "clean power"],
  mood: ["light", "optimistic"],
  interaction: "Horizontal pointer movement rotates three wind turbine blades.",
  aspect: "1:1",
  a11y: { label: "A wind turbine with three blades that rotate with the pointer" },
  params: { turn: { input: "pointer.x", rest: 0.5 } },
  bounds: { x: -6.25, y: -10, width: 12, height: 12 },
  build(ctx, p) {
    O[0] = O[1] = -1;
    O[2] = 0;
    S[0] = S[1] = 2;
    S[2] = 0.5;
    ctx.box(O, S, EDGE);
    O[0] = O[1] = -0.25;
    O[2] = 0.5;
    S[0] = S[1] = 0.5;
    S[2] = 5;
    ctx.box(O, S, EDGE);
    O[0] = O[1] = -0.5;
    O[2] = 5;
    S[0] = S[1] = S[2] = 1;
    ctx.box(O, S, EDGE);
    const turn = ((p.turn ?? 0.5) - 0.5) * (p.intensity ?? 0.5) * Math.PI;
    for (let blade = 0; blade < 3; blade++) {
      const angle = (blade * Math.PI * 2) / 3 + turn + Math.PI / 2;
      const c = Math.cos(angle),
        s = Math.sin(angle);
      for (let layer = 0; layer < 2; layer++) {
        for (let i = 0; i < 4; i++) {
          const j = (i + 1) % 4,
            ax = BLADE[i * 2] ?? 0,
            az = BLADE[i * 2 + 1] ?? 0;
          const bx = BLADE[j * 2] ?? 0,
            bz = BLADE[j * 2 + 1] ?? 0;
          A[0] = ax * c - az * s;
          A[1] = B[1] = 0.75 + layer * 0.25;
          A[2] = 5.5 + ax * s + az * c;
          B[0] = bx * c - bz * s;
          B[2] = 5.5 + bx * s + bz * c;
          ctx.line(A, B, layer ? HI : MID);
          if (!layer) {
            B[0] = A[0];
            B[1] = 1;
            B[2] = A[2];
            ctx.line(A, B, EDGE);
          }
        }
      }
    }
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6,
        b = ((i + 1) * Math.PI) / 6;
      A[0] = Math.cos(a) * 0.5;
      A[1] = B[1] = 1;
      A[2] = 5.5 + Math.sin(a) * 0.5;
      B[0] = Math.cos(b) * 0.5;
      B[2] = 5.5 + Math.sin(b) * 0.5;
      ctx.line(A, B, HI);
    }
  },
});
export default windTurbine;
