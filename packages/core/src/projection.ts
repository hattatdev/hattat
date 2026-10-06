import { failure } from "./errors.js";
import { COS_30 } from "./math.js";
import type { Scene } from "./scene.js";

/** Projects and clips into reusable storage; strings are only created at the SVG boundary. */
function decimal(n: number): number {
  return Math.round(n * 1000) / 1000;
}
export class Projection {
  readonly internalPlanes = new Float64Array(160 * 11);
  readonly internalIntervals = new Float64Array(322);
  readonly paths = ["", "", "", "", ""];
  platePath = "";
  visibleCount = 0;
  minX = Infinity;
  maxX = -Infinity;
  minY = Infinity;
  maxY = -Infinity;

  render(scene: Scene, measure = true): void {
    this.paths.fill("");
    this.platePath = "";
    this.visibleCount = 0;
    this.minX = Infinity;
    this.maxX = -Infinity;
    this.minY = Infinity;
    this.maxY = -Infinity;
    for (let i = 0; i < scene.plateCount; i++) {
      const o = i * 11;
      const p = i * 12;
      let d0 = 0,
        d1 = 0,
        d3 = 0;
      for (let j = 0; j < 4; j++) {
        const k = p + j * 3;
        const x = scene.plates[k] as number;
        const y = scene.plates[k + 1] as number;
        const z = scene.plates[k + 2] as number;
        this.internalPlanes[o + j * 2] = (x - y) * COS_30;
        this.internalPlanes[o + j * 2 + 1] = (x + y) / 2 - z;
        if (j === 0) d0 = x + y + z;
        if (j === 1) d1 = x + y + z;
        if (j === 3) d3 = x + y + z;
      }
      const x = this.internalPlanes[o] as number,
        y = this.internalPlanes[o + 1] as number;
      const ax = (this.internalPlanes[o + 2] as number) - x,
        ay = (this.internalPlanes[o + 3] as number) - y;
      const bx = (this.internalPlanes[o + 6] as number) - x,
        by = (this.internalPlanes[o + 7] as number) - y;
      const det = ax * by - ay * bx;
      this.internalPlanes[o + 8] = ((d1 - d0) * by - (d3 - d0) * ay) / det;
      this.internalPlanes[o + 9] = (ax * (d3 - d0) - bx * (d1 - d0)) / det;
      this.internalPlanes[o + 10] =
        d0 -
        (this.internalPlanes[o + 8] as number) * x -
        (this.internalPlanes[o + 9] as number) * y;
      this.platePath += `M${decimal(x as number)},${decimal(y as number)}L${decimal(this.internalPlanes[o + 2] as number)},${decimal(this.internalPlanes[o + 3] as number)}L${decimal(this.internalPlanes[o + 4] as number)},${decimal(this.internalPlanes[o + 5] as number)}L${decimal(this.internalPlanes[o + 6] as number)},${decimal(this.internalPlanes[o + 7] as number)}Z`;
    }
    for (let i = 0; i < scene.count; i++) {
      const o = i * 6;
      const l = scene.lines;
      const x = l[o] as number,
        y = l[o + 1] as number,
        z = l[o + 2] as number;
      const xx = l[o + 3] as number,
        yy = l[o + 4] as number,
        zz = l[o + 5] as number;
      const ax = (x - y) * COS_30,
        ay = (x + y) / 2 - z,
        bx = (xx - yy) * COS_30,
        by = (xx + yy) / 2 - zz;
      if (!Number.isFinite(ax + ay + bx + by))
        throw failure(4, "Non-finite geometry", "Use finite coordinates in build.");
      if (measure) {
        this.minX = Math.min(this.minX, ax, bx);
        this.maxX = Math.max(this.maxX, ax, bx);
        this.minY = Math.min(this.minY, ay, by);
        this.maxY = Math.max(this.maxY, ay, by);
      }
      let count = 1;
      this.internalIntervals[0] = 0;
      this.internalIntervals[1] = 1;
      for (let j = 0; j < scene.plateCount && count; j++) {
        const p = j * 11;
        let lo = 0,
          hi = 1;
        const q = this.internalPlanes;
        const da =
          x +
          y +
          z -
          ((q[p + 8] as number) * ax + (q[p + 9] as number) * ay + (q[p + 10] as number)) +
          1e-7;
        const db =
          xx +
          yy +
          zz -
          ((q[p + 8] as number) * bx + (q[p + 9] as number) * by + (q[p + 10] as number)) +
          1e-7;
        if (da >= 0 && db >= 0) continue;
        const sign =
          ((q[p + 2] as number) - (q[p] as number)) *
            ((q[p + 7] as number) - (q[p + 1] as number)) -
          ((q[p + 3] as number) - (q[p + 1] as number)) * ((q[p + 6] as number) - (q[p] as number));
        for (let k = 0; k < 4; k++) {
          const a = p + k * 2,
            b = p + ((k + 1) % 4) * 2;
          const ex = (q[b] as number) - (q[a] as number),
            ey = (q[b + 1] as number) - (q[a + 1] as number);
          const c0 =
            (ex * (ay - (q[a + 1] as number)) - ey * (ax - (q[a] as number))) * Math.sign(sign);
          const c1 =
            (ex * (by - (q[a + 1] as number)) - ey * (bx - (q[a] as number))) * Math.sign(sign);
          if (c0 < 0 && c1 < 0) {
            hi = -1;
            break;
          }
          if (c0 < 0) lo = Math.max(lo, c0 / (c0 - c1));
          if (c1 < 0) hi = Math.min(hi, c0 / (c0 - c1));
        }
        if (lo >= hi) continue;
        const dl = da + (db - da) * lo,
          dh = da + (db - da) * hi;
        if (dl >= 0 && dh >= 0) continue;
        if (dl >= 0) lo = Math.max(lo, -da / (db - da));
        if (dh >= 0) hi = Math.min(hi, -da / (db - da));
        for (let k = 0; k < count; k++) {
          const a = this.internalIntervals[k * 2] as number,
            b = this.internalIntervals[k * 2 + 1] as number;
          if (lo >= b || hi <= a) continue;
          if (lo <= a && hi >= b) {
            this.internalIntervals.copyWithin(k * 2, (k + 1) * 2, count * 2);
            count--;
            k--;
          } else if (lo <= a) this.internalIntervals[k * 2] = hi;
          else if (hi >= b) this.internalIntervals[k * 2 + 1] = lo;
          else {
            this.internalIntervals.copyWithin((k + 2) * 2, (k + 1) * 2, count * 2);
            this.internalIntervals[k * 2 + 1] = lo;
            this.internalIntervals[(k + 1) * 2] = hi;
            this.internalIntervals[(k + 1) * 2 + 1] = b;
            count++;
            k++;
          }
        }
      }
      const tone = scene.tones[i] as number;
      for (let j = 0; j < count; j++) {
        const a = this.internalIntervals[j * 2] as number,
          b = this.internalIntervals[j * 2 + 1] as number;
        if (b - a < 1e-6) continue;
        this.paths[tone] +=
          `M${decimal(ax + (bx - ax) * a)},${decimal(ay + (by - ay) * a)}L${decimal(ax + (bx - ax) * b)},${decimal(ay + (by - ay) * b)}`;
        this.visibleCount++;
      }
    }
  }
}
