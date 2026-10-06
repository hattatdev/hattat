import { failure } from "./errors.js";
import type { BuildContext, Style, Tone, Vec3 } from "./types.js";

export const TONES: readonly Tone[] = ["hi", "edge", "mid", "lo", "accent"];
const EMPTY: Style = {};
/** Fixed-capacity scene. Allocate once on mount; reset reuses all numeric storage. */
export class Scene implements BuildContext {
  readonly unit = 0.5;
  readonly internalLines = new Float64Array(600 * 6);
  readonly internalTones = new Uint8Array(600);
  readonly internalPlates = new Float64Array(160 * 12);
  internalCount = 0;
  internalPlateCount = 0;
  private internalSeed = 1;
  internalReset(): void {
    this.internalCount = 0;
    this.internalPlateCount = 0;
    this.internalSeed = 1;
  }
  internalSegment(
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number,
    tone = 1,
  ): void {
    if (this.internalCount === 600)
      throw failure(4, "Scene exceeds 600 segments", "Use fewer segments or plates.");
    const i = this.internalCount * 6;
    this.internalLines[i] = ax;
    this.internalLines[i + 1] = ay;
    this.internalLines[i + 2] = az;
    this.internalLines[i + 3] = bx;
    this.internalLines[i + 4] = by;
    this.internalLines[i + 5] = bz;
    this.internalTones[this.internalCount++] = tone;
  }
  line(a: Vec3, b: Vec3, style = EMPTY): void {
    this.internalSegment(a[0], a[1], a[2], b[0], b[1], b[2], TONES.indexOf(style.tone ?? "edge"));
  }
  polyline(points: readonly Vec3[], style = EMPTY, closed = false): void {
    for (let i = 1; i < points.length; i++)
      this.line(points[i - 1] as Vec3, points[i] as Vec3, style);
    if (closed && points.length > 1)
      this.line(points[points.length - 1] as Vec3, points[0] as Vec3, style);
  }
  private internalFace(
    x: number,
    y: number,
    z: number,
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number,
  ): void {
    if (this.internalPlateCount === 160)
      throw failure(4, "Too many plates", "Use fewer segments or plates.");
    const i = this.internalPlateCount++ * 12;
    const p = this.internalPlates;
    p[i] = x;
    p[i + 1] = y;
    p[i + 2] = z;
    p[i + 3] = x + ax;
    p[i + 4] = y + ay;
    p[i + 5] = z + az;
    p[i + 6] = x + ax + bx;
    p[i + 7] = y + ay + by;
    p[i + 8] = z + az + bz;
    p[i + 9] = x + bx;
    p[i + 10] = y + by;
    p[i + 11] = z + bz;
  }
  box(o: Vec3, size: Vec3, style = EMPTY): void {
    const [x, y, z] = o;
    const [w, d, h] = size;
    const t = TONES.indexOf(style.tone ?? "edge");
    for (let k = 0; k < 2; k++) {
      const zz = z + k * h;
      this.internalSegment(x, y, zz, x + w, y, zz, t);
      this.internalSegment(x + w, y, zz, x + w, y + d, zz, t);
      this.internalSegment(x + w, y + d, zz, x, y + d, zz, t);
      this.internalSegment(x, y + d, zz, x, y, zz, t);
      for (let j = 0; j < 2; j++)
        this.internalSegment(x + k * w, y + j * d, z, x + k * w, y + j * d, z + h, t);
    }
    if (style.plate !== false) {
      this.internalFace(x, y, z + h, w, 0, 0, 0, d, 0);
      this.internalFace(x + w, y, z, 0, d, 0, 0, 0, h);
      this.internalFace(x, y + d, z, w, 0, 0, 0, 0, h);
    }
  }
  cylinder(o: Vec3, r: number, h: number, style = EMPTY, n = 16): void {
    const [x, y, z] = o;
    const t = TONES.indexOf(style.tone ?? "edge");
    for (let i = 0; i < n; i++) {
      const a = (i * Math.PI * 2) / n;
      const b = ((i + 1) * Math.PI * 2) / n;
      const ax = x + Math.cos(a) * r;
      const ay = y + Math.sin(a) * r;
      const bx = x + Math.cos(b) * r;
      const by = y + Math.sin(b) * r;
      this.internalSegment(ax, ay, z, bx, by, z, t);
      this.internalSegment(ax, ay, z + h, bx, by, z + h, t);
      if (i % 4 === 0) this.internalSegment(ax, ay, z, ax, ay, z + h, t);
    }
  }
  prism(points: readonly Vec3[], h: number, style = EMPTY): void {
    const t = TONES.indexOf(style.tone ?? "edge");
    for (let i = 0; i < points.length; i++) {
      const a = points[i] as Vec3;
      const b = points[(i + 1) % points.length] as Vec3;
      this.line(a, b, style);
      this.internalSegment(a[0], a[1], a[2] + h, b[0], b[1], b[2] + h, t);
      this.internalSegment(a[0], a[1], a[2], a[0], a[1], a[2] + h, t);
    }
  }
  grid(o: Vec3, size: number, n: number, style = EMPTY): void {
    const [x, y, z] = o;
    const t = TONES.indexOf(style.tone ?? "edge");
    for (let i = 0; i <= n; i++) {
      const v = (size * i) / n;
      this.internalSegment(x + v, y, z, x + v, y + size, z, t);
      this.internalSegment(x, y + v, z, x + size, y + v, z, t);
    }
  }
  arc(o: Vec3, r: number, start: number, end: number, style = EMPTY, n = 16): void {
    const [x, y, z] = o;
    const t = TONES.indexOf(style.tone ?? "edge");
    for (let i = 0; i < n; i++) {
      const a = start + ((end - start) * i) / n;
      const b = start + ((end - start) * (i + 1)) / n;
      this.internalSegment(
        x + Math.cos(a) * r,
        y + Math.sin(a) * r,
        z,
        x + Math.cos(b) * r,
        y + Math.sin(b) * r,
        z,
        t,
      );
    }
  }
  curve(a: Vec3, c: Vec3, b: Vec3, style = EMPTY, n = 16): void {
    const t = TONES.indexOf(style.tone ?? "edge");
    let x = a[0],
      y = a[1],
      z = a[2];
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      const v = 1 - u;
      const nx = v * v * a[0] + 2 * v * u * c[0] + u * u * b[0];
      const ny = v * v * a[1] + 2 * v * u * c[1] + u * u * b[1];
      const nz = v * v * a[2] + 2 * v * u * c[2] + u * u * b[2];
      this.internalSegment(x, y, z, nx, ny, nz, t);
      x = nx;
      y = ny;
      z = nz;
    }
  }
  repeat(n: number, callback: (index: number) => void): void {
    for (let i = 0; i < n; i++) callback(i);
  }
  falloff(v: number, c: number, r = 0.4): number {
    return Math.max(0, 1 - Math.abs(v - c) / r);
  }
  nearest(v: number, n: number): number {
    return Math.round(Math.max(0, Math.min(1, v)) * (n - 1));
  }
  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
  random(): number {
    this.internalSeed = (Math.imul(1664525, this.internalSeed) + 1013904223) >>> 0;
    return this.internalSeed / 4294967296;
  }
}
