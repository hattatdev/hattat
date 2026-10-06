# Core foundation

Phase 1's numerical foundation is implemented. The DOM lifecycle and five production figures
are still being built; the package remains private and unpublished.

`defineFigure` validates and freezes metadata. `Scene` offers reusable geometry buffers and
seeded helpers. `project` writes into caller-owned storage. `advance` integrates a critically
damped spring. `renderSVG` produces a deterministic, accessible resting SVG without a DOM.

Allocate reusable point arrays and styles before `build`. The checked source examples live
in `tests/unit/core.test.ts`: projection, spring convergence, helpers, hidden lines, metadata,
determinism, and escaped SVG output. Run `pnpm test` to execute them with V8 coverage.

Hidden-line plates use camera depth to clip visible intervals before global tone batching.
SVG path strings allocate at the renderer boundary; numerical storage is reused.
Runtime errors E003/E004 explain incomplete metadata, non-finite geometry, or capacity overflow.
