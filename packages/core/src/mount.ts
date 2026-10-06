import { failure } from "./errors.js";
import { advance, FREQUENCIES, type Spring } from "./math.js";
import { normalize, type Options } from "./options.js";
import { Projection } from "./projection.js";
import { Scene, TONES } from "./scene.js";
import { register, unregister, wake } from "./scheduler.js";
import { DARK, LIGHT, renderSVG } from "./svg.js";
import type { FigureDefinition, FigureHandle, FigureOptions, SignalName } from "./types.js";

const OWNERS = new WeakMap<HTMLElement, Instance>();
class Instance implements FigureHandle {
  readonly scene = new Scene();
  readonly projection = new Projection();
  readonly values: Record<string, number> = { intensity: 0.5 };
  readonly signals: Record<SignalName, number> = {
    "pointer.x": 0.5,
    "pointer.y": 0.5,
    "pointer.inside": 0,
    "pointer.pressed": 0,
    focus: 0,
    key: 0.5,
    time: 0.5,
  };
  readonly names: string[];
  readonly springs: Spring[];
  readonly svg: SVGSVGElement;
  readonly paths: SVGPathElement[];
  readonly reduced: MediaQueryList | undefined;
  readonly dark: MediaQueryList | undefined;
  readonly resize: ResizeObserver | undefined;
  readonly intersection: IntersectionObserver | undefined;
  options: Options;
  raw: FigureOptions;
  active = false;
  destroyed = false;
  visible = true;
  dirty = true;
  private bounds: DOMRect;
  private previousAspect: string;
  private previousTab: string | null;
  constructor(
    readonly host: HTMLElement,
    readonly figure: FigureDefinition,
    options: FigureOptions,
  ) {
    this.options = normalize(figure, options);
    this.raw = { ...options };
    this.bounds = host.getBoundingClientRect();
    this.previousAspect = host.style.aspectRatio;
    this.previousTab = host.getAttribute("tabindex");
    this.names = Object.keys(figure.params);
    this.springs = this.names.map((name) => {
      const p = figure.params[name];
      return {
        value: p?.rest ?? 0.5,
        target: p?.rest ?? 0.5,
        velocity: 0,
        frequency: FREQUENCIES[p?.spring ?? "default"],
      };
    });
    for (let i = 0; i < this.names.length; i++)
      this.values[this.names[i] as string] = (this.springs[i] as Spring).value;
    const template = host.ownerDocument.createElement("template");
    // Trusted library-generated SVG; the accessibility label is escaped by renderSVG.
    template.innerHTML = renderSVG(figure, this.options.intensity, this.options.label);
    this.svg = template.content.firstElementChild as unknown as SVGSVGElement;
    this.paths = Array.from(this.svg.querySelectorAll("path"));
    host.style.aspectRatio = figure.aspect.replace(":", "/");
    host.append(this.svg);
    const view = host.ownerDocument.defaultView;
    this.reduced = view?.matchMedia?.("(prefers-reduced-motion: reduce)");
    this.dark = view?.matchMedia?.("(prefers-color-scheme: dark)");
    this.reduced?.addEventListener("change", this.preference);
    this.dark?.addEventListener("change", this.preference);
    host.addEventListener("pointermove", this.pointer);
    host.addEventListener("pointerdown", this.pointer);
    host.addEventListener("pointerup", this.pointer);
    host.addEventListener("pointerleave", this.leave);
    host.addEventListener("pointercancel", this.leave);
    host.addEventListener("focus", this.focus);
    host.addEventListener("blur", this.leave);
    host.addEventListener("keydown", this.key);
    view?.addEventListener("scroll", this.measure, true);
    this.resize =
      typeof ResizeObserver === "function" ? new ResizeObserver(this.measure) : undefined;
    this.resize?.observe(host);
    this.intersection =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(this.observe)
        : undefined;
    this.intersection?.observe(host);
    register(this);
    this.configure();
    this.draw();
    if (this.options.autoplay && !this.frozen) wake(this);
  }
  private get frozen(): boolean {
    return (
      this.options.motion === "reduce" ||
      (this.options.motion === "auto" && !!this.reduced?.matches)
    );
  }
  private configure(): void {
    this.svg.setAttribute("aria-label", this.options.label);
    if (this.options.interactive) this.host.setAttribute("tabindex", this.previousTab ?? "0");
    else if (this.previousTab === null) this.host.removeAttribute("tabindex");
    else this.host.setAttribute("tabindex", this.previousTab);
    const palette = this.dark?.matches ? DARK : LIGHT;
    for (let i = 0; i < TONES.length; i++) {
      const tone = TONES[i] as keyof typeof LIGHT;
      this.paths[i + 1]?.setAttribute("stroke", `var(--hattat-${tone},${palette[tone]})`);
    }
    this.paths[0]?.setAttribute("fill", `var(--hattat-plate,${palette.plate})`);
    for (const name of ["plate", "hi", "edge", "mid", "lo", "accent", "stroke"] as const) {
      const value = this.options.theme[name];
      if (value === undefined) this.svg.style.removeProperty(`--hattat-${name}`);
      else this.svg.style.setProperty(`--hattat-${name}`, String(value));
    }
    this.values.intensity = this.options.intensity;
    this.dirty = true;
  }
  private draw(): void {
    this.scene.reset();
    this.figure.build(this.scene, this.values);
    if (this.scene.count > 400)
      throw failure(
        4,
        "SVG figure exceeds 400 segments",
        "Simplify geometry; Canvas support is a later phase.",
      );
    this.projection.render(this.scene);
    this.paths[0]?.setAttribute("d", this.projection.platePath);
    for (let i = 0; i < 5; i++)
      this.paths[i + 1]?.setAttribute("d", this.projection.paths[i] ?? "");
    this.dirty = false;
  }
  step(dt: number, time: number): boolean {
    if (!this.visible) return false;
    let moving = false;
    const demo =
      this.options.autoplay &&
      this.signals["pointer.inside"] === 0 &&
      this.signals.focus === 0 &&
      !this.frozen;
    for (let i = 0; i < this.names.length; i++) {
      const name = this.names[i] as string;
      const spring = this.springs[i] as Spring;
      if (demo) {
        spring.target = 0.5 + Math.sin(time / 1500) * 0.35;
        moving = true;
      }
      if (this.frozen) {
        spring.value = this.figure.params[name]?.rest ?? 0.5;
        spring.velocity = 0;
      } else if (advance(spring, dt)) moving = true;
      this.values[name] = spring.value;
    }
    if (moving || this.dirty) this.draw();
    return moving;
  }
  private target(): void {
    for (let i = 0; i < this.names.length; i++) {
      const name = this.names[i] as string;
      const p = this.figure.params[name];
      const mapping = this.options.input;
      const signal =
        typeof mapping === "string" && mapping !== "pointer"
          ? mapping
          : typeof mapping === "object"
            ? (mapping[name] ?? p?.input)
            : p?.input;
      (this.springs[i] as Spring).target = signal ? this.signals[signal] : (p?.rest ?? 0.5);
    }
    this.dirty = true;
    if (this.visible && !this.frozen) wake(this);
  }
  private pointer = (event: PointerEvent): void => {
    if (!this.options.interactive || this.frozen) return;
    const b = this.bounds;
    this.signals["pointer.x"] = Math.max(
      0,
      Math.min(1, (event.clientX - b.left) / Math.max(1, b.width)),
    );
    this.signals["pointer.y"] = Math.max(
      0,
      Math.min(1, (event.clientY - b.top) / Math.max(1, b.height)),
    );
    this.signals["pointer.inside"] = 1;
    this.signals["pointer.pressed"] =
      event.type === "pointerdown"
        ? 1
        : event.type === "pointerup"
          ? 0
          : this.signals["pointer.pressed"];
    this.target();
  };
  private leave = (): void => {
    this.signals["pointer.inside"] = 0;
    this.signals["pointer.pressed"] = 0;
    this.signals.focus = 0;
    for (let i = 0; i < this.names.length; i++)
      (this.springs[i] as Spring).target = this.figure.params[this.names[i] as string]?.rest ?? 0.5;
    this.dirty = true;
    if (this.visible && !this.frozen) wake(this);
  };
  private focus = (): void => {
    if (this.options.interactive) {
      this.signals.focus = 1;
      this.target();
    }
  };
  private key = (event: KeyboardEvent): void => {
    if (!this.options.interactive || this.frozen || !event.key.startsWith("Arrow")) return;
    event.preventDefault();
    const delta = event.key === "ArrowUp" || event.key === "ArrowLeft" ? -0.1 : 0.1;
    const v = Math.max(0, Math.min(1, this.signals.key + delta));
    this.signals.key = v;
    this.signals["pointer.x"] = v;
    this.signals["pointer.y"] = v;
    this.signals["pointer.inside"] = 1;
    this.target();
  };
  private measure = (): void => {
    this.bounds = this.host.getBoundingClientRect();
    this.dirty = true;
    if (this.visible) wake(this);
  };
  private observe = (entries: IntersectionObserverEntry[]): void => {
    this.visible = entries[0]?.isIntersecting ?? false;
    if (this.visible) {
      this.dirty = true;
      wake(this);
    } else this.active = false;
  };
  private preference = (): void => {
    this.configure();
    if (this.frozen) this.step(0, 0);
    else wake(this);
  };
  update(options: FigureOptions): void {
    if (this.destroyed)
      throw failure(5, "Figure is destroyed", "Mount a new figure before updating.");
    const next = { ...this.raw, ...options };
    const normalized = normalize(this.figure, next);
    this.raw = next;
    this.options = normalized;
    this.configure();
    this.target();
    if (this.frozen) this.step(0, 0);
  }
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.active = false;
    unregister(this);
    this.resize?.disconnect();
    this.intersection?.disconnect();
    this.reduced?.removeEventListener("change", this.preference);
    this.dark?.removeEventListener("change", this.preference);
    this.host.ownerDocument.defaultView?.removeEventListener("scroll", this.measure, true);
    this.host.removeEventListener("pointermove", this.pointer);
    this.host.removeEventListener("pointerdown", this.pointer);
    this.host.removeEventListener("pointerup", this.pointer);
    this.host.removeEventListener("pointerleave", this.leave);
    this.host.removeEventListener("pointercancel", this.leave);
    this.host.removeEventListener("focus", this.focus);
    this.host.removeEventListener("blur", this.leave);
    this.host.removeEventListener("keydown", this.key);
    this.svg.remove();
    this.host.style.aspectRatio = this.previousAspect;
    if (this.previousTab === null) this.host.removeAttribute("tabindex");
    else this.host.setAttribute("tabindex", this.previousTab);
    OWNERS.delete(this.host);
  }
}
/** Mount an accessible SVG figure. @example const handle = mount(host, padlock, { intensity: 0.6 }); */
export function mount(
  host: HTMLElement,
  figure: FigureDefinition,
  options: FigureOptions = {},
): FigureHandle {
  const view = host?.ownerDocument?.defaultView;
  if (!view || !(host instanceof view.HTMLElement))
    throw failure(2, "Invalid mount target", "Pass an HTMLElement from a live document.");
  if (OWNERS.has(host))
    throw failure(5, "Host already has a figure", "Destroy its handle or use another host.");
  const instance = new Instance(host, figure, options);
  OWNERS.set(host, instance);
  return instance;
}
