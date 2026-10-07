# Individual model quality review

The owner requested an individual review and correction of all fourteen existing
models on 2026-10-07. This pass preserves their original identities and interactions.
Every model was inspected at 240 px in rest and maximum-response poses, with
240/480 px light/dark strips covering both input extremes, rest, and reduced motion.
The desk-lamp pilot's geometry is retained; thirteen models receive visual changes.
No competitor code, geometry, or assets were used.

## Per-model findings and changes

| Model | Finding and correction |
| --- | --- |
| padlock | Sharp block body and narrow doubled shackle. Round the metal case corners, broaden the U band, hide rear edges, and give the connected keyway a circular escutcheon. Use the heavy spring for deliberate opening. |
| drawer-stack | Solid cuboid handles looked heavy. Replace them with open metal pulls with a gap behind the grip, and add a quiet label-holder seam. Preserve hollow trays. |
| server-rack | Two unstructured strokes did little to explain each server face. Use paired recessed circular cooling apertures, preserving the side ventilation, rack handles, and single status accent. |
| gear-train | Long triangular tooth flanks looked like stars. Derive flanks from an original involute construction at a 20-degree pressure angle and preserve opposite phases. Sample the profile economically; this is an illustration, not a manufacturing drawing. |
| wind-turbine | Cuboid motor and rectangular blades. Chamfer the nacelle casing and sweep the blade shoulders and tips; mask body contours against the six-point rotor and hub throughout motion. |
| pendulum | Rods began in empty space below the beam. Add a visible bearing, start the rod below its rim, and give the bob a restrained inset ring. Preserve constant orbit length. |
| bridge | Uprights appeared planted directly on a thin deck. Add distinct footings carrying the towers while retaining connected cables, hangers, curbs, and road guides. |
| envelope | Thick slab and transparent moving flap. Halve the case depth, round the paper corners, mask both sides of the triangular flap, and hide letter rules under it. Keep folds and a simple seal. |
| empty-box | Flap edges crossed the interior and neighboring folds. Compile opaque wall, floor, top-flap, and underside surfaces before drawing. Remove diagonal decorative scores. The opening remains visibly hollow. |
| db-stack | Top ring read as a decorative concentric ellipse. Build a defined quarter-unit bevel with a smaller top cap, masking the bevel itself and lower tiers against the actual tapered volume. |
| shield-layers | Center crease was a line on a flat plate. Raise the center of the inset to form a connected ridge and two shallow facets. Preserve quiet rear layers and exposed thickness. |
| wave-field | Coarse sampling produced a pointed, faceted crest. Use a broad smooth resting wave and derive twenty curve samples between each legal grid extent. Preserve pointer-local deformation and a meaningful reduced-motion pose. |
| bar-city | Column depth made the chart unnecessarily bulky. Slim the column footprints while retaining their varied heights, anchored scale, and input selection. This remains a data illustration. |
| desk-lamp | Reinspect the pilot's arms, pivots, shade, base, and motion. Retain its geometry and references. Share its original clipping implementation internally with the other opaque figures. |

## Visual evidence

Matched default-intensity rest/full/reduced references:

- [Before](visual-changes/model-quality/before/) from d7fe38a.
- [After](visual-changes/model-quality/after/) from this change.
- [Per-model strips](review/model-quality/): filename MODEL-SIZE-THEME.png;
  columns are lower-left input, rest, upper-right input, and reduced motion,
  all at intensity 1. Sizes are 240 and 480; themes are light and dark.
- The three lamp references remain unchanged. Only the other 39 references are
  intentionally updated. Source compilation precedes packaged browser checks.

These are agent visual observations. Independent human blind recognition (VIS-08)
and the formal flashing audit remain pending. Technical checks do not establish
commercial quality or photorealism; these are isometric line illustrations.

## Implementation and verification

Private geometry support lives under packages/figures/src/internal and is bundled
into each relevant figure entry. Every defineFigure remains in its own file.
The core, dependencies, public props, metadata keys, figure membership, and package
entry names are unchanged. Fixed module buffers are reused across builds and
instances; no numeric arrays, objects, or closures are created in a frame.

The typed clipping buffers total 54,784 bytes once per loaded helper module, plus
the shared point/style arrays and figure-specific scratch arrays. The lamp's
separate clipping buffers are removed.
Tree shaking removes unused extrusion/panel support from the lamp's entry.

The new tests exercise a covered middle interval with two visible endpoints,
an opaque underside facing the camera, bearing occlusion, and paper-flap ray
occlusion across 101 poses. The paper test accounts for pre-existing renderer plates: it fails against
d7fe38a at pose 14 with one covered contour sample, and passes after correction.
Existing tests cover non-intersecting gear teeth, opaque hub and blade faces,
lamp arm lengths, pivots and shade, determinism, padding, intensity, keyboard,
reduced motion, and loop settling.

