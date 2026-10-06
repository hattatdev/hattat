import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

interface Manifest {
  name: string;
  private: boolean;
  license: string;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
  scripts?: Record<string, string>;
}

interface CompilerConfig {
  extends?: string;
  compilerOptions?: { strict?: boolean; noUncheckedIndexedAccess?: boolean };
}

interface Readiness {
  stage: string;
  phase1Approved: boolean;
  runtimeChecks: { id: string; status: string; reason: string }[];
  exceptions: {
    rule: string;
    status: string;
    scope: string;
    reason: string;
    authorization: string;
  }[];
}

const WORKSPACES = [
  "packages/core",
  "packages/figures",
  "packages/react",
  "packages/vue",
  "packages/svelte",
  "packages/element",
  "packages/cli",
  "packages/hattat",
  "apps/docs",
];
const REQUIRED = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "DECISIONS.md",
  "docs/SPEC.md",
  "docs/design/phase-1.md",
  "docs/spec-translation.md",
  "docs/bootstrap-status.json",
  "skills/README.md",
  "evals/README.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/workflows/ci.yml",
  "pnpm-workspace.yaml",
  "pnpm-lock.yaml",
  ".node-version",
  "turbo.json",
  "biome.json",
];
const EDGES: Record<string, string[]> = {
  "@hattatdev/core": [],
  "@hattatdev/figures": ["@hattatdev/core"],
  "@hattatdev/react": ["@hattatdev/core", "@hattatdev/figures"],
  "@hattatdev/vue": ["@hattatdev/core", "@hattatdev/figures"],
  "@hattatdev/svelte": ["@hattatdev/core", "@hattatdev/figures"],
  "@hattatdev/element": ["@hattatdev/core", "@hattatdev/figures"],
  "@hattatdev/cli": ["@hattatdev/core", "@hattatdev/figures"],
  hattat: ["@hattatdev/core", "@hattatdev/figures", "@hattatdev/cli"],
  "@hattatdev/docs": ["hattat"],
};

function read(path: string): string {
  return readFileSync(path, "utf8").replace(/\r\n/g, "\n");
}

function manifest(path: string): Manifest {
  return JSON.parse(read(path)) as Manifest;
}

