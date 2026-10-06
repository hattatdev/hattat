import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  testMatch: ["browser.spec.ts", "visual.spec.ts", "cli.spec.ts"],
  snapshotPathTemplate: "{testDir}/references/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixels: 20, threshold: 0.1 } },
  timeout: 60000,
  workers: 1,
  use: { browserName: "chromium", headless: true, trace: "retain-on-failure" },
  reporter: "list",
});
