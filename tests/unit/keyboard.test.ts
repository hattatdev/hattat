// @vitest-environment happy-dom
import { expect, it, vi } from "vitest";
import { mount } from "../../packages/core/src/mount.js";
import type { FigureDefinition } from "../../packages/core/src/types.js";

it("arrows can adjust a pointer-inside primary parameter in both directions", () => {
  const frames = new Map<number, FrameRequestCallback>();
  let token = 0,
    value = 0,
    time = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++token, callback);
    return token;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    frames.delete(id);
  });
  vi.stubGlobal("IntersectionObserver", undefined);
  vi.stubGlobal("ResizeObserver", undefined);
  const figure: FigureDefinition = {
    name: "keyboard-lock",
    category: "security",
    intents: ["login", "privacy", "authentication"],
    mood: ["calm"],
    interaction: "Approach lifts the lock.",
    aspect: "1:1",
    a11y: { label: "Lock" },
    bounds: { x: -3, y: -3, width: 6, height: 6 },
    params: { open: { input: "pointer.inside", rest: 0 } },
    build(ctx, params) {
      value = params.open ?? 0;
      ctx.line([0, 0, 0], [1, 1, value]);
    },
  };
  const host = document.createElement("div");
  document.body.append(host);
  const handle = mount(host, figure);
  try {
    for (const [key, expected] of [
      ["ArrowRight", 0.6],
      ["ArrowLeft", 0.5],
    ] as const) {
      host.dispatchEvent(new KeyboardEvent("keydown", { key }));
      for (let i = 0; i < 120; i++) {
        time += 1000 / 60;
        const pending = [...frames.values()];
        frames.clear();
        for (const cb of pending) cb(time);
      }
      expect(value).toBe(expected);
      expect(frames.size).toBe(0);
    }
  } finally {
    handle.destroy();
    host.remove();
    vi.unstubAllGlobals();
  }
});
