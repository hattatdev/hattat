# Core foundation

Phase 1's numerical foundation and vanilla lifecycle are implemented; real-browser evidence
and the five figure acceptance checks are being completed. The package remains private and unpublished.

`defineFigure` validates and freezes metadata. `Scene` offers reusable geometry buffers and
seeded helpers. `project` writes into caller-owned storage. `advance` integrates a critically
damped spring. `renderSVG` produces a deterministic, accessible resting SVG without a DOM.

Allocate reusable point arrays and styles before `build`. The checked source examples live
in `tests/unit/core.test.ts`: projection, spring convergence, helpers, hidden lines, metadata,
determinism, and escaped SVG output. Run `pnpm test` to execute them with V8 coverage.

Hidden-line plates use camera depth to clip visible intervals before global tone batching.
SVG path strings allocate at the renderer boundary; numerical storage is reused.
Runtime errors E003/E004 explain incomplete metadata, non-finite geometry, or capacity overflow.

`mount` reserves aspect ratio, appends owned SVG, and returns `update` and idempotent `destroy`.
It preserves unrelated host content, shares one rAF, sleeps offscreen, and restores previous
layout/focus attributes on destruction. Pointer and arrow keys drive the same parameters.
Stable poses stop scheduling; only explicit autoplay keeps animating. Reduced motion freezes
the resting pose. Unsupported Canvas, signals, and preset themes fail explicitly in Phase 1.
The modeling unit is 0.5 world units; fixed dimensions must be multiples of 0.25.

Five built-ins are available through the bundled private `hattat/figures/<name>` entries:
`server-rack`, `padlock`, `drawer-stack`, `gear-train`, and `wave-field`.
Each has a named camelCase export and an identical default export. The public core entry
exports `defineFigure`, `mount`, `renderSVG`, and their shared types. Numerical helpers
are implementation workspace APIs, excluded from the distribution's public exports.

The build enforces 6,144 gzip bytes for the complete public core entry and 2,048 for each
figure excluding core. SVG coordinates round to 0.001 world units at serialization;
projection, clipping, spring state, and padding measurements retain double precision.
Explicitly prefixed private implementation properties are mangled; DOM APIs and figure contracts remain intact.

Mounted copies of the same definition reuse geometry only when every parameter and intensity
match. Springs, signals, options, labels, and SVG nodes remain independent. Keep `build` pure:
results must depend on numeric values, not parameter-object identity or invocation count.
The shared result is invalidated before rebuilding and released when the last copy is destroyed.
Layout bounds are observed and measured on first pointer input if observation has not run yet.

Projection computes plate orientation once; mounted rendering skips unchanged SVG path writes.

Signed clipping edges use fixed numeric storage. Shared fill and stroke width inherit from
the SVG root, while non-scaling stroke remains on each path; changing theme stroke and host
size is browser-tested. Default setup invokes custom theme/input validators only when supplied.
