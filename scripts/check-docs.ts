import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { build } from "esbuild";
import { createDocsServer } from "./serve-docs.ts";

const server = createDocsServer();
await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
const localUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/hattat/`;
const url = process.argv[2] ?? localUrl;
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(response.url());
  });
  await page.goto(url);
  await expect(page.locator(".figure-card svg")).toHaveCount(5);
  await expect(page.locator("#hero-figure svg")).toBeVisible();
  await page.locator("#search").fill("workflow");
  await expect(page.locator(".figure-card:visible")).toHaveCount(1);
  await expect(page.locator(".figure-card:visible h3")).toHaveText("Gear train");
  await page.locator("#search").fill("no-such-figure");
  await expect(page.locator("#empty-state")).toBeVisible();
  await page.locator("#reset-search").click();
  await page.getByRole("button", { name: "Security", exact: true }).click();
  await expect(page.locator(".figure-card:visible h3")).toHaveText("Padlock");
  await page.getByRole("button", { name: "Abstract", exact: true }).click();
  await expect(page.locator(".figure-card:visible h3")).toHaveText("Wave field");
  await page.getByRole("button", { name: "All figures", exact: true }).click();
  await page.getByRole("button", { name: "Try Padlock in playground", exact: true }).click();
  await expect(page.locator("#figure-select")).toHaveValue("padlock");
  await expect(page.locator("#playground-figure svg")).toHaveCount(1);
  await page.locator("#intensity").fill("85");
  await expect(page.locator("#intensity-value")).toHaveText("85%");
  await expect(page.locator("#code")).toContainText("intensity: 0.85");
  await page.getByRole("button", { name: "Ink", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ink");
  await expect(page.locator("#code")).toContainText('"plate":"#20251f"');
  await page.locator("#animate").click();
  await expect(page.locator("#animate")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#code")).toContainText("autoplay: true");
  await page.locator("#animate").click();
  await page.getByRole("button", { name: "Blueprint", exact: true }).click();
  await expect(page.locator("#playground-figure svg")).toHaveCSS("--hattat-plate", "#eaf0f4");
  await page.getByRole("button", { name: "Paper", exact: true }).click();
  for (const name of ["server-rack", "padlock", "drawer-stack", "gear-train", "wave-field"]) {
    await page.locator("#figure-select").selectOption(name);
    await expect(page.locator("#code")).toContainText(`hattat/figures/${name}`);
    await expect(page.locator("#playground-figure svg")).toHaveCount(1);
    const example = await page.locator("#code").innerText();
    const compiled = await build({
      stdin: { contents: example, resolveDir: resolve("apps/docs") },
      bundle: true,
      write: false,
      format: "iife",
    });
    await page.evaluate(() => {
      document.querySelector("#figure")?.remove();
      const node = document.createElement("div");
      node.id = "figure";
      node.hidden = true;
      document.body.append(node);
    });
    await page.addScriptTag({ content: compiled.outputFiles?.[0]?.text ?? "" });
    await expect(page.locator("#figure svg")).toHaveCount(1);
  }
  await page.locator("#copy-code").click();
  await expect(page.locator("#copy-status")).toContainText(/copied|selected/);
  await page.locator("#figure-select").selectOption("gear-train");
  await page.locator("#intensity").fill("60");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#motion-note")).toContainText("Reduced motion is on");
  await page.locator("#animate").click();
  const paths = await page.locator("#playground-figure svg").innerHTML();
  await page.waitForTimeout(150);
  assert.equal(await page.locator("#playground-figure svg").innerHTML(), paths);
  await page.locator("#animate").click();
  await mkdir("artifacts/gallery", { recursive: true });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Overflow at ${width}px`,
    );
    if (width === 1440 || width === 390) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: `artifacts/gallery/${width}.png`, fullPage: true });
    }
  }
  assert.deepEqual(errors, []);
  console.log(
    `PASS: gallery assets, search, filters, five figures, controls, example execution, clipboard feedback, reduced motion, and responsive layout (${url}).`,
  );
  console.log(`Screenshots: ${resolve("artifacts/gallery")}`);
} finally {
  await browser.close();
  await new Promise<void>((done, reject) =>
    server.close((error) => (error ? reject(error) : done())),
  );
}
