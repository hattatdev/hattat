import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { build } from "esbuild";
import type {} from "../tests/fixture.js";

// Diagnostic run is separate: CPU/heap sampling must not inflate the enforced timing run.
const code = await build({
  entryPoints: ["tests/fixture.ts"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
});
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.route("**/*", (route) => route.abort());
  await page.setContent(
    "<style>body{margin:0;display:grid;grid-template-columns:repeat(5,120px)}</style>",
  );
  await page.addScriptTag({ content: code.outputFiles?.[0]?.text ?? "" });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.start");
  await page.evaluate(() => {
    const f = window.fixture;
    for (let i = 0; i < 20; i++) {
      const host = document.createElement("div"),
        figure = f.figures[i % f.figures.length];
      host.style.cssText = "width:120px;height:120px";
      document.body.append(host);
      if (!figure) throw Error("Missing figure");
      f.handles.push(f.mount(host, figure, { autoplay: true }));
    }
  });
  const cold = await cdp.send("Profiler.stop");
  await page.waitForTimeout(2000);
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.start");
  await cdp.send("HeapProfiler.startSampling", {
    samplingInterval: 32768,
    includeObjectsCollectedByMajorGC: true,
    includeObjectsCollectedByMinorGC: true,
  });
  await page.waitForTimeout(3000);
  const cpu = await cdp.send("Profiler.stop"),
    heap = await cdp.send("HeapProfiler.stopSampling");
  await mkdir("artifacts", { recursive: true });
  await writeFile("artifacts/cold-mount.cpuprofile", JSON.stringify(cold.profile));
  await writeFile("artifacts/runtime.cpuprofile", JSON.stringify(cpu.profile));
  await writeFile("artifacts/allocations.json", JSON.stringify(heap.profile));
  await writeFile(
    "artifacts/profile-environment.json",
    JSON.stringify({
      browser: browser.version(),
      cpuThrottle: 4,
      instances: 20,
      sampleDurationMs: 3000,
    }),
  );
  console.log(
    "Saved diagnostic CPU and allocation profiles under artifacts/; these are not timing pass evidence.",
  );
} finally {
  await browser.close();
}
