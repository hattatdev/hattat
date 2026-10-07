import { type BuildContext, defineFigure, type Style } from "@hattatdev/core";

const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const V = new Float64Array(144),
  FACES = new Float64Array(6144),
  INTERVALS = new Float64Array(512),
  CORNERS = new Float64Array(8);
const STYLES: readonly Style[] = [
  { tone: "hi" },
  { tone: "edge" },
  { tone: "mid" },
  { tone: "lo" },
];
let faceEnd = 0,
  pass = 0;

function point(i: number, x: number, y: number, z: number): void {
  V[i * 3] = x;
  V[i * 3 + 1] = y;
  V[i * 3 + 2] = z;
}

// CODE-05, VIS-05: compile camera-facing opaque planes before emitting any lines.
function face(n: number): void {
  const ax = (V[3] as number) - (V[0] as number),
    ay = (V[4] as number) - (V[1] as number),
    az = (V[5] as number) - (V[2] as number),
    bx = (V[6] as number) - (V[0] as number),
    by = (V[7] as number) - (V[1] as number),
    bz = (V[8] as number) - (V[2] as number),
    nx = ay * bz - az * by,
    ny = az * bx - ax * bz,
    nz = ax * by - ay * bx,
    camera = nx + ny + nz;
  if (camera <= 1e-9) return;
  FACES[faceEnd++] = n;
  FACES[faceEnd++] = nx / camera;
  FACES[faceEnd++] = ny / camera;
  FACES[faceEnd++] = nz / camera;
  FACES[faceEnd++] =
    (nx * (V[0] as number) + ny * (V[1] as number) + nz * (V[2] as number)) / camera;
  const bounds = faceEnd;
  faceEnd += 4;
  FACES[bounds] = Infinity;
  FACES[bounds + 1] = Infinity;
  FACES[bounds + 2] = -Infinity;
  FACES[bounds + 3] = -Infinity;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n,
      x = (V[i * 3] as number) - (V[i * 3 + 1] as number),
      y = ((V[i * 3] as number) + (V[i * 3 + 1] as number)) / 2 - (V[i * 3 + 2] as number),
      dx = (V[j * 3] as number) - (V[j * 3 + 1] as number) - x,
      dy = ((V[j * 3] as number) + (V[j * 3 + 1] as number)) / 2 - (V[j * 3 + 2] as number) - y;
    FACES[bounds] = Math.min(FACES[bounds] as number, x);
    FACES[bounds + 1] = Math.min(FACES[bounds + 1] as number, y);
    FACES[bounds + 2] = Math.max(FACES[bounds + 2] as number, x);
    FACES[bounds + 3] = Math.max(FACES[bounds + 3] as number, y);
    FACES[faceEnd++] = -dy;
    FACES[faceEnd++] = dx;
    FACES[faceEnd++] = dy * x - dx * y;
  }
}

function emit(ctx: BuildContext, tone: number, low: number, high: number): void {
  const ax = A[0],
    ay = A[1],
    az = A[2],
    bx = B[0],
    by = B[1],
    bz = B[2];
  for (let i = 0; i < 3; i++) {
    const a = i === 0 ? ax : i === 1 ? ay : az,
      b = i === 0 ? bx : i === 1 ? by : bz;
    A[i] = a + (b - a) * low;
    B[i] = a + (b - a) * high;
  }
  ctx.line(A, B, STYLES[tone]);
  A[0] = ax;
  A[1] = ay;
  A[2] = az;
  B[0] = bx;
  B[1] = by;
  B[2] = bz;
}

