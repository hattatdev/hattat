import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import type {} from "./fixture.js";

let bundle = "";
test.beforeAll(async () => {
  const result = await build({
    entryPoints: ["tests/fixture.ts"],
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
  });
  bundle = result.outputFiles?.[0]?.text ?? "";
});
for (const [index, name] of [
  "server-rack",
  "padlock",
  "drawer-stack",
  "gear-train",
  "wave-field",
  "bar-city",
  "bridge",
  "desk-lamp",
  "wind-turbine",
  "pendulum",
  "envelope",
  "empty-box",
  "db-stack",
  "shield-layers",
].entries()) {
  test(`${name}: rest, full and reduced-motion references`, async ({ page }) => {
    await page.setViewportSize({ width: 240, height: 240 });
    await page.route("**/*", (route) => route.abort());
    await page.setContent(
      '<style>html,body{margin:0;background:#fff}#host{width:240px;height:240px}</style><div id="host"></div>',
    );
    await page.addScriptTag({ content: bundle });
    await page.clock.install({ time: 0 });
    await page.clock.pauseAt(100);
    await page.evaluate((index) => {
      const f = window.fixture,
        figure = f.figures[index];
      if (!figure) throw Error("Missing figure");
      f.handles.push(f.mount(document.querySelector("#host") as HTMLElement, figure));
    }, index);
    await expect(page).toHaveScreenshot(`${name}-rest.png`);
    await page.locator("#host").dispatchEvent("pointermove", { clientX: 228, clientY: 12 });
    await page.clock.runFor(1400);
    await expect(page).toHaveScreenshot(`${name}-full.png`);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.runFor(100);
    await page.locator("#host").dispatchEvent("pointermove", { clientX: 12, clientY: 228 });
    await page.clock.runFor(1400);
    await expect(page).toHaveScreenshot(`${name}-reduced.png`);
    await page.evaluate(() => {
      for (const handle of window.fixture.handles) handle.destroy();
    });
  });
}
