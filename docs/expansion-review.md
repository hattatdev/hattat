# Collection expansion evidence

Implementation of the [expansion plan](design/collection-expansion.md) began after
the owner's instruction to start on 2026-10-06. This report records delivered
increments; unimplemented concepts remain in the plan. The previous twelve-model
baseline and its visual changes remain in [collection review](collection-review.md).

On 2026-10-07, the owner prioritized more convincing physical detail before further
additions. See [physical detail review](realism-review.md) for the four revised
models. Measurements below describe the original fourteen-model increment.

## First increment: database and protection

Fourteen figures now span the same eight categories. Technology and security each
have two choices. No core, public option, dependency, or existing geometry changes.
The database has three cylindrical layers with separate rims and only front lower
contours; movement opens a gap below the selected layer while keeping upper layers
ordered. The shield has three thick, unit-aligned contours that separate on approach.

| Figure | Selection intentions | Gzip bytes | Segments | Minimum sampled padding | Rest / full / reduced |
| --- | --- | ---: | ---: | ---: | --- |
| db-stack | databases, backups, data storage, persistence | 641 | 150 | 9.29% | [Rest](../tests/references/db-stack-rest.png) / [Full](../tests/references/db-stack-full.png) / [Reduced](../tests/references/db-stack-reduced.png) |
| shield-layers | protection, compliance, privacy, defense in depth | 569 | 72 | 9.09% | [Rest](../tests/references/shield-layers-rest.png) / [Full](../tests/references/shield-layers-full.png) / [Reduced](../tests/references/shield-layers-reduced.png) |

Both expose independent default/named public entries, meaningful labels, existing
springs, keyboard alternatives, and reduced-motion resting poses. The gallery adds
them to search, category filters, and the playground's executable examples. Its
visible count follows the mounted collection; the built-site check compares names
with the typed registry rather than a stale fixed count. Introductory copy allows
the collection to grow without a second hardcoded model total.

Agent inspection covered 240 px rest/full poses; look checks intensity 0, 0.5, and
1, reports no overflow, and measures hi/edge contrast of 10.3:1 on white. Independent
human blind recognition and a formal flashing audit remain pending. Existing visual
references are unchanged; six references are initialized only for the new models.

Verification: 65 unit tests pass with 99.62% core line coverage. All eighteen
browser cases passed; the database simplification then passed its focused unit
and regenerated visual checks. The built-site check exercised every model example,
filters, palettes, motion controls, and four responsive widths. Strict checks pass.
Core remains exactly 6,144 gzip bytes and each new entry is below 2,048. The timing-only
owner exception remains scoped as previously documented; measured durations are
reported with warnings, not described as satisfying the original timing budgets.

Applicable review rules: GEN-01–05, CODE-03–08, API-02/03/06, VIS-01–09, MOT-01–06,
FIG-01–06, PERF-01–06, A11Y-01–05, TEST-01/03/04, GIT-01–06, DEP-01–04, DOC-01.

The final local fourteen-definition, twenty-instance sample at 4x CPU records p95
5.8 ms, maximum 6.2 ms, first draw 13.0 ms, and zero idle/offscreen callbacks. See
[raw measurements](review/expansion/database-shield-performance.json). Maximum frame
is 21.6% above the prior twelve-definition local sample (5.1 ms), with changed
cohort membership; these are not identical workloads or an isolated causal
comparison. The new database/protection choices justify the added geometry, while
removing redundant database rim contours reduced its initial 246 segments to 150.
The 4 ms target remains exceeded and advisory under the existing exception.
CI reports independent platform measurements. PERF-06.
