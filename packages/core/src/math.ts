import type { SpringPreset } from "./types.js";
export const COS_30 = Math.sqrt(3) / 2;
/** Project into a reusable buffer. @example project([1, 0, 0], output); */
export function project(p: readonly number[], out: Float64Array, offset = 0): void {
  const x = p[0] ?? 0;
  const y = p[1] ?? 0;
  const z = p[2] ?? 0;
  out[offset] = (x - y) * COS_30;
  out[offset + 1] = (x + y) / 2 - z;
}
export const FREQUENCIES: Record<SpringPreset, number> = {
  snappy: 24,
  default: 18,
  gentle: 12,
  heavy: 10,
};
export interface Spring {
  value: number;
  velocity: number;
  target: number;
  frequency: number;
}
/** Exact critical damping, independent of frame rate. @example advance(spring, 1 / 60); */
export function advance(s: Spring, dt: number): boolean {
  const t = Math.min(0.064, Math.max(0, dt));
  const d = s.value - s.target;
  const b = s.velocity + s.frequency * d;
  const decay = Math.exp(-s.frequency * t);
  s.value = s.target + (d + b * t) * decay;
  s.velocity = (s.velocity - s.frequency * b * t) * decay;
  if (Math.abs(s.value - s.target) < 0.0001 && Math.abs(s.velocity) < 0.0001) {
    s.value = s.target;
    s.velocity = 0;
    return false;
  }
  return true;
}
