import { defineFigure } from "@hattatdev/core";
import { extrude, face, line, point, reset } from "./internal/solid.js";

const BODY = new Float64Array(32 * 2);
for (let corner = 0; corner < 4; corner++) {
  for (let i = 0; i < 8; i++) {
    const a = (corner * Math.PI) / 2 + (i * Math.PI) / 14;
    BODY[(corner * 8 + i) * 2] = (corner < 2 ? 2.5 : 0.5) + Math.sin(a) * 0.5;
    BODY[(corner * 8 + i) * 2 + 1] = (corner === 0 || corner === 3 ? 2.5 : 0.5) + Math.cos(a) * 0.5;
  }
}
/** A rounded metal lock opens on approach. @example mount(host, padlock); */
export const padlock = defineFigure({
  name: "padlock",
  category: "security",
  intents: ["login", "authentication", "privacy", "encryption"],
  mood: ["calm", "secure"],
  interaction: "Pointer approach lifts the padlock shackle.",
  aspect: "1:1",
  a11y: { label: "A padlock whose shackle opens as the pointer approaches" },
  params: { open: { input: "pointer.inside", rest: 0, spring: "heavy" } },
  bounds: { x: -4, y: -6.25, width: 9, height: 9 },
  build(ctx, p) {
    const lift = (p.open ?? 0) * (p.intensity ?? 0.5) * 1;
    reset();
    for (let pass = 0; pass < 2; pass++) {
      extrude(ctx, BODY, 0, 1.25, 1, 0, pass);
      // VIS-05: each section of the U band is an opaque plate, never a transparent loop.
      for (let i = 0; i < 26; i++) {
        const a = (Math.max(0, i - 1) * Math.PI) / 24,
          b = (Math.min(24, i) * Math.PI) / 24;
        for (let side = 0; side < 2; side++) {
          const y = 0.75 + side * 0.25;
          for (let v = 0; v < 4; v++) {
            const r = v < 2 ? 1.25 : 0.75,
              angle = v === 0 || v === 3 ? a : b,
              end = i === 0 || i === 25;
            point(
              v,
              1.5 + Math.cos(angle) * r,
              y,
              3.5 +
                lift +
                Math.sin(angle) * r -
                (end && (v === 0 || v === 3) ? (i === 0 ? 2 : 1) : 0),
            );
          }
          if (!pass) {
            // Reverse the front face to face the camera.
            if (side) {
              for (let v = 0; v < 4; v++) {
                const r = v < 2 ? 0.75 : 1.25,
                  angle = v === 0 || v === 3 ? a : b,
                  end = i === 0 || i === 25;
                point(
                  v,
                  1.5 + Math.cos(angle) * r,
                  y,
                  3.5 +
                    lift +
                    Math.sin(angle) * r -
                    (end && (v === 0 || v === 3) ? (i === 0 ? 2 : 1) : 0),
                );
              }
              face(4);
            }
          } else {
            line(ctx, 0, 1, side ? 0 : 2);
            line(ctx, 3, 2, side ? 1 : 2);
            if (i === 0 || i === 25) line(ctx, 0, 3, 1);
          }
        }
      }
      if (!pass) continue;
      // The keyway is a connected opening in a small circular escutcheon.
      for (let ring = 0; ring < 2; ring++) {
        const radius = ring ? 0.25 : 0.5,
          count = ring ? 20 : 32,
          start = ring ? -Math.PI / 3 : 0,
          span = ring ? (Math.PI * 5) / 3 : Math.PI * 2;
        for (let i = 0; i < count; i++) {
          const a = start + (i * span) / count,
            b = start + ((i + 1) * span) / count;
          point(0, 1.5 + Math.cos(a) * radius, 1.25, 1.5 + Math.sin(a) * radius);
          point(1, 1.5 + Math.cos(b) * radius, 1.25, 1.5 + Math.sin(b) * radius);
          line(ctx, 0, 1, ring ? 0 : 2);
        }
      }
      point(0, 1.625, 1.25, 1.5 - Math.sqrt(3) / 8);
      point(1, 1.625, 1.25, 1);
      point(2, 1.375, 1.25, 1);
      point(3, 1.375, 1.25, 1.5 - Math.sqrt(3) / 8);
      line(ctx, 0, 1, 0);
      line(ctx, 1, 2, 0);
      line(ctx, 2, 3, 0);
    }
  },
});
export default padlock;
