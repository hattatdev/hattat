import { defineFigure, type Style } from "@hattatdev/core";

const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const MID: Style = { tone: "mid" },
  HI: Style = { tone: "hi" };
const HEIGHTS = new Float64Array(81);
/** A wave responds to pointer position. @example mount(host, waveField); */
export const waveField = defineFigure({
  name: "wave-field",
  category: "nature-abstract",
  intents: ["signals", "communication", "exploration", "analytics"],
  mood: ["calm", "fluid"],
  interaction: "Pointer position raises a local wave that settles when input ends.",
  aspect: "1:1",
  a11y: { label: "An isometric grid with a wave beneath the pointer" },
  params: {
    x: { input: "pointer.x", rest: 0.5 },
    y: { input: "pointer.y", rest: 0.5 },
    inside: { input: "pointer.inside", rest: 0 },
  },
  bounds: { x: -6.75, y: -6.75, width: 13.5, height: 13.5 },
  build(ctx, p) {
    const intensity = p.intensity ?? 0.5,
      inside = p.inside ?? 0;
    const px = ((p.x ?? 0.5) - 0.5) * 6,
      py = ((p.y ?? 0.5) - 0.5) * 6;
    for (let row = 0; row < 9; row++)
      for (let col = 0; col < 9; col++) {
        const x = (col - 4) * 0.75,
          y = (row - 4) * 0.75,
          radius = Math.hypot(x, y),
          distance = (x - px) ** 2 + (y - py) ** 2;
        // A quiet permanent crest makes the resting illustration read as a wave.
        HEIGHTS[row * 9 + col] =
          0.25 +
          Math.cos(radius * 1.25) * Math.exp((-radius * radius) / 12) * 0.75 +
          Math.exp(-distance / 3) * intensity * inside * 1.5;
      }
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 8; col++) {
        for (let axis = 0; axis < 2; axis++) {
          A[0] = -3 + (axis ? row : col) * 0.75;
          A[1] = -3 + (axis ? col : row) * 0.75;
          B[0] = A[0] + (axis ? 0 : 0.75);
          B[1] = A[1] + (axis ? 0.75 : 0);
          A[2] = HEIGHTS[axis ? col * 9 + row : row * 9 + col] as number;
          B[2] = HEIGHTS[axis ? (col + 1) * 9 + row : row * 9 + col + 1] as number;
          ctx.line(A, B, row === 4 ? HI : MID);
        }
      }
    }
  },
});
export default waveField;
