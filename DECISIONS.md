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

## 2026-10-06 — Cross-platform text encoding

Require valid UTF-8 when reading repository text in CI. Windows legacy-encoded punctuation
previously passed the English scan because decoding silently replaced it; repair the files
and reject invalid bytes with the path and an actionable fix. A regression exercises the
real repository checker using a temporary invalid text file. Save repository text with LF
newlines to avoid native Windows newline translation when converting existing bytes.

## 2026-10-06 — Visual review preference

The owner asked the agent to inspect the images without asking the owner to identify them
again. Complete informed agent visual inspection and record it accurately; do not claim
an independent human blind test or change VIS-08. Do not repeat the recognition question.

## 2026-10-06 — Repeated figure geometry reuse

Measured identical synchronized instances repeated the same numerical work. Share one latest
scene/projection per figure definition, comparing all parameters and intensity without frame
allocations. Keep independent instance state and write each SVG immediately; differing poses
recompute. Invalidate cached parameters before a potentially failing build and release the
cache after the last destroy. Regression tests exercise independence, intensity, failures,
and lifetime. Defer layout reads until ResizeObserver or first pointer input to avoid forced
layout between consecutive mounts. Prefix only private renderer storage/methods for safe
mangling; keep every author-facing helper and metadata name intact. Preserve error codes and
actionable remedies while removing repetitive prose. Complete core is 6,126 gzip bytes.
Local 20-instance 4x CPU measurements improved from max 5.8 ms to 2.5 ms, first generation
13.5 ms, idle/offscreen callbacks zero. Fresh CI remains required. The benchmark repeats five
synchronized figures; differing simultaneous poses must not inherit this performance claim.

## 2026-10-06 — DOM mutation and timing isolation

CPU profiles identified native SVG attribute writes and projection as substantial work.
Skip writes when a path is unchanged; a regression verifies only two changing paths mutate
and an unchanged resize emits none. Compute plate orientation once during projection setup.
Complete core is 6,114 gzip bytes; all reference images remain unchanged. Separate the timing
case into its own file with Playwright tracing disabled, so screenshot/DOM recording does not
add work to enforcement; retain JSON/error context and independent cold-mount/runtime CPU
profiles. Functional/visual cases retain failure traces. Add all twenty mount durations to
the report instead of only their maximum. Do not relax timing limits: CI on 5780787 failed
both platforms, while the latest isolated local sample is max 3.1 ms and first generation
14.2 ms. Fresh CI must confirm these changes before the gate can pass.

## 2026-10-06 — Cold setup and clipping work

CI on 3be6952 meets the frame budget on both platforms (Ubuntu max 3.3 ms, Windows 2.3 ms)
but cold first mount remains above 16 ms (22.0/16.9 ms). Keep that sample in the report.
Precompute signed edge coefficients in reusable projection storage to remove repeated edge
arithmetic. This adds 14,080 bytes of numeric storage per shared definition and no frame
objects. Split optional custom theme/input validation from the default path. Inherit shared
fill and stroke width from the SVG root; preserve per-path non-scaling strokes, covered by
a real browser regression including theme updates and resizing. Parse generated escaped
markup into a fragment in the live document, avoiding an inert template document. Internal
reset follows the private-property mangling convention. Keep stable error codes and fixes.
The combined local sample is p95 2.0 ms, maximum 2.4 ms, first mount 13.3 ms; core 6,142 gzip
bytes. Visual references remain unchanged. These are local results, not CI acceptance.

## 2026-10-06 — Prepare SVG before insertion

Read motion/color preferences before SVG insertion, and apply label/theme/input attributes
while the SVG is detached. Insert the fully configured owned SVG once, then observe and
register it. Geometry/option errors still precede DOM changes. Existing lifecycle, keyboard,
reduced-motion, theme-width, resize, cleanup, and visual tests pass. Local max frame is 2.5 ms,
first mount 12.7 ms; core is exactly 6,144 gzip bytes. CI on 78eaef6 still fails cold first
mount on both platforms (21.3/24.0 ms); do not substitute local results for that gate.
An event-listener-object variant was measured and removed: it increased bundle size without
a material startup benefit. Preserve the established listeners and their removal semantics.