try {
  for (const path of REQUIRED) assert(existsSync(path), `Missing required bootstrap file: ${path}`);
  const ROOT = manifest("package.json");
  assert.equal(ROOT.private, true, "The root must not be publishable");
  assert.equal(ROOT.packageManager, "pnpm@10.25.0");
  assert.equal(read(".node-version").trim(), "24.13.0");
  const CONFIG = JSON.parse(read("tsconfig.base.json")) as CompilerConfig;
  assert.equal(CONFIG.compilerOptions?.strict, true, "CODE-01: strict is required");
  assert.equal(
    CONFIG.compilerOptions?.noUncheckedIndexedAccess,
    true,
    "CODE-01: indexed access checks are required",
  );

  const SEEN = new Set<string>();
  for (const path of WORKSPACES) {
    const PACKAGE = manifest(`${path}/package.json`);
    assert(!SEEN.has(PACKAGE.name), `Duplicate workspace: ${PACKAGE.name}`);
    SEEN.add(PACKAGE.name);
    assert.equal(PACKAGE.private, true, `Bootstrap package ${PACKAGE.name} must stay private`);
    assert.equal(PACKAGE.license, "MIT");
    assert.deepEqual(
      Object.keys(PACKAGE.dependencies ?? {}).sort(),
      [...(EDGES[PACKAGE.name] ?? [])].sort(),
      `Unexpected dependency layer: ${PACKAGE.name}`,
    );
    for (const version of Object.values(PACKAGE.dependencies ?? {}))
      assert.equal(version, "workspace:*");
    for (const key of ["optionalDependencies", "peerDependencies"] as const) {
      assert.equal(
        Object.keys(PACKAGE[key] ?? {}).length,
        0,
        "Bootstrap introduces no optional or peer runtime dependency",
      );
    }
    const LOCAL = JSON.parse(read(`${path}/tsconfig.json`)) as CompilerConfig;
    assert.equal(LOCAL.extends, "../../tsconfig.base.json");
    assert.equal(Object.keys(LOCAL.compilerOptions ?? {}).includes("strict"), false);
    assert.equal(
      Object.keys(LOCAL.compilerOptions ?? {}).includes("noUncheckedIndexedAccess"),
      false,
    );
    assert.equal(
      read(`${path}/src/index.ts`)
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("//"))
        .join("\n"),
      "export {};",
      "Phase 1 implementation requires design approval",
    );
    assert(
      existsSync(`${path}/dist/index.js`) && existsSync(`${path}/dist/index.d.ts`),
      `Run pnpm build before structural validation: ${path}`,
    );
  }
  assert.deepEqual([...SEEN].sort(), Object.keys(EDGES).sort());
  assert.equal(
    Object.keys(manifest("packages/core/package.json").dependencies ?? {}).length,
    0,
    "CODE-03: core has zero runtime dependencies",
  );

  const SPEC = read("docs/SPEC.md");
  const AGENTS = read("AGENTS.md");
  const HEADINGS = [...SPEC.matchAll(/^## (\d+)\./gm)].map((match) => Number(match[1]));
  assert.deepEqual(
    HEADINGS,
    Array.from({ length: 14 }, (_, index) => index),
  );
  const SPEC_RULES = SPEC.split("## 12. Rules\n")[1]?.split("\n## 13.")[0]?.trim();
  const AGENT_RULES = AGENTS.split("## Project rules\n")[1]
    ?.split("\n<!-- CODEGRAPH_START -->")[0]
    ?.trim();
  assert(SPEC_RULES && AGENT_RULES, "Rule sections must be present");
  assert.equal(SPEC_RULES, AGENT_RULES, "The canonical rules and AGENTS must stay synchronized");
  for (const prefix of [
    "GEN",
    "CODE",
    "API",
    "VIS",
    "MOT",
    "FIG",
    "PERF",
    "A11Y",
    "AGT",
    "TEST",
    "GIT",
    "DEP",
    "DOC",
    "GOV",
  ]) {
    assert(SPEC_RULES.includes(`**${prefix}-01`), `Missing rule group: ${prefix}`);
  }
  assert.equal(read("CLAUDE.md").trim(), "Read and follow AGENTS.md");
  assert(AGENTS.includes("<!-- CODEGRAPH_START -->") && AGENTS.includes("<!-- CODEGRAPH_END -->"));
  assert(read("docs/design/phase-1.md").includes("proposed — owner approval required"));
  assert(read("README.md").includes("not published"));
  assert(read("LICENSE").startsWith("MIT License"));
  const TEMPLATE = read(".github/PULL_REQUEST_TEMPLATE.md");
  for (const title of [
    "Purpose",
    "Rule IDs",
    "Test evidence",
    "Look images",
    "Performance impact",
  ]) {
    assert(TEMPLATE.includes(`## ${title}`), `GIT-03: missing PR field ${title}`);
  }

  const FILES = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8", windowsHide: true },
  )
    .split("\0")
    .filter(Boolean);
  for (const path of FILES) {
    assert(
      !/(^|\/)(node_modules|dist|\.turbo|\.codegraph)\//.test(path),
      `Generated files must remain untracked: ${path}`,
    );
    assert(!/\.tsbuildinfo$/.test(path), `Build cache must remain untracked: ${path}`);
    if (/\.(md|ts|json|ya?ml)$/.test(path)) {
      assert(
        !/[\u00e7\u011f\u0131\u00f6\u015f\u00fc\u00c7\u011e\u0130\u00d6\u015e\u00dc]/.test(
          read(path),
        ),
        `GEN-01: untranslated Turkish text in ${path}`,
      );
    }
  }

  const STATUS = JSON.parse(read("docs/bootstrap-status.json")) as Readiness;
  assert.equal(STATUS.stage, "bootstrap");
  assert.equal(
    STATUS.phase1Approved,
    false,
    "A new phase must replace the bootstrap gate deliberately",
  );
  assert.equal(STATUS.runtimeChecks.length, 6);
  for (const check of STATUS.runtimeChecks) {
    assert.equal(check.status, "pending", "Do not report unimplemented runtime gates as passed");
    assert(check.reason.length > 0);
  }
  console.log(
    "PASS: workspace layering, zero core runtime dependencies, strict types, private packages, built placeholders, English text, canonical rules, and tracked-file hygiene.",
  );
  for (const exception of STATUS.exceptions) {
    assert(exception.authorization && exception.scope && exception.reason);
    console.log(
      `RULE-EXCEPTION [${exception.status}] ${exception.rule}: ${exception.scope}. ${exception.reason}`,
    );
  }
  for (const check of STATUS.runtimeChecks) console.log(`PENDING: ${check.id}. ${check.reason}`);
  console.log(
    "Phase 1 design approval: pending. No runtime, visual, performance, coverage, or eval gate is claimed.",
  );
} catch (error) {
  console.error(
    "HATTAT_E902: Bootstrap validation failed. Fix the reported repository invariant, then rerun pnpm check.",
    error instanceof Error ? error.message : String(error),
  );
  process.exitCode = 1;
}
