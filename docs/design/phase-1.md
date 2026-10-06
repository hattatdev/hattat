# Phase 1: core engine and five figures

Status: **approved by the owner on 2026-10-06** (continue, commit, and push as work progresses).
This document specifies Phase 1 behavior; implementation evidence is recorded separately.
Source of truth: [SPEC](../SPEC.md); rules: [AGENTS](../../AGENTS.md).

## Outcome and boundaries

Deliver a dependency-free core, five original pointer-driven figures, the vanilla API,
a usable headless `look` command, and measured visual/performance checks.
An agent must be able to mount a figure with defaults and obtain evidence of its behavior.
Do not start Phase 2 until the Phase 1 gate passes.

Canvas, full scroll/drag/touch/tilt signal support, framework wrappers, generated catalog,
installable skills, and the agent eval runner belong to later phases.
Basic accessibility and theme tokens are required immediately for FIG-05.
Only static server rendering of the resting SVG is covered here; wrapper hydration is Phase 3.

## Package and public contracts

Internal packages are private implementation workspaces. `packages/hattat` will bundle them
into one ESM npm package, with declarations and separate entries. No package is publishable yet.
Core never imports figures, wrappers, the CLI, or browser automation.
Figures import only core. Wrappers import core/figures. CLI tooling sits above core/figures.

| Public entry | Phase 1 contract |
| --- | --- |
| `hattat` | Named `mount`; returns `update(partialOptions)` and idempotent `destroy()` |
| `hattat/core` | Named `defineFigure`, shared option/definition types, deterministic rest-SVG serialization |
| `hattat/figures/<name>` | Named camelCase export and default export of the same definition |
| `hattat` executable | `look <figure-or-file>`, with `--yes` and `--json` |

Preserve all eight SPEC Section 5 option names and defaults. Derive figure-name unions from
the five definitions. Accept finite intensity values within 0–1; reject invalid values.
`auto` uses SVG in this phase, and all five figures must stay at or below 400 segments.
Requests for Canvas, unimplemented input signals, or named theme presets beyond `mono`
fail explicitly instead of silently changing behavior. Theme objects and all seven CSS tokens work.
`motion="auto"` follows the media query; `reduce` always freezes at rest.
`full` explicitly opts into motion. `interactive=false` removes input/focus handlers.
`autoplay` is a slow seeded demo; real input takes priority and reduced motion suppresses it.

`mount` requires an HTMLElement, reserves the figure's declared aspect ratio before drawing,
and appends an owned SVG without clearing unrelated host content. Updating changes options
and invalidates the frame as needed. Destroy cancels owned work, listeners, and observers,
removes only owned DOM, and releases buffers. Multiple mounts on the same host are rejected.
Invalid targets, options, metadata, and capacity overflow use `HATTAT_E###` with actionable text.
Allocate runtime error codes centrally, separately from bootstrap tooling's E900–E999 range.

## Scene, physics, and rendering

Frame flow: normalize input → advance preset springs → build into reusable scene storage →
project → remove hidden segments → batch by tone → update SVG paths → deactivate if settled.

- Use `xs=(x-y)cos30°`, `ys=(x+y)sin30°-z`. Geometry uses whole/half unit dimensions.
  Compute fixed bounds across the full interaction range at initialization; keep at least 8%
  padding on every edge so input cannot change layout or clip any accepted pose.
- Store segment endpoints, tone IDs, plates, and spring state in preallocated numeric buffers.
  Geometry helpers write into buffers; never allocate tuples/options inside `build`.
  Author reusable point/style values outside `build`, preserving the source helper contract.
  Seeded random is reset consistently so identical params produce identical geometry.
- Clip hidden projected segment intervals against the ordered opaque plates before global
  tone batching. Plates render first; visible lines use one path per `hi`, `edge`, `mid`, `lo`,
  plus at most one accent element. Keep stroke and plate color in CSS tokens.
  Cache plane ordering for fixed topology; animated clipping is recomputed without allocation.
- Use `vector-effect="non-scaling-stroke"`. Motion frames update only path `d` attributes;
  theme, accessibility, and viewport attributes update only when their inputs change.
  Constructing SVG path strings necessarily allocates; measure this renderer boundary separately
  from the zero-allocation numerical frame loop. Do not claim literally zero SVG allocations.
