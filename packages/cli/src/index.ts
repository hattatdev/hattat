#!/usr/bin/env node
import { look } from "./look.js";

const ARGS = process.argv.slice(2);
try {
  if (ARGS[0] !== "look" || !ARGS[1])
    throw new Error(
      "HATTAT_E001: Unknown command or figure. Use hattat look <figure-or-file> [--out directory] [--json] [--yes].",
    );
  const index = ARGS.indexOf("--out");
  const unknown = ARGS.slice(2).filter(
    (arg, i, args) =>
      arg !== "--out" && args[i - 1] !== "--out" && arg !== "--yes" && arg !== "--json",
  );
  if (unknown.length || (index >= 0 && (!ARGS[index + 1] || ARGS[index + 1]?.startsWith("--"))))
    throw new Error(
      "HATTAT_E001: Invalid look arguments. Provide --out <directory> and use only --json or --yes.",
    );
  const reports = await look(ARGS[1], index >= 0 ? ARGS[index + 1] : undefined);
  console.log(
    ARGS.includes("--json")
      ? JSON.stringify({ reports })
      : reports
          .map(
            (r) =>
              `${r.name}: ${r.lineCount} segments, ${(r.padding * 100).toFixed(1)}% padding; ${r.files[0]}`,
          )
          .join("\n"),
  );
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  const message = detail.includes("HATTAT_E")
    ? detail
    : `HATTAT_E006: Preview could not run: ${detail}. Check the figure default export and install Chromium with pnpm exec playwright install chromium.`;
  console.error(ARGS.includes("--json") ? JSON.stringify({ error: message }) : message);
  process.exitCode = 1;
}