## 2026-10-06 — Owner-authorized timing exception and merge

The owner explicitly requested removing the performance merge blocker and merging the
working branch into main. RULE-EXCEPTION: PERF-01–05 applies only to Phase 1 frame
and first-draw duration assertions. Retain the 4 ms/frame and 16 ms first-draw targets as
advisory warnings and preserve all raw timings. Latest CI on 787746d reports Ubuntu maximum
3.3 ms / first draw 19.4 ms, Windows maximum 5.2 ms / first draw 22.5 ms; these do not satisfy
the original budgets. Enforce nonempty finite measurements, zero idle/offscreen callbacks,
bundle sizes, functional tests, and accessibility checks. Merge through the existing PR,
without direct pushes to main. This scoped owner override does not revise the canonical rules
or authorize npm publication, Phase 2, or claims of completed independent visual/flashing audits.

## 2026-10-06 — Public gallery and temporary GitHub Pages hosting

The owner requested a user-facing UI and temporary GitHub Pages hosting, with a custom
domain to follow. Build only the requested gallery/playground from the five existing figures;
this explicitly authorizes that docs UI before the full Phase 3 rollout, without authorizing
Phase 2 agent-layer work or claiming wrapper/catalog completion. Use an original paper-and-ink
editorial layout, local font fallbacks, and existing theme objects. Add no runtime dependencies,
tracking, remote fonts, or runtime network requests. Keep the package unpublished and label
copied code as an API preview. Build a self-contained static directory with relative URLs so
hosting can change later without core changes. Deploy via GitHub Actions after PR merge;
never push directly to main. CI exercises the actual built site under `/hattat/` and executes
its generated example. Preserve prior figure references; gallery images are separate UI review
artifacts. GEN-03, GEN-04, CODE-03, API-06, A11Y-01–04, AGT-07, GIT-03–06, DEP-03–04, DOC-01.

## 2026-10-06 — Prioritize collection variety and visual quality

The owner chose collection variety and quality before later-phase agent work. Add seven
original figures using the existing engine: bar-city, bridge, desk-lamp, wind-turbine,
pendulum, envelope, and empty-box. This gives twelve figures across eight categories and
more intent-specific choices toward the north star, without new runtime dependencies or
core/API changes. Give gears a second tooth contour and padlock explicit shackle depth
connectors. Preserve before images and initialize rest/full/reduced references only for
intentional changes. Enlarge phone gallery previews with a single-column layout and verify
every copied example. Generalize bundled entries and private look name recognition so
new figures are included without a second hardcoded catalog. Keep public catalog/skills
generation in Phase 2. Cycle all twelve definitions in 20-instance timing and diagnostic
fixtures, retaining the scoped advisory duration exception and raw evidence; do not claim
an identical workload to the old five-figure measurements. Agent visual inspection does
not satisfy an independent human blind audit. Publish the gallery through PR merge and
the existing Pages workflow. GEN-03/04, FIG-01–06, VIS-08, TEST-03, PERF-01–06, GIT-03–06.

## 2026-10-06 — Plan collection growth to thirty-two figures

The owner requested a plan for more models. Record a proposed 8 + 8 + 4 expansion
in docs/design/collection-expansion.md, reaching four figures in each existing
category. Prioritize database, protection, knowledge, relationships, and progress
intentions while keeping silhouettes distinct. Deliver focused figure PRs using
the current pointer/keyboard engine; plan scroll and drag separately because those
signals do not exist yet. Thirty-two geometries alone do not complete Phase 3 or
its input balance gate. Retain bundle limits, required review evidence, the scoped
timing exception, and pending independent recognition/flashing audits. This change
records a plan only and starts no engine or later-phase implementation. GEN-03/04,
FIG-02/03/06, MOT-01, PERF-01–06, GIT-02/06.

