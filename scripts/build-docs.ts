import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SOURCE = resolve(ROOT, "apps/docs");
const OUTPUT = resolve(SOURCE, "dist/site");
await mkdir(resolve(OUTPUT, "assets"), { recursive: true });
await build({
  entryPoints: [resolve(SOURCE, "src/index.ts")],
  outfile: resolve(OUTPUT, "assets/app.js"),
  bundle: true,
  minify: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  legalComments: "none",
});
const styles = await Promise.all(
  ["tokens", "gallery", "playground", "footer", "responsive"].map((name) =>
    readFile(resolve(SOURCE, `styles/${name}.css`), "utf8"),
  ),
);
await writeFile(resolve(OUTPUT, "assets/styles.css"), styles.join("\n"));
await copyFile(resolve(SOURCE, "index.html"), resolve(OUTPUT, "index.html"));
await copyFile(resolve(SOURCE, "favicon.svg"), resolve(OUTPUT, "assets/favicon.svg"));
await writeFile(resolve(OUTPUT, ".nojekyll"), "");
console.log(`Static gallery built: ${OUTPUT}`);
