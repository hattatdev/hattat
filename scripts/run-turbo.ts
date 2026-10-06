import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TASK = process.argv[2];
if (TASK !== "build" && TASK !== "typecheck") {
  console.error("HATTAT_E900: Invalid bootstrap task. Use build or typecheck.");
  process.exit(1);
}

// Resolve the JS CLI directly so Windows does not need a shell or a visible window.
const CLI = import.meta.resolve("turbo/bin/turbo");
const RESULT = spawnSync(process.execPath, [fileURLToPath(CLI), "run", TASK], {
  stdio: "inherit",
  env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1", DO_NOT_TRACK: "1" },
  windowsHide: true,
});
if (RESULT.error) {
  console.error(
    "HATTAT_E901: Turbo could not start. Run pnpm install --frozen-lockfile.",
    RESULT.error.message,
  );
}
process.exit(RESULT.status ?? 1);