// Subtract complete hidden intervals, including crossings with two visible endpoints.
function line(ctx: BuildContext, i: number, j: number, tone: number): void {
  for (let k = 0; k < 3; k++) {
    A[k] = V[i * 3 + k] as number;
    B[k] = V[j * 3 + k] as number;
  }
  const x = A[0] - A[1],
    y = (A[0] + A[1]) / 2 - A[2],
    dx = B[0] - B[1] - x,
    dy = (B[0] + B[1]) / 2 - B[2] - y,
    minX = Math.min(x, x + dx),
    minY = Math.min(y, y + dy),
    maxX = Math.max(x, x + dx),
    maxY = Math.max(y, y + dy);
  let count = 0;
  for (let f = 0; f < faceEnd; ) {
    const n = FACES[f] as number;
    if (
      maxX < (FACES[f + 5] as number) ||
      maxY < (FACES[f + 6] as number) ||
      minX > (FACES[f + 7] as number) ||
      minY > (FACES[f + 8] as number)
    ) {
      f += 9 + n * 3;
      continue;
    }
    let low = 0,
      high = 1;
    for (let k = -1; k < n; k++) {
      const p = f + 9 + k * 3;
      let value: number, change: number;
      if (k < 0) {
        value = (FACES[f + 4] as number) - 1e-7;
        change = 0;
        for (let a = 0; a < 3; a++) {
          const normal = FACES[f + 1 + a] as number;
          value -= normal * (A[a] as number);
          change -= normal * ((B[a] as number) - (A[a] as number));
        }
      } else {
        value = (FACES[p] as number) * x + (FACES[p + 1] as number) * y + (FACES[p + 2] as number);
        change = (FACES[p] as number) * dx + (FACES[p + 1] as number) * dy;
      }
      if (Math.abs(change) < 1e-12) {
        if (value < -1e-12) {
          high = low;
          break;
        }
      } else if (change > 0) low = Math.max(low, -value / change);
      else high = Math.min(high, -value / change);
      if (high <= low) break;
    }
    f += 9 + n * 3;
    if (high <= low) continue;
    let at = count;
    while (at > 0 && (INTERVALS[(at - 1) * 2] as number) > low) {
      INTERVALS[at * 2] = INTERVALS[(at - 1) * 2] as number;
      INTERVALS[at * 2 + 1] = INTERVALS[(at - 1) * 2 + 1] as number;
      at--;
    }
    INTERVALS[at * 2] = low;
    INTERVALS[at * 2 + 1] = high;
    count++;
  }
  let start = 0;
  for (let k = 0; k < count; k++) {
    const low = INTERVALS[k * 2] as number;
    if (low - start > 1e-6) emit(ctx, tone, start, low);
    start = Math.max(start, INTERVALS[k * 2 + 1] as number);
  }
  if (1 - start > 1e-6) emit(ctx, tone, start, 1);
}

function radial(
  i: number,
  x: number,
  y: number,
  z: number,
  r: number,
  h: number,
  angle: number,
  axis: number,
): void {
  point(
    i,
    x + r * Math.cos(angle),
    y + (axis ? h : r * Math.sin(angle)),
    z + (axis ? -r * Math.sin(angle) : h),
  );
}

function round(
  ctx: BuildContext,
  x: number,
  y: number,
  z: number,
  r0: number,
  r1: number,
  h: number,
  axis: number,
  n: number,
  tone: number,
  bottom = true,
): void {
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step,
      b = a + step;
    radial(0, x, y, z, r0, 0, a, axis);
    radial(1, x, y, z, r0, 0, b, axis);
    radial(2, x, y, z, r1, h, b, axis);
    radial(3, x, y, z, r1, h, a, axis);
    if (!pass) face(4);
    else {
      if (bottom) line(ctx, 0, 1, 2);
      line(ctx, 3, 2, tone);
      const angle = a + step / 2,
        previous = a - step / 2,
        slope = (r0 - r1) / h,
        sign = axis ? -1 : 1;
      if (
        (Math.cos(angle) + sign * Math.sin(angle) + slope) *
          (Math.cos(previous) + sign * Math.sin(previous) + slope) <
        0
      )
        line(ctx, 0, 3, tone);
    }
  }
  if (!pass) {
    for (let i = 0; i < n; i++) radial(i, x, y, z, r1, h, i * step, axis);
    face(n);
  }
}