Rule IDs: GEN-01–05, CODE-01–08, API-02/04/06, VIS-01–09, MOT-01–06,
FIG-01–06, PERF-01–06, A11Y-01–05, TEST-01–04, GIT-01–06, DEP-01–04,
DOC-01/02. Existing timing-only exceptions remain in force.

## Measured budgets and costs

Core remains 6144 gzip bytes. All figures remain under 2048 gzip bytes and 400
segments, with at least 8% padding throughout the sampled input envelope.

| Figure | Gzip before → after (bytes) | Maximum segments | Minimum padding |
| --- | --- | --- | --- |
| bar-city | 633 → 634 | 83 | 11.96% |
| bridge | 702 → 716 | 224 | 11.54% |
| db-stack | 1079 → 1134 | 208 | 9.29% |
| desk-lamp | 1880 → 1894 | 312 | 13.21% |
| drawer-stack | 612 → 675 | 328 | 11.11% |
| empty-box | 767 → 1990 | 69 | 12.61% |
| envelope | 771 → 1955 | 126 | 16.30% |
| gear-train | 776 → 870 | 336 | 10.84% |
| padlock | 760 → 1983 | 186 | 9.07% |
| pendulum | 749 → 886 | 148 | 10.87% |
| server-rack | 766 → 825 | 329 | 9.62% |
| shield-layers | 1036 → 1062 | 87 | 9.09% |
| wave-field | 670 → 639 | 360 | 11.51% |
| wind-turbine | 1606 → 1716 | 94 | 8.33% |

[Raw model metrics](review/model-quality/model-metrics.json) record entry sizes,
fixed typed storage, and look samples at intensity 0, 0.5, and 1.

The rounded padlock, opaque paper flap, and carton masks each bundle private
clipping support. This raises their sizes from 760/771/767 to 1983/1955/1990
bytes. These substantial increases buy the visible solid surfaces; they are not
free refinements. The drawer pulls, server apertures, sampled gear flanks, bearing,
beveled tiers, and turbine casing also increase their entries by more than 5%.
The table reports every change rather than hiding these costs.

When importing source definitions together, the private helper module is shared.
Self-contained packaged entries each contain a separate copy: the fourteen-entry
packaged gallery has 221608 fixed Float64Array bytes versus 55920 before, an
increase of 165688 bytes. Each loaded copy is reused across its instances. This
count excludes Scene/Projection storage, ordinary arrays, JS object overhead,
and renderer strings; it is not a measured total heap estimate.

Paired packaged versions were measured in one Chromium process on Windows at
4× CPU throttle, twenty instances, 1200×900 viewport, using the existing harness
warm-up/sample/settling intervals. Geometry counts assert the correct baseline
and current versions. Profiling and screenshot recording run outside the timing
samples. [Raw paired measurements](review/model-quality/paired-performance.json)
include every sample and per-instance mount duration.
The complete raw measurement JSON intentionally exceeds the 300-line guideline
so all eight cohorts' samples remain reviewable.

| Cohort | p95 frame before → after (ms) | Max frame before → after (ms) | First draw before → after (ms) |
| --- | --- | --- | --- |
| mixed-fourteen | 10.5 → 11.8 | 11.7 → 17.7 | 13.2 → 11.9 |
| twenty-padlocks | 1.2 → 2.1 | 1.3 → 2.8 | 7.3 → 7.4 |
| twenty-boxes | 0.9 → 1.2 | 1.2 → 2.7 | 8.0 → 6.3 |
| twenty-envelopes | 1.4 → 1.5 | 1.7 → 2.3 | 6.3 → 6.2 |

Every cohort has zero idle and offscreen callbacks. The increases above 5% are
accepted tradeoffs for complete solid interval masks and smooth curves, under
the owner's existing timing-only exception. The mixed frame result exceeds the
4 ms target. Measurements have scheduling/JIT noise and establish neither a
performance improvement nor a universal frame duration. First draw is below
16 ms in this paired run; size and lifecycle budgets remain hard checks.

The separate [standard harness run](review/model-quality/standard-performance.json)
measured 13.3 ms p95, 14.5 ms maximum frame, and 34.8 ms maximum first draw;
idle/offscreen callbacks were zero. Its first draw also exceeds the 16 ms target.
Both exceeded timing targets remain advisory under the existing exception.

Local validation: pnpm check, 79 unit tests with 99.62% core line coverage,
18 packaged browser cases, fourteen gallery examples, diagnostic profiles,
and the standard performance harness. Human recognition and flashing acceptance
remain pending; Phase 2 has not started.
