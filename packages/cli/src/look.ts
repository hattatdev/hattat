import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { build } from "esbuild";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
export interface LookReport {
  name: string;
  lineCount: number;
  visibleCount: number;
  frameMs: number;
  contrast: number;
  padding: number;
  overflow: boolean;
  intensity: number;
  files: string[];
}
/** Render a trusted local figure or built-in figure. @example await look("padlock", "artifacts/look"); */
export async function look(name: string, out = resolve("artifacts/look")): Promise<LookReport[]> {
  const builtin = ["server-rack", "drawer-stack", "padlock", "gear-train", "wave-field"].includes(
    name,
  );
  const entry = builtin ? resolve(ROOT, "packages/figures/src", `${name}.ts`) : resolve(name);
  const core = resolve(ROOT, "packages/core/src/index.ts");
  const bundle = await build({
    stdin: {
      contents: `import figure from ${JSON.stringify(entry)};import{mount,Scene}from ${JSON.stringify(core)};import{Projection}from ${JSON.stringify(resolve(ROOT, "packages/core/src/projection.ts"))};globalThis.figure=figure;globalThis.api={mount,Scene,Projection};`,
      resolveDir: ROOT,
    },
    logLevel: "silent",
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
  });
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 240, height: 240 },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.route("**/*", (route) => route.abort());
    await page.setContent(
      '<style>html,body{margin:0;background:#fff}#figure{width:240px;height:240px}</style><div id="figure"></div>',
    );
    // A fixed frame clock makes images repeatable while performance.now stays real for metrics.
    await page.evaluate(() => {
      const frames = new Map<number, FrameRequestCallback>();
      let token = 0,
        time = 0;
      window.requestAnimationFrame = (callback) => {
        frames.set(++token, callback);
        return token;
      };
      window.cancelAnimationFrame = (id) => {
        frames.delete(id);
      };
      (window as unknown as { previewTick: (ms: number) => void }).previewTick = (ms) => {
        for (let i = 0; i < Math.ceil(ms / (1000 / 60)); i++) {
          time += 1000 / 60;
          const pending = [...frames.values()];
          frames.clear();
          for (const callback of pending) callback(time);
        }
      };
    });
    await page.addScriptTag({ content: bundle.outputFiles?.[0]?.text ?? "" });
    const reports: LookReport[] = [];
    for (const intensity of [0, 0.5, 1]) {
      const metrics = await page.evaluate((intensity) => {
        const w = window as unknown as {
          figure: import("@hattatdev/core").FigureDefinition;
          api: {
            mount: typeof import("@hattatdev/core").mount;
            Scene: typeof import("@hattatdev/core").Scene;
            Projection: new () => {
              render(scene: import("@hattatdev/core").Scene): void;
              minX: number;
              maxX: number;
              minY: number;
              maxY: number;
              visibleCount: number;
            };
          };
          handle?: import("@hattatdev/core").FigureHandle;
        };
        w.handle?.destroy();
        w.handle = w.api.mount(document.querySelector("#figure") as HTMLElement, w.figure, {
          intensity,
        });
        const scene = new w.api.Scene(),
          projection = new w.api.Projection();
        let padding = 1,
          frameMs = 0;
        const b = w.figure.bounds,
          params: Record<string, number> = { intensity };
        let lineCount = 0,
          visibleCount = 0;
        const keys = Object.keys(w.figure.params);
        for (let i = 0; i <= 20 + 2 ** keys.length; i++) {
          for (let k = 0; k < keys.length; k++)
            params[keys[k] as string] = i <= 20 ? i / 20 : ((i - 21) >> k) & 1;
          const start = performance.now();
          scene.reset();
          w.figure.build(scene, params);
          projection.render(scene);
          frameMs = Math.max(frameMs, performance.now() - start);
          lineCount = Math.max(lineCount, scene.count);
          visibleCount = Math.max(visibleCount, projection.visibleCount);
          padding = Math.min(
            padding,
            (projection.minX - b.x) / b.width,
            (b.x + b.width - projection.maxX) / b.width,
            (projection.minY - b.y) / b.height,
            (b.y + b.height - projection.maxY) / b.height,
          );
        }
        return {
          name: w.figure.name,
          lineCount,
          visibleCount,
          frameMs,
          padding,
          overflow: padding < 0.08,
          intensity,
        };
      }, intensity);
      const prefix = resolve(out, `${metrics.name}-i${intensity}`);
      const files: string[] = [];
      const tick = async (ms: number) => {
        await page.evaluate(
          (ms) => (window as unknown as { previewTick: (ms: number) => void }).previewTick(ms),
          ms,
        );
      };
      let restImage: Buffer | undefined;
      for (const pose of ["rest", "full", "blind", "reduced"]) {
        if (pose === "full") {
          await page.locator("#figure").dispatchEvent("pointermove", { clientX: 228, clientY: 12 });
          await tick(1400);
        }
        if (pose === "blind" || pose === "reduced") {
          await page.locator("#figure").dispatchEvent("pointerleave");
          await tick(1400);
        }
        if (pose === "reduced") {
          await page.emulateMedia({ reducedMotion: "reduce" });
          await page.locator("#figure").dispatchEvent("pointermove", { clientX: 12, clientY: 228 });
          await tick(1400);
        }
        const path = `${prefix}-${pose}.png`;
        const image = await page.screenshot({ path });
        if (pose === "rest") restImage = image;
        if (pose === "reduced" && !image.equals(restImage ?? Buffer.alloc(0)))
          throw Error(
            "HATTAT_E006: Reduced-motion pose changed. Keep the resting pose and ignore pointer movement.",
          );
        files.push(path);
      }
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.locator("#figure").dispatchEvent("pointermove", { clientX: 228, clientY: 12 });
      await tick(1400);
      await page.locator("#figure").dispatchEvent("pointerleave");
      const frames: string[] = [];
      for (const ms of [0, 120, 120]) {
        await tick(ms);
        frames.push((await page.screenshot()).toString("base64"));
      }
      const strip = await browser.newPage({
        viewport: { width: 720, height: 240 },
        deviceScaleFactor: 1,
      });
      try {
        await strip.route("**/*", (route) => route.abort());
        await strip.setContent(
          `<style>body{margin:0;display:flex}</style>${frames.map((data) => `<img width="240" height="240" src="data:image/png;base64,${data}" alt="Motion frame">`).join("")}`,
        );
        const path = `${prefix}-motion.png`;
        await strip.screenshot({ path });
        files.push(path);
      } finally {
        await strip.close();
      }
      const contrast = await page.evaluate(() => {
        function luminance(color: string): number {
          const channels = color
            .match(/[\d.]+/g)
            ?.slice(0, 3)
            .map((v) => Number(v) / 255);
          if (channels?.length !== 3) throw Error("Unsupported computed color");
          const c = channels.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
          return (c[0] ?? 0) * 0.2126 + (c[1] ?? 0) * 0.7152 + (c[2] ?? 0) * 0.0722;
        }
        const background = luminance(getComputedStyle(document.body).backgroundColor);
        const strokes = Array.from(document.querySelectorAll("#figure path")).slice(1, 3);
        return Math.min(
          ...strokes.map((path) => {
            const stroke = luminance(getComputedStyle(path).stroke);
            return (Math.max(background, stroke) + 0.05) / (Math.min(background, stroke) + 0.05);
          }),
        );
      });
      const report = { ...metrics, contrast, files };
      await writeFile(`${prefix}-report.json`, `${JSON.stringify(report, null, 2)}\n`);
      reports.push(report);
      if (metrics.overflow || contrast < 4.5 || metrics.lineCount > 400 || errors.length)
        throw new Error(
          "HATTAT_E006: Preview validation failed. Fix padding, geometry, contrast, or browser errors: " +
            errors.join("; "),
        );
    }
    return reports;
  } finally {
    await browser.close();
  }
}
