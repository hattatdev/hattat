import { spawnSync } from "node:child_process";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

it("repository checks reject legacy Windows encoding instead of silently replacing characters", () => {
  const root = resolve(import.meta.dirname, "../.."),
    probe = resolve(root, "docs/encoding-probe.md");
  expect(existsSync(probe)).toBe(false);
  writeFileSync(probe, Buffer.from([0x97]));
  try {
    const result = spawnSync(process.execPath, ["scripts/check-bootstrap.ts"], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("encoding-probe.md");
    expect(result.stderr).toContain("valid UTF-8");
  } finally {
    unlinkSync(probe);
  }
});