## 2026-10-06 — Begin expansion with database and protection figures

The owner asked to start the collection expansion. Implement db-stack and
shield-layers first: common database/backups and protection/compliance intentions
gain distinct alternatives in the two least-populated categories. Use only the
current geometry and pointer/keyboard spring system; keep all static dimensions
unit-aligned and core unchanged. The gallery and its executable examples include
both models. Derive expected model membership in its checker from the existing
typed registry, and let introductory copy and the runtime count accommodate growth.
Keep the independent human recognition/flashing limitations and timing-only owner
exception visible. New models receive six references; existing images are untouched.
GEN-03/04, FIG-01–06, VIS-02/08, API-06, TEST-03, GIT-02–06.

## 2026-10-07 — Prioritize physical detail before further collection growth

The owner asked for convincing, less basic models. Inspection found transparent
overlaps and empty surfaces in db-stack, shield-layers, server-rack, and desk-lamp.
Improve those four first within the existing isometric line language: physically
motivated seams, rims, handles, fasteners, service panels, pivots, and spring hardware.
Remove covered rear contours rather than adding decorative lines over them.
For coaxial cylinders and convex shield extrusions, figure-local camera-ray tests
clip only occluded contour intervals, using fixed numeric buffers and no frame
allocations. Keep the core, API, runtime dependencies, figure names, and primary
input mappings intact. Preserve all before images and update only the twelve
intentionally changed references. Add a reproducing check for the lower database
rim previously drawn through a closed upper layer. Measure the added geometry
and justify entry-size increases above 5% in review. The 32-model expansion remains
planned; quality takes priority over the next additions. GEN-03/04, CODE-03–05,
VIS-05/08/09, FIG-06, PERF-06, TEST-02/03, GIT-02–06.

## 2026-10-07 — Correct visual crowding before adding more figures

The owner rejected the physical-detail pass as scribbly and unsuitable for use.
Treat automated checks as technical evidence, not proof of visual quality. Replace
the lamp's overlapping double arm frames and coils with a single thick articulated
arm, clipping covered edges against opaque pivot drums. Reduce repeated rims,
fasteners, tiny openings, and rear-face details in the database, shield, and rack.
Inspect matched 240 px rest/full/reduced images and maximum-intensity response;
preserve the rejected pass as historical evidence. Add a reproducing regression
for lines crossing the lamp's opaque pivot face, and justify clipping's bundle
cost with measurements. Keep core/API/dependencies and fourteen-entry membership
unchanged. The other ten models still need visual review; no commercial-quality,
human blind-recognition, or flashing acceptance is claimed. Collection growth stays
secondary to readable drawing design. GEN-03/04, CODE-03–05, VIS-05/08/09,
PERF-06, TEST-02/03, GIT-02–06.

## 2026-10-07 — Review and correct the remaining ten illustrations

The owner approved extending the readability pass to the other ten figures.
Inspect every resting illustration at 240 px and every maximum-response pose;
correct concrete overlap and shape problems before growing the collection.
Use hollow drawer trays with opaque walls, a thicker shackle and connected keyhole,
non-intersecting stylized gear profiles, a meaningful static wave, a data scale,
clear bridge curbs, a tapered turbine mast with opaque rotor clipping, a solid
pendulum disk, a single envelope flap, and four carton flaps with fewer rear lines.
Keep existing metadata, signals, API, dependencies, and fourteen-model membership.
Figure-local convex interval clipping masks turbine body lines without expanding
the core at its exact size cap. Reusable numeric buffers avoid frame allocations.
Add reproducing checks for gear crossings, hub overlap, and blade transparency;
preserve ten matched before/after triplets from ccc03fc, updating only the
thirty affected references. Record the drawer's extra geometry and turbine clipping
costs rather than presenting them as free optimizations. Agent inspection and
technical checks remain distinct from independent visual acceptance; no further
recognition question is requested from the owner. GEN-03/04, CODE-03–05,
VIS-05/08/09, MOT-06, PERF-06, TEST-02/03, GIT-02–06.
