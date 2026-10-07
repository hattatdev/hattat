import type { BuildContext, Style } from "@hattatdev/core";

const A: [number, number, number] = [0, 0, 0],
  B: [number, number, number] = [0, 0, 0];
const V = new Float64Array(192),
  FACES = new Float64Array(6144),
  INTERVALS = new Float64Array(512);
const STYLES: readonly Style[] = [
  { tone: "hi" },
  { tone: "edge" },
  { tone: "mid" },
  { tone: "lo" },
];
let faceEnd = 0;

export function point(i: number, x: number, y: number, z: number): void {
  V[i * 3] = x;
  V[i * 3 + 1] = y;
  V[i * 3 + 2] = z;
}

// CODE-05, VIS-05: compile camera-facing opaque planes before emitting any lines.
export function face(n: number): void {
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
export function line(ctx: BuildContext, i: number, j: number, tone: number): void {
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

export function reset(): void {
  faceEnd = 0;
}

export function panel(
  ctx: BuildContext,
  corners: Float64Array | readonly number[],
  thickness: number,
  tone: number,
  pass: number,
): void {
  for (let side = 0; side < 4; side++) {
    const next = (side + 1) % 4;
    for (let k = 0; k < 4; k++) {
      const index = k === 0 || k === 3 ? side : next;
      point(
        k,
        corners[index * 3] as number,
        corners[index * 3 + 1] as number,
        (corners[index * 3 + 2] as number) - (k < 2 ? thickness : 0),
      );
    }
    if (!pass && thickness) face(4);
    if (pass) {
      line(ctx, 3, 2, tone);
      if (thickness) {
        line(ctx, 0, 1, 2);
        line(ctx, 0, 3, 2);
      }
    }
  }
  if (!pass) {
    for (let i = 0; i < 4; i++)
      point(
        i,
        corners[i * 3] as number,
        corners[i * 3 + 1] as number,
        corners[i * 3 + 2] as number,
      );
    face(4);
    // VIS-05: raised flaps can turn their underside toward the camera.
    for (let i = 0; i < 4; i++) {
      const j = 3 - i;
      point(
        i,
        corners[j * 3] as number,
        corners[j * 3 + 1] as number,
        (corners[j * 3 + 2] as number) - thickness,
      );
    }
    face(4);
  }
}

// FIG-01: private mesh support; definitions and authored profiles stay in their figure files.
export function extrude(
  ctx: BuildContext,
  profile: readonly number[] | Float64Array,
  back: number,
  front: number,
  axis: number,
  tone: number,
  pass: number,
): void {
  const n = profile.length / 2;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n,
      x = profile[i * 2] as number,
      y = profile[i * 2 + 1] as number,
      xx = profile[j * 2] as number,
      yy = profile[j * 2 + 1] as number;
    point(0, x, axis === 1 ? back : y, axis === 1 ? y : back);
    point(1, xx, axis === 1 ? back : yy, axis === 1 ? yy : back);
    point(2, xx, axis === 1 ? front : yy, axis === 1 ? yy : front);
    point(3, x, axis === 1 ? front : y, axis === 1 ? y : front);
    if (!pass) face(4);
    else {
      line(ctx, 3, 2, tone);
      const facing = axis === 1 ? xx - x - yy + y : yy - y - xx + x;
      if (facing > 0) {
        line(ctx, 0, 1, 2);
        const k = (i + n - 1) % n,
          px = x - (profile[k * 2] as number),
          py = y - (profile[k * 2 + 1] as number),
          dot = (px * (xx - x) + py * (yy - y)) / (Math.hypot(px, py) * Math.hypot(xx - x, yy - y));
        const previous = axis === 1 ? px - py : py - px;
        if (dot < 0.9 || previous <= 0) line(ctx, 0, 3, tone);
        const next = (j + 1) % n,
          nx = (profile[next * 2] as number) - xx,
          ny = (profile[next * 2 + 1] as number) - yy;
        if ((axis === 1 ? nx - ny : ny - nx) <= 0) line(ctx, 1, 2, tone);
      }
    }
  }
  if (!pass) {
    for (let i = 0; i < n; i++)
      point(
        i,
        profile[i * 2] as number,
        axis === 1 ? front : (profile[i * 2 + 1] as number),
        axis === 1 ? (profile[i * 2 + 1] as number) : front,
      );
    face(n);
  }
}
