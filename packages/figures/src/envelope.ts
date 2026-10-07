import { defineFigure } from "@hattatdev/core";
import { extrude, face, line, point, reset } from "./internal/solid.js";

const BODY = new Float64Array(64),
  LETTER = new Float64Array(8);
for (let corner = 0; corner < 4; corner++)
  for (let i = 0; i < 8; i++) {
    const a = (corner * Math.PI) / 2 + (i * Math.PI) / 14;
    BODY[(corner * 8 + i) * 2] = (corner < 2 ? 2.25 : -2.25) + Math.sin(a) * 0.25;
    BODY[(corner * 8 + i) * 2 + 1] =
      (corner === 0 || corner === 3 ? 3.25 : 0.25) + Math.cos(a) * 0.25;
  }
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
      angle = open * 2.1,
      c = Math.cos(angle),
      s = Math.sin(angle),
      top = 3.25 + open * 2;
    LETTER[0] = -2;
    LETTER[1] = top;
    LETTER[2] = 2;
    LETTER[3] = top;
    LETTER[4] = 2;
    LETTER[5] = top - 2.75;
    LETTER[6] = -2;
    LETTER[7] = top - 2.75;
    reset();
    for (let pass = 0; pass < 2; pass++) {
      extrude(ctx, BODY, 0, 0.25, 1, 1, pass);
      extrude(ctx, LETTER, -0.25, 0, 1, 2, pass);
      point(0, -2.5, 0.25, 3.5);
      point(1, 2.5, 0.25, 3.5);
      point(2, 0, 0.25 + 2 * s, 3.5 - 2 * c);
      if (!pass) {
        face(3);
        // Both sides of the paper are opaque when the flap turns over.
        point(0, 2.5, 0.25, 3.5);
        point(1, -2.5, 0.25, 3.5);
        face(3);
      } else {
        line(ctx, 0, 1, 0);
        line(ctx, 1, 2, 0);
        line(ctx, 2, 0, 0);
        for (let side = 0; side < 2; side++) {
          point(0, side ? 2.5 : -2.5, 0.25, 0.25);
          point(1, 0, 0.25, 1.5);
          line(ctx, 0, 1, 2);
        }
        for (let i = 0; i < 5; i++) {
          point(0, -1.5, 0, top - 0.5 - i * 0.5);
          point(1, i === 4 ? 0 : 1, 0, top - 0.5 - i * 0.5);
          line(ctx, 0, 1, 2);
        }
        for (let ring = 0; ring < 2; ring++)
          for (let i = 0; i < 32; i++) {
            const a = (i * Math.PI) / 16,
              b = ((i + 1) * Math.PI) / 16,
              r = ring ? 0.25 : 0.5,
              ta = 1.25 + Math.sin(a) * r,
              tb = 1.25 + Math.sin(b) * r;
            point(0, Math.cos(a) * r, 0.25 + ta * s, 3.5 - ta * c);
            point(1, Math.cos(b) * r, 0.25 + tb * s, 3.5 - tb * c);
            line(ctx, 0, 1, ring ? 2 : 1);
          }
      }
    }
  },
});
export default envelope;
