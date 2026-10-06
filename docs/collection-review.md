# Twelve-figure collection review

The owner prioritized variety and visual quality on 2026-10-06. This increment expands the
collection from five to twelve figures across eight categories using the existing vanilla
engine. It does not start Phase 2 or publish an npm package. All geometry is original and
uses existing helpers, spring presets, and fixed reusable numeric buffers.

## Visual changes

Each new figure has a distinct silhouette, a resting pose, one primary interaction, and at
least three real selection intents. The images below are bundled public-entry regression
references at 240 px; reduced-motion references match the resting pose.

| Figure | Interaction | Rest | Full response | Reduced motion |
| --- | --- | --- | --- | --- |
| bar-city | Pointer position raises the nearest column | [Rest](../tests/references/bar-city-rest.png) | [Full](../tests/references/bar-city-full.png) | [Reduced](../tests/references/bar-city-reduced.png) |
| bridge | Approach tensions the suspension cables | [Rest](../tests/references/bridge-rest.png) | [Full](../tests/references/bridge-full.png) | [Reduced](../tests/references/bridge-reduced.png) |
| desk-lamp | Pointer position guides the lamp head | [Rest](../tests/references/desk-lamp-rest.png) | [Full](../tests/references/desk-lamp-full.png) | [Reduced](../tests/references/desk-lamp-reduced.png) |
| wind-turbine | Pointer position rotates the three blades | [Rest](../tests/references/wind-turbine-rest.png) | [Full](../tests/references/wind-turbine-full.png) | [Reduced](../tests/references/wind-turbine-reduced.png) |
| pendulum | Pointer position deflects the suspended bob | [Rest](../tests/references/pendulum-rest.png) | [Full](../tests/references/pendulum-full.png) | [Reduced](../tests/references/pendulum-reduced.png) |
| envelope | Approach lifts the flap and reveals a letter | [Rest](../tests/references/envelope-rest.png) | [Full](../tests/references/envelope-full.png) | [Reduced](../tests/references/envelope-reduced.png) |
| empty-box | Approach lifts the box flaps | [Rest](../tests/references/empty-box-rest.png) | [Full](../tests/references/empty-box-full.png) | [Reduced](../tests/references/empty-box-reduced.png) |

Gear teeth now have a second contour and periodic vertical connectors, giving the three
gears visible thickness. Padlock adds three shackle depth connectors; that adjustment stays
within the existing screenshot tolerance, so its baseline references are preserved. Drawer,
server-rack, and wave-field geometry and references remain unchanged.

| Intentional change | Before rest / full / reduced | After rest / full / reduced |
| --- | --- | --- |
| gear-train | [Rest](visual-changes/collection/before/gear-train-rest.png) / [Full](visual-changes/collection/before/gear-train-full.png) / [Reduced](visual-changes/collection/before/gear-train-reduced.png) | [Rest](visual-changes/collection/after/gear-train-rest.png) / [Full](visual-changes/collection/after/gear-train-full.png) / [Reduced](visual-changes/collection/after/gear-train-reduced.png) |
| padlock | [Rest](visual-changes/collection/before/padlock-rest.png) / [Full](visual-changes/collection/before/padlock-full.png) / [Reduced](visual-changes/collection/before/padlock-reduced.png) | [Rest](visual-changes/collection/after/padlock-rest.png) / [Full](visual-changes/collection/after/padlock-full.png) / [Reduced](visual-changes/collection/after/padlock-reduced.png) |

After images use the same 240 px viewport and default intensity 0.5 as the before references. Agent
inspection covered rest and full poses for the additions and changed figures. This is not
an independent human blind-recognition audit; VIS-08 remains a review limitation.

The gallery exposes all twelve figures, intent search, and eight category filters. Phone
layouts use a single column with larger figure previews. See the [desktop](review/collection/desktop.png)
and [phone](review/collection/mobile.png) screenshots. The [original gallery screenshots](gallery-review.md)
remain the five-figure baseline.

## Size and geometry

| Entry | Gzip bytes | Segments | Minimum sampled padding |
| --- | ---: | ---: | ---: |
| bar-city | 558 | 72 | 10.87% |
| bridge | 665 | 136 | 11.54% |
| desk-lamp | 714 | 100 | 19.90% |
| wind-turbine | 743 | 84 | 8.33% |
| pendulum | 671 | 98 | 10.87% |
| envelope | 816 | 60 | 16.30% |
| empty-box | 668 | 84 | 11.65% |
| gear-train | 774 | 210 | 10.84% |
| padlock | 698 | 64 | 10.53% |

Core remains 6,144 gzip bytes with zero runtime dependencies. Every figure is below its
2,048-byte and 400-segment SVG limits. Gear gzip increases by 4.17% and padlock by 3.87%;
neither exceeds the 5% PERF-06 threshold. The extra gear contours increase geometry work;
frame timing is measured separately. `look` checked all nine changed figures at intensity
0, 0.5, and 1, sampled their interaction envelopes, and reported no overflow. Computed
`hi`/`edge` contrast on white is 10.3:1; this does not audit every possible custom palette.

## Verification

The unit suite contains 63 passing tests; core V8 line coverage is 99.62%. Browser checks
exercise pointer response within 100 ms, keyboard changes, settling, labels, cleanup,
and 36 rest/full/reduced-motion references across all twelve public entries. The built-site
check exercises all twelve generated examples, filtering, palettes, autoplay, reduced motion,
and overflow at 320, 390, 768, and 1440 px. No new runtime dependencies are introduced.

The 20-instance performance fixture and diagnostic profiler now cycle all twelve definitions,
so results cannot be compared as an identical workload to the original five-figure fixture.
Frame/first-draw durations remain advisory under the owner-authorized PERF-01–05 exception;
raw measurements and exceeded targets remain visible. Idle/offscreen callbacks and bundle
limits remain enforced. Formal flashing and independent human recognition audits remain pending.

The local Windows Chromium 153 sample at 4x CPU recorded p95 4.2 ms, maximum 5.1 ms,
first draw 11.9 ms, 72 sampled frames, and zero idle/offscreen callbacks. The frame target
is exceeded; the duration gate passed only because of the existing scoped exception.
See [raw timing evidence](review/collection/performance.json). CI reports its own platform
measurements; these local results do not predict them.

Relevant review rules: GEN-01–05, CODE-03–08, API-02–04, VIS-01–09, MOT-01–06,
FIG-01–06, PERF-01–06, A11Y-01–05, AGT-07, TEST-01/03/04, GIT-01–06, DEP-01–04, DOC-01.
