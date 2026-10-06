// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "../../packages/core/src/mount.js";
import { normalize } from "../../packages/core/src/options.js";
import type {
  FigureDefinition,
  FigureHandle,
  FigureOptions,
  Vec3,
} from "../../packages/core/src/types.js";

const POINT: [number, number, number] = [0, 0, 0];
const SIZE: Vec3 = [1, 1, 1];
const FIGURE: FigureDefinition = {
  name: "moving-box",
  category: "objects",
  intents: ["archive", "files", "storage"],
  mood: ["calm"],
  interaction: "The pointer lifts the box.",
  aspect: "1:1",
  a11y: { label: "Moving box" },
  params: { lift: { input: "pointer.y", rest: 0.5 } },
  bounds: { x: -3, y: -3, width: 6, height: 6 },
  build(ctx, p) {
    POINT[2] = p.lift ?? 0.5;
    ctx.box(POINT, SIZE);
  },
};
let frames: Map<number, FrameRequestCallback>;
let next = 1;
let time = 0;
const HANDLES: FigureHandle[] = [];
let visibility: IntersectionObserverCallback | undefined;
let resize: ResizeObserverCallback | undefined;
let preference: EventListener | undefined;
let reduced = false,
  dark = false;

function host(): HTMLElement {
  const element = document.createElement("div");
  document.body.append(element);
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 240,
    height: 240,
    right: 240,
    bottom: 240,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  return element;
}
function add(element: HTMLElement, options: FigureOptions = {}): FigureHandle {
  const handle = mount(element, FIGURE, options);
  HANDLES.push(handle);
  return handle;
}
function tick(count = 120): void {
  for (let i = 0; i < count; i++) {
    time += 1000 / 60;
    const callbacks = [...frames.values()];
    frames.clear();
    for (const cb of callbacks) cb(time);
  }
}
beforeEach(() => {
  frames = new Map();
  time = 0;
  reduced = false;
  dark = false;
  visibility = undefined;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const token = next++;
    frames.set(token, cb);
    return token;
  });
  vi.stubGlobal("cancelAnimationFrame", (token: number) => frames.delete(token));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        visibility = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        get matches() {
          return query.includes("reduced") ? reduced : dark;
        },
        media: query,
        addEventListener: (_type: string, callback: EventListener) => {
          preference = callback;
        },
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: () => true,
        onchange: null,
      }) as unknown as MediaQueryList,
  );
});
afterEach(() => {
  for (const h of HANDLES) h.destroy();
  HANDLES.length = 0;
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("shared DOM lifecycle", () => {
  it("owns only its SVG and restores layout and focus on idempotent destroy", () => {
    const element = host();
    element.style.aspectRatio = "4/3";
    element.setAttribute("tabindex", "2");
    const child = document.createElement("span");
    element.append(child);
    const h = add(element);
    expect(element.querySelector("svg")?.getAttribute("role")).toBe("img");
    expect(element.querySelector("svg")?.getAttribute("aria-label")).toBe("Moving box");
    expect(element.style.aspectRatio.replace(/\s/g, "")).toBe("1/1");
    h.destroy();
    h.destroy();
    expect(element.contains(child)).toBe(true);
    expect(element.style.aspectRatio.replace(/\s/g, "")).toBe("4/3");
    expect(element.getAttribute("tabindex")).toBe("2");
    expect(() => h.update({})).toThrow("HATTAT_E005");
    expect(() => mount(null as unknown as HTMLElement, FIGURE)).toThrow("HATTAT_E002");
  });
  it("rejects duplicate mounts and rejects invalid updates atomically", () => {
    const element = host(),
      h = add(element);
    expect(() => mount(element, FIGURE)).toThrow("HATTAT_E005");
    const svg = element.innerHTML;
    expect(() => h.update({ intensity: 2 })).toThrow("HATTAT_E002");
    expect(element.innerHTML).toBe(svg);
    h.update({
      label: "Updated",
      theme: { hi: "red", stroke: 2 },
      renderer: "svg",
      intensity: 0.8,
      input: { lift: "pointer.x" },
    });
    expect(element.querySelector("svg")?.getAttribute("aria-label")).toBe("Updated");
    expect(element.querySelector("svg")?.style.getPropertyValue("--hattat-hi")).toBe("red");
  });
  it("shares one rAF and stops for a stable pointer and after pointer exit", () => {
    const a = host(),
      b = host();
    add(a);
    add(b);
    a.dispatchEvent(new PointerEvent("pointermove", { clientY: 220, clientX: 100 }));
    b.dispatchEvent(new PointerEvent("pointerdown", { clientY: 20, clientX: 100 }));
    expect(frames.size).toBe(1);
    const old = a.innerHTML;
    tick();
    expect(a.innerHTML).not.toBe(old);
    expect(frames.size).toBe(0);
    b.dispatchEvent(new PointerEvent("pointerup", { clientY: 20 }));
    a.dispatchEvent(new PointerEvent("pointerleave"));
    b.dispatchEvent(new PointerEvent("pointercancel"));
    tick();
    expect(frames.size).toBe(0);
  });
  it("uses arrows as a real alternative and detaches interactive handling", () => {
    const element = host(),
      h = add(element);
    element.dispatchEvent(new FocusEvent("focus"));
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true }));
    tick();
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    tick();
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(frames.size).toBe(0);
    element.dispatchEvent(new FocusEvent("blur"));
    tick();
    h.update({ interactive: false });
    tick();
    expect(element.hasAttribute("tabindex")).toBe(false);
    const old = element.innerHTML;
    element.dispatchEvent(new PointerEvent("pointermove", { clientY: 10 }));
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    element.dispatchEvent(new FocusEvent("focus"));
    tick();
    expect(element.innerHTML).toBe(old);
  });
  it("suspends offscreen drawing and responds to resize and preference changes", () => {
    const element = host();
    add(element);
    visibility?.(
      [{ isIntersecting: false }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );
    const old = element.innerHTML;
    element.dispatchEvent(new PointerEvent("pointermove", { clientY: 10 }));
    tick();
    expect(element.innerHTML).toBe(old);
    visibility?.(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    );
    tick();
    expect(element.innerHTML).not.toBe(old);
    resize?.([], {} as ResizeObserver);
    tick();
    dark = true;
    preference?.(new Event("change"));
    tick();
    expect(element.innerHTML).toContain("#f9fafb");
    reduced = true;
    preference?.(new Event("change"));
    tick();
    expect(frames.size).toBe(0);
  });
  it("freezes reduced motion, supports explicit full, and cleans autoplay", () => {
    const element = host(),
      h = add(element, { motion: "reduce", autoplay: true });
    const old = element.innerHTML;
    element.dispatchEvent(new PointerEvent("pointermove", { clientY: 10 }));
    tick();
    expect(element.innerHTML).toBe(old);
    h.update({ motion: "full" });
    tick(30);
    expect(element.innerHTML).not.toBe(old);
    expect(frames.size).toBe(1);
    element.dispatchEvent(new PointerEvent("pointermove", { clientY: 200 }));
    tick();
    expect(frames.size).toBe(0);
    h.update({ motion: "reduce" });
    tick();
    expect(frames.size).toBe(0);
  });
  it("renders once when animation and observation APIs are absent", () => {
    vi.stubGlobal("requestAnimationFrame", undefined);
    vi.stubGlobal("IntersectionObserver", undefined);
    vi.stubGlobal("ResizeObserver", undefined);
    const element = host();
    add(element, { interactive: false, theme: "mono", input: "pointer" });
    expect(element.querySelectorAll("path")).toHaveLength(6);
  });
});
describe("shared option validation", () => {
  it.each([
    { intensity: NaN },
    { intensity: -1 },
    { renderer: "canvas" },
    { motion: "wrong" },
    { interactive: 1 },
    { autoplay: 0 },
    { theme: "blueprint" },
    { theme: { stroke: 0 } },
    { theme: { hi: "url(https://example.com)" } },
    { theme: { unknown: "red" } },
    { label: "" },
    { input: "scroll.progress" },
    { input: { unknown: "pointer.y" } },
    { input: null },
  ])("rejects invalid option %j", (options) => {
    expect(() => normalize(FIGURE, options as FigureOptions)).toThrow("HATTAT_E002");
  });
  it("preserves all defaults and supports explicit input and theme values", () => {
    const defaults = normalize(FIGURE, {});
    expect(defaults.intensity).toBe(0.5);
    expect(defaults.autoplay).toBe(false);
    expect(
      normalize(FIGURE, {
        input: "key",
        motion: "auto",
        autoplay: false,
        interactive: true,
        theme: { edge: "#222" },
      }).input,
    ).toBe("key");
  });
});
