import { defineFigure, type Style } from "@hattatdev/core";

const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const MID: Style = { tone: "mid" },
  HI: Style = { tone: "hi" };
function height(x: number, y: number, px: number, py: number, strength: number): number {
  const r = x * x + y * y,
    d = (x - px) ** 2 + (y - py) ** 2;
  return (
    0.25 + Math.exp(-r / 4) * 1.25 - Math.exp(-r / 12) * 0.25 + Math.exp(-d / 3) * strength * 1.5
  );
}
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
      for (let col = 0; col < 20; col++)
        for (let axis = 0; axis < 2; axis++) {
          // Sampling is derived from legal grid extents; nominal line spacing remains 0.75.
          A[0] = axis ? (row - 4) * 0.75 : -3 + (col * 6) / 20;
          A[1] = axis ? -3 + (col * 6) / 20 : (row - 4) * 0.75;
          B[0] = A[0] + (axis ? 0 : 6 / 20);
          B[1] = A[1] + (axis ? 6 / 20 : 0);
          A[2] = height(A[0], A[1], px, py, intensity * inside);
          B[2] = height(B[0], B[1], px, py, intensity * inside);
          ctx.line(A, B, row === 4 ? HI : MID);
        }
  },
});
export default waveField;
