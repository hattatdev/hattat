import { spawnSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import type { LookReport } from "../packages/cli/src/look.js";

test("look emits machine-readable reports and actionable nonzero failures", () => {
  const success = spawnSync(
    process.execPath,
    [
      "packages/cli/dist/index.js",
      "look",
      "padlock",
      "--yes",
      "--json",
      "--out",
      "artifacts/cli-smoke",
    ],
    { encoding: "utf8", windowsHide: true, env: { ...process.env, FORCE_COLOR: undefined } },
  );
  expect(success.status).toBe(0);
  const result = JSON.parse(success.stdout) as { reports: LookReport[] };
  expect(result.reports.map((report) => report.intensity)).toEqual([0, 0.5, 1]);
  for (const report of result.reports) {
    expect(report.files).toHaveLength(5);
    expect(report.overflow).toBe(false);
    expect(report.contrast).toBeGreaterThanOrEqual(4.5);
  }
  for (const args of [
    ["wrong", "--json"],
    ["look", "padlock", "--out", "--json"],
    ["look", "not-a-real-file.ts", "--json"],
  ]) {
    const failure = spawnSync(process.execPath, ["packages/cli/dist/index.js", ...args], {
      encoding: "utf8",
      windowsHide: true,
      env: { ...process.env, FORCE_COLOR: undefined },
    });
    expect(failure.status).toBe(1);
    expect(failure.stdout).toBe("");
    const error = JSON.parse(failure.stderr) as { error: string };
    expect(error.error).toMatch(/HATTAT_E00[16]:/);
  }
});
