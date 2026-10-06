/** Reusable three-dimensional coordinate. @example const p: Vec3 = [0, 0, 1]; */
export type Vec3 = readonly [number, number, number];
/** Line tones, with at most one highlighted element. */
export type Tone = "hi" | "edge" | "mid" | "lo" | "accent";
export interface Style {
  tone?: Tone;
  plate?: boolean;
}
export type SpringPreset = "snappy" | "default" | "gentle" | "heavy";
export type SignalName =
  | "pointer.x"
  | "pointer.y"
  | "pointer.inside"
  | "pointer.pressed"
  | "focus"
  | "key"
  | "time";
export type InputMapping = Readonly<Record<string, SignalName>>;
export interface Theme {
  plate?: string;
  hi?: string;
  edge?: string;
  mid?: string;
  lo?: string;
  accent?: string;
  stroke?: number;
}
/** Shared options. @example mount(host, figure, { intensity: 0.6 }); */
export interface FigureOptions {
  intensity?: number;
  input?: SignalName | "pointer" | InputMapping;
  renderer?: "svg" | "canvas" | "auto";
  theme?: "mono" | Theme;
  autoplay?: boolean;
  motion?: "auto" | "reduce" | "full";
  label?: string;
  interactive?: boolean;
}
export interface Parameter {
  input: SignalName;
  spring?: SpringPreset;
  rest?: number;
}
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
/** Original metadata and pure build function. @example defineFigure(definition); */
export interface FigureDefinition<Name extends string = string> {
  name: Name;
  category: string;
  intents: readonly string[];
  mood: readonly string[];
  interaction: string;
  aspect: "1:1" | "4:3" | "16:9" | "3:4";
  a11y: { readonly label: string };
  params: Readonly<Record<string, Parameter>>;
  /** Fixed projected bounds include ≥8% padding in every accepted pose. */
  bounds: Bounds;
  build(ctx: BuildContext, p: Readonly<Record<string, number>>): void;
}
export interface BuildContext {
  readonly unit: number;
  line(a: Vec3, b: Vec3, style?: Style): void;
  polyline(points: readonly Vec3[], style?: Style, closed?: boolean): void;
  box(origin: Vec3, size: Vec3, style?: Style): void;
  cylinder(origin: Vec3, radius: number, height: number, style?: Style, segments?: number): void;
  prism(points: readonly Vec3[], height: number, style?: Style): void;
  grid(origin: Vec3, size: number, count: number, style?: Style): void;
  arc(
    center: Vec3,
    radius: number,
    start: number,
    end: number,
    style?: Style,
    segments?: number,
  ): void;
  curve(a: Vec3, control: Vec3, b: Vec3, style?: Style, segments?: number): void;
  repeat(count: number, callback: (index: number) => void): void;
  falloff(value: number, center: number, radius?: number): number;
  nearest(value: number, count: number): number;
  lerp(a: number, b: number, t: number): number;
  random(): number;
}
export interface FigureHandle {
  /** Apply partial options. @example handle.update({ intensity: 0.8 }); */
  update(options: FigureOptions): void;
  /** Release owned DOM/work, idempotently. @example handle.destroy(); */
  destroy(): void;
}
