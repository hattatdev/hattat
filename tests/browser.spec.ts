import { mkdir, writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import type {} from "./fixture.js";

const ROOT = process.cwd();
let bundle = "";
test.beforeAll(async () => {
  const result = await build({
    entryPoints: [`${ROOT}/tests/fixture.ts`],
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
  });
  bundle = result.outputFiles?.[0]?.text ?? "";
});
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.setContent(
    '<style>html,body{margin:0;background:white}#host{width:240px;height:240px}</style><div id="host"></div>',
  );
  await page.addScriptTag({ content: bundle });
});
test("packaged imports, pointer, keyboard, cleanup and reduced motion", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (let i = 0; i < 5; i++) {
    await page.evaluate((index) => {
      const f = window.fixture;
      f.handles.forEach((h) => {
        h.destroy();
      });
      f.handles = [];
      const figure = f.figures[index];
      if (!figure) throw Error("Missing figure");
      f.handles.push(f.mount(document.querySelector("#host") as HTMLElement, figure));
    }, i);
    const before = await page.locator("#host").innerHTML();
    const responseMs = await page.locator("#host").evaluate(
      (host) =>
        new Promise<number>((resolve, reject) => {
          const start = performance.now();
          const observer = new MutationObserver(() => {
            observer.disconnect();
            clearTimeout(timeout);
            resolve(performance.now() - start);
          });
          const timeout = setTimeout(() => {
            observer.disconnect();
            reject(Error("No response within 100 ms"));
          }, 100);
          observer.observe(host, { subtree: true, attributes: true, attributeFilter: ["d"] });
          host.dispatchEvent(new PointerEvent("pointermove", { clientX: 228, clientY: 12 }));
        }),
    );
    expect(responseMs).toBeLessThanOrEqual(100);
    await page.waitForTimeout(1400);
    expect(await page.locator("#host").innerHTML()).not.toBe(before);
    await page.locator("#host").focus();
    const keyboardBefore = await page.locator("#host").innerHTML();
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(400);
    expect(await page.locator("#host").innerHTML()).not.toBe(keyboardBefore);
    await page.locator("#host").dispatchEvent("pointerleave");
    await page.locator("#host").evaluate((e) => e.blur());
    await page.waitForTimeout(1400);
    expect(await page.locator("#host").innerHTML()).toBe(before);
    await expect(page.locator("svg")).toHaveAttribute("role", "img");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  const resting = await page.locator("#host").innerHTML();
  await page.locator("#host").dispatchEvent("pointermove", { clientX: 10, clientY: 200 });
  await page.waitForTimeout(200);
  expect(await page.locator("#host").innerHTML()).toBe(resting);
  await page.evaluate(() =>
    window.fixture.handles.forEach((h) => {
      h.destroy();
    }),
  );
  await expect(page.locator("svg")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("README example reserves layout and mounts through public package entries", async ({
  page,
}) => {
  await page.setContent('<style>body{margin:0}#hero{width:240px}</style><div id="hero"></div>');
  const code = await build({
    entryPoints: ["apps/docs/src/vanilla.ts"],
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
  });
  await page.addScriptTag({ content: code.outputFiles?.[0]?.text ?? "" });
  await expect(page.locator("#hero svg")).toHaveAttribute("role", "img");
  const bounds = await page.locator("#hero").boundingBox();
  expect(bounds?.height).toBe(240);
  expect(bounds?.width).toBe(240);
});

test("@performance 20 real animated figures at 4x CPU: timing, idle and offscreen", async ({
  page,
}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const result = await page.evaluate(async () => {
    const original = requestAnimationFrame;
    let callbacks = 0;
    const times: number[] = [];
    window.requestAnimationFrame = (callback) => {
      return original((time) => {
        const start = performance.now();
        callback(time);
        times.push(performance.now() - start);
        callbacks++;
      });
    };
    const f = window.fixture;
    const mounts: number[] = [];
    document.body.style.display = "grid";
    document.body.style.gridTemplateColumns = "repeat(5,120px)";
    for (let i = 0; i < 20; i++) {
      const host = document.createElement("div");
      host.style.cssText = "width:120px;height:120px";
      document.body.append(host);
      const start = performance.now();
      const figure = f.figures[i % 5];
      if (!figure) throw Error("Missing figure");
      f.handles.push(f.mount(host, figure, { autoplay: true }));
      mounts.push(performance.now() - start);
    }
    await new Promise((done) => setTimeout(done, 2000));
    times.length = 0;
    await new Promise((done) => setTimeout(done, 1200));
    const measured = [...times].sort((a, b) => a - b);
    const frameMs = measured[Math.floor(measured.length * 0.95)] ?? Infinity;
    f.handles.forEach((h) => {
      h.update({ autoplay: false });
    });
    await new Promise((done) => setTimeout(done, 1500));
    const idleStart = callbacks;
    await new Promise((done) => setTimeout(done, 200));
    const idleCallbacks = callbacks - idleStart;
    for (const host of document.body.children)
      (host as HTMLElement).style.transform = "translateY(2000px)";
    await new Promise((done) => setTimeout(done, 100));
    f.handles.forEach((h) => {
      h.update({ autoplay: true });
    });
    const offscreenStart = callbacks;
    await new Promise((done) => setTimeout(done, 200));
    const offscreenCallbacks = callbacks - offscreenStart;
    f.handles.forEach((h) => {
      h.destroy();
    });
    return {
      frameMs,
      viewport: { width: innerWidth, height: innerHeight },
      instances: f.handles.length,
      cpuThrottle: 4,
      maxFrameMs: Math.max(...measured),
      firstDrawMs: Math.max(...mounts),
      idleCallbacks,
      offscreenCallbacks,
      samples: measured.length,
    };
  });
  await mkdir(`${ROOT}/artifacts`, { recursive: true });
  await writeFile(
    `${ROOT}/artifacts/performance.json`,
    JSON.stringify(
      { ...result, browser: page.context().browser()?.version(), platform: process.platform },
      null,
      2,
    ),
  );
  console.log("PERFORMANCE", result);
  expect(result.idleCallbacks).toBe(0);
  expect(result.offscreenCallbacks).toBe(0);
  expect(result.maxFrameMs).toBeLessThanOrEqual(4);
  expect(result.firstDrawMs).toBeLessThanOrEqual(16);
});
