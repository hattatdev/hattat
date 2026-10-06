import { failure } from "./errors.js";
import { advance, FREQUENCIES, type Spring } from "./math.js";
import { normalize, type Options } from "./options.js";
import { Projection } from "./projection.js";
import { Scene, TONES } from "./scene.js";
import { register, unregister, wake } from "./scheduler.js";
import { DARK, LIGHT, markup } from "./svg.js";
import type { FigureDefinition, FigureHandle, FigureOptions, SignalName } from "./types.js";

interface Geometry {
  internalScene: Scene;
  internalProjection: Projection;
  internalParams: Float64Array;
  internalRefs: number;
}
const GEOMETRY = new WeakMap<FigureDefinition, Geometry>();
const OWNERS = new WeakMap<HTMLElement, Instance>();
class Instance implements FigureHandle {
  readonly internalGeometry: Geometry;
  readonly internalValues: Record<string, number> = { intensity: 0.5 };
  readonly internalSignals: Record<SignalName, number> = {
    "pointer.x": 0.5,
    "pointer.y": 0.5,
    "pointer.inside": 0,
    "pointer.pressed": 0,
    focus: 0,
    key: 0.5,
    time: 0.5,
  };
  readonly internalNames: string[];
  readonly internalSprings: Spring[];
  readonly internalSvg: SVGSVGElement;
  readonly internalPaths: SVGPathElement[];
  readonly internalReduced: MediaQueryList | undefined;
  readonly internalDark: MediaQueryList | undefined;
  readonly internalResize: ResizeObserver | undefined;
  readonly internalIntersection: IntersectionObserver | undefined;
  internalOptions: Options;
  internalRaw: FigureOptions;
  internalActive = false;
  internalDestroyed = false;
  internalVisible = true;
  internalDirty = true;
  private internalBounds: DOMRect | undefined;
  private internalPreviousAspect: string;
  private internalPreviousTab: string | null;
  constructor(
    readonly internalHost: HTMLElement,
    readonly internalFigure: FigureDefinition,
    options: FigureOptions,
  ) {
    const host = this.internalHost,
      figure = this.internalFigure;
    this.internalOptions = normalize(figure, options);
    this.internalRaw = { ...options };
    this.internalPreviousAspect = host.style.aspectRatio;
    this.internalPreviousTab = host.getAttribute("tabindex");
    this.internalNames = Object.keys(figure.params);
    this.internalGeometry = GEOMETRY.get(figure) ?? {
      internalScene: new Scene(),
      internalProjection: new Projection(),
      internalParams: new Float64Array(this.internalNames.length + 1).fill(NaN),
      internalRefs: 0,
    };
    this.internalSprings = this.internalNames.map((name) => {
      const p = figure.params[name];
      return {
        value: p?.rest ?? 0.5,
        target: p?.rest ?? 0.5,
        velocity: 0,
        frequency: FREQUENCIES[p?.spring ?? "default"],
      };
    });
    for (let i = 0; i < this.internalNames.length; i++)
      this.internalValues[this.internalNames[i] as string] = (
        this.internalSprings[i] as Spring
      ).value;
    this.internalValues.intensity = this.internalOptions.intensity;
    this.internalBuild();
    const view = host.ownerDocument.defaultView;
    this.internalReduced = view?.matchMedia?.("(prefers-reduced-motion: reduce)");
    this.internalDark = view?.matchMedia?.("(prefers-color-scheme: dark)");
    // Trusted generated SVG; markup escapes the accessibility label.
    const fragment = host.ownerDocument
      .createRange()
      .createContextualFragment(
        markup(figure, this.internalOptions.label, this.internalGeometry.internalProjection),
      );
    this.internalSvg = fragment.firstElementChild as SVGSVGElement;
    this.internalPaths = Array.from(this.internalSvg.querySelectorAll("path"));
    host.style.aspectRatio = figure.aspect.replace(":", "/");
    this.internalConfigure();
    host.append(this.internalSvg);
    this.internalReduced?.addEventListener("change", this.internalPreference);
    this.internalDark?.addEventListener("change", this.internalPreference);
    view?.addEventListener("scroll", this.internalMeasure, true);
    this.internalResize =
      typeof ResizeObserver === "function" ? new ResizeObserver(this.internalMeasure) : undefined;
    this.internalResize?.observe(host);
    this.internalIntersection =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(this.internalObserve)
        : undefined;
    this.internalIntersection?.observe(host);
    this.internalGeometry.internalRefs++;
    GEOMETRY.set(figure, this.internalGeometry);
    register(this);
    this.internalDirty = false;
    if (this.internalOptions.autoplay && !this.internalFrozen) wake(this);
  }
  private internalEvents(method: "addEventListener" | "removeEventListener"): void {
    for (const name of ["pointermove", "pointerdown", "pointerup"] as const)
      this.internalHost[method](name, this.internalPointer as EventListener);
    for (const name of ["pointerleave", "pointercancel", "blur"] as const)
      this.internalHost[method](name, this.internalLeave);
    this.internalHost[method]("focus", this.internalFocus);
    this.internalHost[method]("keydown", this.internalKey as EventListener);
  }
  private get internalFrozen(): boolean {
    return (
      this.internalOptions.motion === "reduce" ||
      (this.internalOptions.motion === "auto" && !!this.internalReduced?.matches)
    );
  }
  private internalConfigure(): void {
    this.internalEvents(
      this.internalOptions.interactive ? "addEventListener" : "removeEventListener",
    );
    this.internalSvg.setAttribute("aria-label", this.internalOptions.label);
    if (this.internalOptions.interactive)
      this.internalHost.setAttribute("tabindex", this.internalPreviousTab ?? "0");
    else if (this.internalPreviousTab === null) this.internalHost.removeAttribute("tabindex");
    else this.internalHost.setAttribute("tabindex", this.internalPreviousTab);
    const palette = this.internalDark?.matches ? DARK : LIGHT;
    for (let i = 0; i < TONES.length; i++) {
      const tone = TONES[i] as keyof typeof LIGHT;
      this.internalPaths[i + 1]?.setAttribute("stroke", `var(--hattat-${tone},${palette[tone]})`);
    }
    this.internalPaths[0]?.setAttribute("fill", `var(--hattat-plate,${palette.plate})`);
    for (const name of ["plate", "hi", "edge", "mid", "lo", "accent", "stroke"] as const) {
      const value = this.internalOptions.theme[name];
      if (value === undefined) this.internalSvg.style.removeProperty(`--hattat-${name}`);
      else this.internalSvg.style.setProperty(`--hattat-${name}`, String(value));
    }
    this.internalValues.intensity = this.internalOptions.intensity;
    this.internalDirty = true;
  }
  private internalBuild(): void {
    const previous = this.internalGeometry.internalParams,
      n = this.internalNames.length;
    let same = true;
    for (let i = 0; i <= n && same; i++)
      same = previous[i] === this.internalValues[this.internalNames[i] ?? "intensity"];
    if (same) return;
    previous.fill(NaN);

    this.internalGeometry.internalScene.internalReset();
    this.internalFigure.build(this.internalGeometry.internalScene, this.internalValues);
    if (this.internalGeometry.internalScene.internalCount > 400)
      throw failure(4, "SVG exceeds 400 segments", "Use fewer segments.");
    this.internalGeometry.internalProjection.internalRender(
      this.internalGeometry.internalScene,
      false,
    );
    for (let i = 0; i <= n; i++)
      previous[i] = this.internalValues[this.internalNames[i] ?? "intensity"] ?? 0.5;
  }
  private internalDraw(): void {
    this.internalBuild();
    const projection = this.internalGeometry.internalProjection;
    for (let i = 0; i < 6; i++) {
      const path = this.internalPaths[i] as SVGPathElement;
      const value = i ? (projection.internalPaths[i - 1] ?? "") : projection.internalPlatePath;
      if (path.getAttribute("d") !== value) path.setAttribute("d", value);
    }
    this.internalDirty = false;
  }
  internalStep(dt: number, time: number): boolean {
    if (!this.internalVisible) return false;
    let moving = false,
      changed = false;
    const demo =
      this.internalOptions.autoplay &&
      this.internalSignals["pointer.inside"] === 0 &&
      this.internalSignals.focus === 0 &&
      !this.internalFrozen;
    for (let i = 0; i < this.internalNames.length; i++) {
      const name = this.internalNames[i] as string;
      const spring = this.internalSprings[i] as Spring;
      if (demo) {
        spring.target = 0.5 + Math.sin(time / 1500) * 0.35;
        moving = true;
      }
      const previous = spring.value;
      if (this.internalFrozen) {
        spring.value = this.internalFigure.params[name]?.rest ?? 0.5;
        spring.velocity = 0;
      } else if (advance(spring, dt)) moving = true;
      changed ||= previous !== spring.value;
      this.internalValues[name] = spring.value;
    }
    if (changed || this.internalDirty) this.internalDraw();
    return moving;
  }
  private internalTarget(): void {
    for (let i = 0; i < this.internalNames.length; i++) {
      const name = this.internalNames[i] as string;
      const p = this.internalFigure.params[name];
      const mapping = this.internalOptions.input;
      const signal =
        typeof mapping === "string" && mapping !== "pointer"
          ? mapping
          : typeof mapping === "object"
            ? (mapping[name] ?? p?.input)
            : p?.input;
      (this.internalSprings[i] as Spring).target = signal
        ? this.internalSignals[signal]
        : (p?.rest ?? 0.5);
    }
    this.internalDirty = true;
    if (this.internalVisible && !this.internalFrozen) wake(this);
  }
  private internalPointer = (event: PointerEvent): void => {
    if (!this.internalOptions.interactive || this.internalFrozen) return;
    if (!this.internalBounds?.width) this.internalMeasure();
    const b = this.internalBounds as DOMRect;
    this.internalSignals["pointer.x"] = Math.max(
      0,
      Math.min(1, (event.clientX - b.left) / Math.max(1, b.width)),
    );
    this.internalSignals["pointer.y"] = Math.max(
      0,
      Math.min(1, (event.clientY - b.top) / Math.max(1, b.height)),
    );
    this.internalSignals["pointer.inside"] = 1;
    this.internalSignals["pointer.pressed"] =
      event.type === "pointerdown"
        ? 1
        : event.type === "pointerup"
          ? 0
          : this.internalSignals["pointer.pressed"];
    this.internalTarget();
  };
  private internalLeave = (): void => {
    this.internalSignals["pointer.inside"] = 0;
    this.internalSignals["pointer.pressed"] = 0;
    this.internalSignals.focus = 0;
    for (let i = 0; i < this.internalNames.length; i++)
      (this.internalSprings[i] as Spring).target =
        this.internalFigure.params[this.internalNames[i] as string]?.rest ?? 0.5;
    this.internalDirty = true;
    if (this.internalVisible && !this.internalFrozen) wake(this);
  };
  private internalFocus = (): void => {
    if (this.internalOptions.interactive) {
      this.internalSignals.focus = 1;
      this.internalTarget();
    }
  };
  private internalKey = (event: KeyboardEvent): void => {
    if (!this.internalOptions.interactive || this.internalFrozen || !event.key.startsWith("Arrow"))
      return;
    event.preventDefault();
    const delta = event.key === "ArrowUp" || event.key === "ArrowLeft" ? -0.1 : 0.1;
    const v = Math.max(0, Math.min(1, this.internalSignals.key + delta));
    this.internalSignals.key = v;
    this.internalSignals["pointer.x"] = v;
    this.internalSignals["pointer.y"] = v;
    this.internalSignals["pointer.inside"] = v;
    this.internalTarget();
  };
  private internalMeasure = (): void => {
    this.internalBounds = this.internalHost.getBoundingClientRect();
    this.internalDirty = true;
    if (this.internalVisible) wake(this);
  };
  private internalObserve = (entries: IntersectionObserverEntry[]): void => {
    this.internalVisible = entries[0]?.isIntersecting ?? false;
    if (this.internalVisible) {
      this.internalDirty = true;
      wake(this);
    } else this.internalActive = false;
  };
  private internalPreference = (): void => {
    this.internalConfigure();
    if (this.internalFrozen) this.internalStep(0, 0);
    else wake(this);
  };
  update(options: FigureOptions): void {
    if (this.internalDestroyed) throw failure(5, "Figure is destroyed", "Mount a new figure.");
    const next = { ...this.internalRaw, ...options };
    const normalized = normalize(this.internalFigure, next);
    this.internalRaw = next;
    this.internalOptions = normalized;
    this.internalConfigure();
    this.internalTarget();
    if (this.internalFrozen) this.internalStep(0, 0);
  }
  destroy(): void {
    if (this.internalDestroyed) return;
    this.internalDestroyed = true;
    this.internalActive = false;
    unregister(this);
    if (--this.internalGeometry.internalRefs === 0) GEOMETRY.delete(this.internalFigure);
    this.internalResize?.disconnect();
    this.internalIntersection?.disconnect();
    this.internalReduced?.removeEventListener("change", this.internalPreference);
    this.internalDark?.removeEventListener("change", this.internalPreference);
    this.internalHost.ownerDocument.defaultView?.removeEventListener(
      "scroll",
      this.internalMeasure,
      true,
    );
    this.internalEvents("removeEventListener");
    this.internalSvg.remove();
    this.internalHost.style.aspectRatio = this.internalPreviousAspect;
    if (this.internalPreviousTab === null) this.internalHost.removeAttribute("tabindex");
    else this.internalHost.setAttribute("tabindex", this.internalPreviousTab);
    OWNERS.delete(this.internalHost);
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
    throw failure(2, "Invalid host", "Use a live HTMLElement.");
  if (OWNERS.has(host)) throw failure(5, "Duplicate mount", "Destroy its handle first.");
  const instance = new Instance(host, figure, options);
  OWNERS.set(host, instance);
  return instance;
}
