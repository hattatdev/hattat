# Decisions

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-10-06 | Bootstrap only the repository, tooling, documentation, and Phase 1 proposal. | The owner approved this scope; SPEC Section 0 requires design approval before engine work. |
| 2026-10-06 | Translate the complete source specification into English. | The owner selected English translation to comply with GEN-01; retain all sections, rules, tables, and proposed examples. |
| 2026-10-06 | Use `hattatdev/hattat` and resolve fallback npm scope to `@hattatdev`. | The owner created the organization and supplied the remote. |
| 2026-10-06 | Permit only the initial README commit on main; develop the bootstrap on `chore/bootstrap` through a PR. | Explicit owner approval resolves the one-time GIT-06 conflict; the exception cannot authorize subsequent direct pushes. |
| 2026-10-06 | Add a private `packages/hattat` distribution facade. | The spec's unscoped package and subpath imports require one public distribution over internal workspaces. |
| 2026-10-06 | Keep every workspace private and expose no runtime API during bootstrap. | A compiling placeholder must not be mistaken for a working or publishable library. |
| 2026-10-06 | Pin Node 24.13.0, pnpm 10.25.0, TypeScript 7.0.2, Biome 2.5.15, Turbo 2.11.7, Changesets 3.0.3, and Node types 24.19.1. | Match installed Node/pnpm; resolve development tooling from official npm metadata and preserve exact versions in the lockfile. |
| 2026-10-06 | Use TypeScript compilation for skeleton builds; defer distribution bundling. | Verify the real toolchain without adding speculative packaging or runtime behavior. |
| 2026-10-06 | Disable Turbo telemetry in the task runner and CI. | Tooling should respect the project's no-telemetry intent as well as future runtime code. |
| 2026-10-06 | Install no external runtime dependencies. | CODE-03 and DEP-01; internal workspace edges follow the authorized architecture. |
| 2026-10-06 | Report visual, performance, coverage, and agent evaluations as pending. | There is no engine or eval implementation to measure; bootstrap success does not satisfy those gates. |
| 2026-10-06 | Initialize CodeGraph locally after the skeleton is ready; ignore its files in Git. | The owner approved indexing for later structural research. |
| 2026-10-06 | Preserve SPEC as one file even above 300 lines. | CODE-07 is a SHOULD; a complete canonical document is an explicit owner requirement. |
| 2026-10-06 | Preserve proposed source examples and label README installation examples as future usage. | Owner-approved bootstrap cannot execute unpublished APIs; scoped AGT-07 deferral is listed in CI. |
| 2026-10-06 | Propose server-rack, padlock, drawer-stack, gear-train, and wave-field for Phase 1. | The approved plan samples five catalog categories and exercises extraction, proximity, coupled rotation, and deformation. |

The owner approved Phase 1 on 2026-10-06 and requested verified incremental commits and pushes.
Development tools added: Vitest 4.0.18, V8 coverage 4.0.18, Playwright 1.63.0, and esbuild 0.28.2.
Vitest 5's Vite dependency introduced MPL-2.0 lightningcss; use the compatible Vitest 4 toolchain to satisfy DEP-02 without weakening the license policy.
These are development-only dependencies; core continues to have zero runtime dependencies.
The shared modeling unit is 0.5 world units; fixed geometry dimensions use whole or half multiples of that unit. Quarter-world-unit details therefore remain consistent with VIS-02.
Happy DOM 20.14.5 is development-only, providing lifecycle coverage alongside real Chromium verification.
npm lookup returned E404 for `hattat` on 2026-10-06; this does not prove registration rights.
Recheck the name at publication; no name reservation or package publication has occurred.

## 2026-10-06 — Phase 1 distribution and measured optimization

- Bundle the approved public core surface (`mount`, `defineFigure`, `renderSVG`, shared types)
  separately from internal numerical workspace exports. Figures share `hattat/core`; importing
  two entries must not duplicate the shared scheduler. All workspaces remain private.
- Mangle only explicitly prefixed instance implementation properties. Native DOM property
  names and author-facing metadata/helpers must never be mangled.
- Round SVG coordinates to 0.001 world units; numerical geometry and clipping remain exact.
  This reduces oversized path strings without a visible displacement at 240 px.
- Reuse mount buffers for first render and reject oversized geometry before DOM side effects.
  Draw the final snapped spring pose even when the scheduler reports settlement.
- CPU measurements remain above 4 ms/frame. A precomputed plate-edge/bounds variant did not
  materially improve measured timing and was removed. The phase gate remains pending;
  passing size/unit checks does not authorize Phase 2 or merging.

## 2026-10-06 — Phase 1 evidence and clean-checkout checks

- Simplify occluding cabinet/rack shells and ornamental subdivision in response to measured
  CPU cost. Preserve before/after images; keep first regression references under review.
- Cache immutable curve samples and reusable wave heights, and omit diagnostic bounds scans
  during mounted rendering. `look` and unit acceptance still calculate the original bounds.
- Enforce maximum sampled frame time, retaining p95 as a diagnostic. Sampling CPU/heap occurs
  separately so profiler overhead cannot inflate the enforcement run. The frame gate still fails.
- Typecheck tasks depend on upstream builds: private workspace exports point to declarations
  in dist, which do not exist on a fresh checkout. CI caught the missing build dependency.
- Skip dependency declaration checking in the test-only tsconfig because happy-dom's Node
  stream declaration is incompatible with the pinned Node types. Authored tests and production
  sources retain strict and noUncheckedIndexedAccess checks; production does not skip libs.
- CODE-07 SHOULD departure: the mounted instance and lifecycle test exceed 300 lines after
  explicit property mangling and regressions. Keep paired setup/teardown and shared fixtures
  together during this candidate; review/refactor remains required before final acceptance.