function beam(ctx: BuildContext, ax: number, az: number, bx: number, bz: number): void {
  const length = Math.hypot(bx - ax, bz - az),
    nx = ((bz - az) / length) * 0.125,
    nz = ((ax - bx) / length) * 0.125;
  CORNERS[0] = ax - nx;
  CORNERS[1] = az - nz;
  CORNERS[2] = bx - nx;
  CORNERS[3] = bz - nz;
  CORNERS[4] = bx + nx;
  CORNERS[5] = bz + nz;
  CORNERS[6] = ax + nx;
  CORNERS[7] = az + nz;
  for (let side = 0; side < 4; side++) {
    const next = (side + 1) % 4;
    point(0, CORNERS[side * 2] as number, -0.25, CORNERS[side * 2 + 1] as number);
    point(1, CORNERS[next * 2] as number, -0.25, CORNERS[next * 2 + 1] as number);
    point(2, CORNERS[next * 2] as number, 0, CORNERS[next * 2 + 1] as number);
    point(3, CORNERS[side * 2] as number, 0, CORNERS[side * 2 + 1] as number);
    if (!pass) face(4);
    else {
      line(ctx, 0, 1, 2);
      line(ctx, 3, 2, 1);
      line(ctx, 0, 3, 2);
    }
  }
  if (!pass) {
    for (let i = 0; i < 4; i++) point(i, CORNERS[i * 2] as number, 0, CORNERS[i * 2 + 1] as number);
    face(4);
  }
}

/** A solid articulated lamp follows input with fixed-length arms. @example mount(host, deskLamp); */
export const deskLamp = defineFigure({
  name: "desk-lamp",
  category: "objects",
  intents: ["focus", "reading", "ideas", "workspace"],
  mood: ["thoughtful", "warm"],
  interaction: "Horizontal pointer movement guides the lamp head left and right.",
  aspect: "1:1",
  a11y: { label: "An articulated desk lamp that follows the pointer" },
  params: { aim: { input: "pointer.x", rest: 0.5, spring: "default" } },
  bounds: { x: -3.5, y: -6.75, width: 9, height: 9 },
  build(ctx, p) {
    // MOT-05: positive pointer displacement moves the head right, without stretching.
    const d = (2 * (p.aim ?? 0.5) - 1) * (p.intensity ?? 0.5),
      lower = ((108 - 6 * d) * Math.PI) / 180,
      upper = ((38 - 14 * d) * Math.PI) / 180,
      ex = Math.cos(lower) * 2.5,
      ez = 1 + Math.sin(lower) * 2.5,
      hx = ex + Math.cos(upper) * 2.75,
      hz = ez + Math.sin(upper) * 2.75;
    faceEnd = 0;
    for (pass = 0; pass < 2; pass++) {
      round(ctx, 0, 0, 0, 1.5, 1.5, 0.25, 0, 48, 0);
      round(ctx, 0, 0, 0.25, 1.5, 1.25, 0.25, 0, 48, 1, false);
      beam(ctx, 0, 0.5, 0, 1);
      beam(ctx, 0, 1, ex, ez);
      beam(ctx, ex, ez, hx, hz);
      beam(ctx, hx, hz, hx + 0.75, hz);
      for (let i = 0; i < 3; i++) {
        const x = i === 0 ? 0 : i === 1 ? ex : hx,
          z = i === 0 ? 1 : i === 1 ? ez : hz;
        round(ctx, x, 0, z, 0.25, 0.25, 0.25, 1, 24, 1);
        if (pass) {
          point(0, x - 0.125, 0.25, z);
          point(1, x + 0.125, 0.25, z);
          line(ctx, 0, 1, 3);
        }
      }
      round(ctx, hx + 0.75, 0, hz - 1.25, 1, 1, 0.25, 0, 32, 0);
      round(ctx, hx + 0.75, 0, hz - 1, 1, 0.5, 1.25, 0, 32, 0, false);
    }
  },
});
export default deskLamp;
