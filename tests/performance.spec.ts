import { mkdir, writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import type {} from "./fixture.js";

// Keep profiling/screenshot recording separate from timed runtime enforcement.
// Failures retain their raw JSON and error context; diagnostic profiles run independently.
test.use({ trace: "off" });
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
      mountTimingsMs: mounts,
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
