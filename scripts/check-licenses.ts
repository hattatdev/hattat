import { readFileSync } from "node:fs";

const APPROVED = new Set(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC"]);
const PATH = process.argv[2];
try {
  if (!PATH) throw new Error("Supply the JSON report from pnpm licenses list --json.");
  const REPORT: unknown = JSON.parse(readFileSync(PATH, "utf8").replace(/^\uFEFF/, ""));
  if (!REPORT || typeof REPORT !== "object" || Array.isArray(REPORT)) {
    throw new Error("Expected a license-to-packages JSON object.");
  }
  let packages = 0;
  for (const [expression, entries] of Object.entries(REPORT)) {
    const tokens = expression.replace(/[()]/g, "").split(/\s+(?:OR|AND)\s+/);
    if (!tokens.length || tokens.some((token) => !APPROVED.has(token.trim()))) {
      throw new Error(`DEP-02: unapproved or unknown license: ${expression}`);
    }
    if (!Array.isArray(entries) || !entries.length)
      throw new Error(`Missing packages for ${expression}`);
    packages += entries.length;
  }
  if (!packages) throw new Error("Empty license report; install dependencies first.");
  console.log(
    `PASS: ${packages} installed dependencies have approved licenses, including development dependencies.`,
  );
} catch (error) {
  console.error(
    "HATTAT_E904: Dependency license validation failed. Inspect the dependency/license and choose an approved alternative.",
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
}
