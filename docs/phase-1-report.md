# Phase 1 implementation evidence

Status: **implementation candidate; acceptance gate remains open**. Do not merge, publish,
or start Phase 2 until the remaining checks pass. This is agent-authored work.

The zero-dependency core now provides fixed buffers, deterministic geometry, isometric
projection, depth-based hidden-line clipping, critical springs, shared scheduling, accessible
SVG, and the vanilla mount/update/destroy lifecycle. Five original figures have default and
named ESM entries. The private headless CLI produces images and JSON from trusted modules.
Framework wrappers, Canvas, full signals, named themes, catalog generation, installable
skills, and agent evals remain later-phase work.

## Verification

- 51 unit tests; core V8 line coverage 99.6%, exceeding 90%.
- Bundled Chromium integration covers pointer, keyboard, reduced motion, cleanup, and the
  compiled README example. Fifteen rest/full/reduced-motion references cover all five figures.
- `look` renders intensity 0 / 0.5 / 1, with at least 10.5% sampled edge padding and 10.3:1
  computed `hi`/`edge` contrast on white. Reduced-motion screenshots equal rest despite input.
- Numerical buffers retain identity across resets; figure builds allocate no arrays, objects,
  or closures. SVG path strings allocate. Heap/CPU sampling is diagnostic evidence, not a
  claim of zero total allocations. `pnpm profile:runtime` writes the profiles under `artifacts`.
- No runtime network requests, telemetry, or core runtime dependencies are introduced.
  CLI and browser tools are development dependencies and are not a portable npm CLI yet.

## Size and geometry

| Entry | Gzip bytes | Raw segments | Limit |
| --- | ---: | ---: | ---: |
| Complete public core | 6,135 | — | 6,144 bytes |
| server-rack | 587 | 97 | 2,048 bytes / 400 segments |
| padlock | 672 | 61 | 2,048 bytes / 400 segments |
| drawer-stack | 551 | 72 | 2,048 bytes / 400 segments |
| gear-train | 743 | 120 | 2,048 bytes / 400 segments |
| wave-field | 617 | 84 | 2,048 bytes / 400 segments |

The build bundles all public core exports, uses gzip level 6, and excludes shared core from
individual figure measurements. The facade build always measures sizes, including when
upstream compilation uses Turbo cache. Coordinates round to 0.001 only at serialization.

## Runtime budget and remaining gate

The latest local 20-instance Chromium run used a 1200×900 viewport and 4× CPU throttling.
It recorded p95 5.1 ms/frame, maximum 5.8 ms/frame, first SVG generation 14.6 ms,
zero idle callbacks, and zero offscreen callbacks. The frame budget is 4 ms; **it fails**.
The test enforces the maximum, not just the percentile. Raw JSON and failure traces live in
`artifacts/performance.json` and `test-results`; CI uploads its independent evidence.
Local workstation contention changes timings, so this sample is not a portable guarantee.
First draw measures owned SVG path generation; browser paint and layout are not included.

Further rendering optimization is required; do not relax the threshold or report the gate as
passed. Human blind recognition (VIS-08) is still unreviewed. See
[before/after images](visual-changes/README.md) for intentional simplification.
Slow motion and static colors avoid intentional flashing; a formal luminance-frequency audit
and exhaustive non-linear custom-figure bounds are not claimed.
Wrapper hydration/CLS and agent evals remain pending in their designated later phases.

## Reproduction

Run `pnpm check`, `pnpm test`, `pnpm test:browser`, `pnpm test:performance`,
`pnpm profile:runtime`, and `pnpm look padlock --yes --json` after installing Chromium.
The performance command is expected to fail until the frame budget is met.
