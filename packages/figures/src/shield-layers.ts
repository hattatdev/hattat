import { defineFigure, type Style } from "@hattatdev/core";

const OUTLINE = [-2, 5, 0, 5.75, 2, 5, 1.75, 2.5, 1, 1.25, 0, 0.5, -1, 1.25, -1.75, 2.5] as const;
const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const EDGE: Style = { tone: "edge" },
  HI: Style = { tone: "hi" },
  MID: Style = { tone: "mid" };

/** Three thick shield layers open on approach. @example mount(host, shieldLayers); */
export const shieldLayers = defineFigure({
  name: "shield-layers",
  category: "security",
  intents: ["protection", "compliance", "privacy", "defense in depth"],
  mood: ["secure", "calm"],
  interaction: "Pointer approach separates the three shield layers.",
  aspect: "1:1",
  a11y: { label: "Three protective shield layers that separate as the pointer approaches" },
  params: { open: { input: "pointer.inside", rest: 0 } },
  bounds: { x: -5.5, y: -8, width: 11, height: 11 },
  build(ctx, p) {
    const separation = (p.open ?? 0) * (p.intensity ?? 0.5) * 1.25;
    for (let layer = 0; layer < 3; layer++) {
      const y = (layer - 1) * (0.75 + separation),
        style = layer === 2 ? HI : layer === 1 ? EDGE : MID;
      for (let side = 0; side < 2; side++) {
        for (let i = 0; i < 8; i++) {
          const next = (i + 1) % 8;
          A[0] = OUTLINE[i * 2] as number;
          A[1] = B[1] = y + side * 0.25;
          A[2] = OUTLINE[i * 2 + 1] as number;
          B[0] = OUTLINE[next * 2] as number;
          B[2] = OUTLINE[next * 2 + 1] as number;
          ctx.line(A, B, style);
          if (side === 0) {
            B[0] = A[0];
            B[1] = y + 0.25;
            B[2] = A[2];
            ctx.line(A, B, style);
          }
        }
      }
    }
  },
});
export default shieldLayers;