- Springs are critically damped, delta-time based, and use `snappy`, `default`, `gentle`, `heavy`.
  Clamp large elapsed times after suspension. Wake only on changed input/options/visibility.
  A stable pointer holds a pose but causes no ongoing frames; leaving input returns to rest
  and settles within 1.5 s. Preserve one shared rAF across every mounted figure.
- Normalize pointer coordinates from cached host bounds. Pointer leave/cancel and lost focus
  restore rest targets. Arrow keys adjust the same primary parameter while focused.
  Cache bounds on resize/scroll events rather than measuring layout in every animation frame.
  IntersectionObserver suspends offscreen work; ResizeObserver updates viewport size.
  Use one-shot static rendering if animation-frame support is unavailable.

The allocation-heavy source example and plane-first/tone-batched wording need these explicit
interpretations to satisfy CODE-05, hidden-line correctness, and the practical SVG budget.
This design approval approves the approach, not a change to any rule; measured departures
must follow GOV-02 before merging.

## Initial figures

Each figure is one deterministic `defineFigure` file with complete metadata and ≥ 3 real intents.
Names come from the owner's catalog; geometry and interaction code must be original.

| Figure | Export | Primary interaction | Intended use |
| --- | --- | --- | --- |
| `server-rack` | `serverRack` | Pointer height draws the nearest card forward. | Hosting, infrastructure, operations |
| `padlock` | `padlock` | Pointer proximity lifts the shackle. | Login, authentication, privacy |
| `drawer-stack` | `drawerStack` | Pointer height opens the nearest drawer and its neighbors less. | Storage, archives, file organization |
| `gear-train` | `gearTrain` | Pointer horizontal displacement rotates coupled gears. | Automation, workflows, processing |
| `wave-field` | `waveField` | Pointer position raises a local wave that settles when input ends. | Signals, communication, exploration |

All five use a 1:1 aspect and default intensity 0.5. Target 60–400 segments each.
Keyboard alternatives must work from the first release. Scroll/drag balance is completed
with the 32-figure catalog, not claimed by this pointer-focused slice.

## Evidence and phase gate

Use Vitest for projection, seeded determinism, clipping, delta-time spring convergence,
option validation, cleanup, and shared scheduling; enforce ≥ 90% core line coverage.
Use Playwright/Chromium for the real DOM, pointer/keyboard input, observer behavior,
reduced motion, contrast, resizing, and zero console errors.

`look` uses a local trusted figure module and a network-free browser fixture; arbitrary modules
execute trusted code and are not a sandbox. Return exit 0 only if rendering and checks pass.
Emit rest/full/motion/blind PNGs and a report JSON with segment counts, frame timing,
contrast, overflow, and intensity 0 / 0.5 / 1 results. Fix viewport, seed, fonts, and clock.
Blind recognition is a human review result; do not substitute a successful screenshot for it.

Measure minified tree-shaken ESM gzip (core ≤ 6 KB; each figure excluding core ≤ 2 KB).
Measure 20 visible instances of these five figures under Chromium 4× CPU throttling:
script time/frame ≤ 4 ms, first draw ≤ 16 ms, response ≤ 100 ms, idle rAF stopped,
offscreen draws zero, and settling ≤ 1.5 s. Record traces and allocation evidence;
do not count empty placeholders or cached compilation as performance evidence.
Framework hydration CLS remains pending until Phase 3; reserve static aspect ratio now.

The phase passes only when all five figures have reviewed rest/full/reduced-motion references,
blind review evidence, required accessibility checks, enforced budgets, executable vanilla
documentation examples, and a report of completed work and remaining later-phase checks.
Any exceeded budget blocks the gate. Do not publish until distribution smoke checks pass
and a separate release workflow provides npm provenance.

## Delivery order after approval

1. Shared types, validated figure definitions, projection, reusable geometry, and unit tests.
2. SVG resting render, hidden-line validation, preset springs, and shared lifecycle.
3. Pointer/keyboard integration and minimal theme/reduced-motion support.
4. Five figures, `look`, regression references, and independent budget measurements.
5. Vanilla docs, packaged-import smoke checks, and the Phase 1 report for owner review.

No engine implementation, runtime examples, publication, or Phase 2 work is authorized by
the bootstrap alone.
