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
npm lookup returned E404 for `hattat` on 2026-10-06; this does not prove registration rights.
Recheck the name at publication; no name reservation or package publication has occurred.
