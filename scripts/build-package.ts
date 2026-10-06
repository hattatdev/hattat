import { strict as assert } from "node:assert";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";

const ROOT = resolve(import.meta.dirname, ".."),
  OUT = resolve(ROOT, "packages/hattat/dist");
await mkdir(resolve(OUT, "core"), { recursive: true });
await mkdir(resolve(OUT, "figures"), { recursive: true });
const core = await build({
  entryPoints: [resolve(ROOT, "packages/hattat/src/core.ts")],
  bundle: true,
  format: "esm",
  platform: "browser",
  minify: true,
  // Mangle only DOM-instance implementation properties, never public figure/scene contracts.
  mangleProps: /^internal[A-Z]/,
  target: "es2022",
  write: false,
});
const CODE = core.outputFiles?.[0]?.text ?? "";
await writeFile(resolve(OUT, "core/index.js"), CODE);
for (const file of await readdir(resolve(ROOT, "packages/core/dist")))
  if (file.endsWith(".d.ts"))
    await copyFile(resolve(ROOT, "packages/core/dist", file), resolve(OUT, "core", file));
await writeFile(
  resolve(OUT, "core/index.d.ts"),
  'export { defineFigure } from "./define-figure.js";\nexport { mount } from "./mount.js";\nexport { renderSVG } from "./svg.js";\nexport type * from "./types.js";\n',
);
await writeFile(resolve(OUT, "index.js"), 'export { mount } from "./core/index.js";\n');
await writeFile(
  resolve(OUT, "index.d.ts"),
  'export { mount } from "./core/index.js";\nexport type { FigureHandle, FigureOptions } from "./core/index.js";\n',
);
const sizes: Record<string, number> = { core: gzipSync(CODE).length };
for (const name of ["server-rack", "padlock", "drawer-stack", "gear-train", "wave-field"]) {
  const result = await build({
    entryPoints: [resolve(ROOT, "packages/figures/src", `${name}.ts`)],
    bundle: true,
    format: "esm",
    minify: true,
    write: false,
    plugins: [
      {
        name: "public-core",
        setup(b) {
          b.onResolve({ filter: /^@hattatdev\/core$/ }, () => ({
            path: "hattat/core",
            external: true,
          }));
        },
      },
    ],
  });
  const code = result.outputFiles?.[0]?.text ?? "";
  sizes[name] = gzipSync(code).length;
  await writeFile(resolve(OUT, "figures", `${name}.js`), code);
  const types = await readFile(resolve(ROOT, "packages/figures/dist", `${name}.d.ts`), "utf8");
  await writeFile(
    resolve(OUT, "figures", `${name}.d.ts`),
    types.replaceAll("@hattatdev/core", "hattat/core"),
  );
  assert((sizes[name] ?? Infinity) <= 2048, `${name} exceeds 2 KB gzip`);
}
await mkdir(resolve(ROOT, "artifacts"), { recursive: true });
await writeFile(resolve(ROOT, "artifacts/sizes.json"), `${JSON.stringify(sizes, null, 2)}\n`);
console.log("Gzip bytes:", sizes);
assert(sizes.core !== undefined && sizes.core <= 6144, "Core exceeds 6 KB gzip");
