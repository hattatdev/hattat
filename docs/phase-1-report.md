# Phase 1 implementation evidence

Status: **owner authorized merging the Phase 1 candidate on 2026-10-06**. Runtime timing
is advisory under the recorded exception; remaining review limitations are listed below.
Do not publish or start Phase 2 without separate authorization. This is agent-authored work.

The zero-dependency core now provides fixed buffers, deterministic geometry, isometric
projection, depth-based hidden-line clipping, critical springs, shared scheduling, accessible
SVG, and the vanilla mount/update/destroy lifecycle. Five original figures have default and
named ESM entries. The private headless CLI produces images and JSON from trusted modules.
Framework wrappers, Canvas, full signals, named themes, catalog generation, installable
skills, and agent evals remain later-phase work. The owner separately authorized a public
gallery/playground and temporary GitHub Pages hosting; see [the gallery notes](../apps/docs/README.md).
The five-figure measurements below describe the original Phase 1 candidate; the later
[collection review](collection-review.md) records the twelve-figure expansion.

## Verification

- 56 unit tests; core V8 line coverage 99.6%, exceeding 90%.
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
| Complete public core | 6,144 | — | 6,144 bytes |
| server-rack | 587 | 97 | 2,048 bytes / 400 segments |
| padlock | 672 | 61 | 2,048 bytes / 400 segments |
| drawer-stack | 551 | 72 | 2,048 bytes / 400 segments |
| gear-train | 743 | 120 | 2,048 bytes / 400 segments |
| wave-field | 617 | 84 | 2,048 bytes / 400 segments |

The build bundles all public core exports, uses gzip level 6, and excludes shared core from
individual figure measurements. The facade build always measures sizes, including when
upstream compilation uses Turbo cache. Coordinates round to 0.001 only at serialization.

## Runtime budget and remaining gate

The pre-exception local 20-instance Chromium run used a 1200×900 viewport and 4× CPU throttling.
It recorded p95 2.0 ms/frame, maximum 2.5 ms/frame, first SVG generation 12.7 ms,
zero idle callbacks, and zero offscreen callbacks. That local sample met the original timing targets.
The test records the maximum and percentile. Raw JSON and error context live in
`artifacts/performance.json` and `test-results`. CPU/heap profiles, including cold mount,
run separately; timing enforcement disables Playwright screenshot/DOM tracing to isolate it
from recording work. Functional and visual failures retain their traces.

CI on 787746d exceeds timing targets: Ubuntu maximum 3.3 ms, first generation 19.4 ms;
Windows p95 4.1 ms, maximum 5.2 ms, first generation 22.5 ms. Both have zero idle/offscreen
callbacks. The owner requested removal of the timing merge blocker and merging into main.
RULE-EXCEPTION: PERF-01–05 Phase 1 frame/first-draw durations are advisory, with raw JSON
and warnings retained. Size, idle/offscreen, functional, and accessibility checks still block
CI. All twenty mounts are recorded, including the cold one, without prewarming. This is an
authorized acceptance exception, not a claim that the original timing budgets pass.
Local workstation contention changes timings, so this sample is not a portable guarantee.
First draw measures owned SVG path generation; browser paint and layout are not included.

Identical figure definitions and parameter values now reuse one geometry/projection result.
Each instance keeps independent springs and DOM paths; different poses recompute. This
benchmark uses four synchronized instances of each figure, so it benefits from that reuse;
arbitrary differing poses are not covered by these timing numbers. The cache invalidates
before failed builds and is released after the final destroy. Layout measurement is deferred
to observation or first input. Unchanged SVG paths are not rewritten; plate orientation is
computed once per plate instead of once per segment/plate pair. Signed edge coefficients
are also prepared once in reusable storage. Common SVG fill/stroke-width attributes live on
the root, preserving non-scaling path strokes and theme overrides with fewer parsed attributes.
Read preferences before inserting SVG; prepare label/theme/input attributes on the detached SVG.
Custom-theme/input validation is split into functions called only when supplied. Agent visual inspection recognizes the lock, coupled gears, rack, wave grid, and drawer
cabinet at 240 px. This is informed agent review; an independent human blind test has not
been performed. The owner asked the agent to evaluate the images and not request this
review again; no repeat request will be made. See
[before/after images](visual-changes/README.md) for intentional simplification.
Slow motion and static colors avoid intentional flashing; a formal luminance-frequency audit
and exhaustive non-linear custom-figure bounds are not claimed.
Wrapper hydration/CLS and agent evals remain pending in their designated later phases.

## Reproduction

Run `pnpm check`, `pnpm test`, `pnpm test:browser`, `pnpm test:performance`,
`pnpm profile:runtime`, and `pnpm look padlock --yes --json` after installing Chromium.
Timing targets remain visible as advisory measurements under the owner-authorized exception.
The exception verification run recorded max 5.8 ms, first draw 12.6 ms, and zero idle/offscreen
callbacks; it emitted the timing warning and passed the retained assertions.
