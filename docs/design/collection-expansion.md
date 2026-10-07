# Collection expansion: twelve to thirty-two figures

Status: collection implementation authorized by the owner on 2026-10-06 by asking
to start. This plan does not authorize later-phase engine, agent-layer, wrapper,
or publication work.

Owner steering on 2026-10-07: improve physical detail and convincing solid geometry
before adding more models. The first quality pass covers db-stack, shield-layers,
server-rack, and desk-lamp. Resume the remaining additions after that review.

## Outcome and scope

Grow the collection from 12 to 32 original figures, with four choices in each of
the eight existing categories. Each addition must cover a useful page intention,
have a different silhouette from its neighbors, and convey its purpose at rest.
The north-star contribution is better selection from requests such as database,
privacy, collaboration, learning, sustainability, and onboarding illustrations.

Use the twenty remaining concepts from SPEC Section 7 as design briefs, not fixed
drawings. Produce all geometry in this repository. Do not reference or imitate
another illustration library. A variation of an existing figure does not count
as a new catalog entry (GEN-02/03, FIG-06).

Deliver three collection batches: eight additions, eight additions, then four.
Each batch is split into focused figure PRs of two to four models, with verified
commits pushed to a working branch. Merge green PRs and publish the gallery through
the existing GitHub Pages workflow. Do not push directly to main (GIT-01–06).

## Category balance

| Category | Existing | Batch A | Batch B | Batch C | Final |
| --- | ---: | ---: | ---: | ---: | ---: |
| Technology | 1 | 1 | 1 | 1 | 4 |
| Data | 1 | 1 | 1 | 1 | 4 |
| Security | 1 | 1 | 1 | 1 | 4 |
| Objects | 2 | 1 | 1 | 0 | 4 |
| Architecture | 1 | 1 | 1 | 1 | 4 |
| Mechanics | 2 | 1 | 1 | 0 | 4 |
| Nature/abstract | 2 | 1 | 1 | 0 | 4 |
| UI concepts | 2 | 1 | 1 | 0 | 4 |
| Total | 12 | 8 | 8 | 4 | 32 |

## Batch A: twenty figures, using the existing engine

Start here. These eight models add one choice to every category and need no new
signal, renderer, runtime dependency, or public option. Each intention column
provides at least three proposed selection intents; final metadata uses clear,
real user intentions rather than shape descriptions (FIG-02/03).

| Figure | Category | Selection intentions | Distinctive resting geometry | Primary interaction |
| --- | --- | --- | --- | --- |
| db-stack | Technology | databases, backups, data storage | Three cylindrical layers with clearly separated rims | Pointer height separates the nearest layer. |
| node-graph | Data | collaboration, integrations, relationships | Five raised nodes joined by a sparse network | Pointer position emphasizes the nearest node and its direct links. |
| shield-layers | Security | privacy, protection, compliance | Three nested shield contours with visible thickness | Approach separates the shield layers. |
| bookshelf | Objects | learning, documentation, knowledge bases | An open shelf holding differently proportioned books | Pointer position draws the nearest book forward. |
| stairs | Architecture | onboarding, progress, milestones | A freestanding flight of solid steps | Pointer position emphasizes successive steps. |
| balance-scale | Mechanics | comparisons, fairness, trade-offs | Two hanging pans on a central beam and pedestal | Horizontal pointer position tilts the beam and opposing pans. |
| crystal | Nature/abstract | discovery, creativity, premium features | An asymmetric faceted solid with a stable base | Horizontal pointer position rotates the crystal through a bounded arc. |
| loader-ring | UI concepts | loading, processing, preparation | A tilted segmented ring with visible depth | Pointer position advances the emphasized arc around the ring. |

Suggested PR order: db-stack + shield-layers; bookshelf + balance-scale;
node-graph + stairs; crystal + loader-ring. The first pair immediately improves
the two categories that currently have only one model and serves common website
requests. Later pairs introduce increasingly different silhouettes and motion.

Database cylinders must remain visually distinct from drawer-stack. Shield layers
must read as a shield before they move. Node-graph must not become a dense web of
lines. Loader-ring must have a meaningful static arc and settle after input;
continuous playback requires explicit autoplay (MOT-04/06).

## Batch B: twenty-eight figures, broader page intentions

| Figure | Category | Selection intentions | Distinctive resting geometry | Primary interaction available now |
| --- | --- | --- | --- | --- |
| circuit-board | Technology | hardware, computing, connected devices | A shallow board with a few components and stepped traces | Pointer position emphasizes a nearby trace group. |
| heat-grid | Data | activity, analytics, monitoring | A shallow matrix of cells with varied fixed heights | Pointer position emphasizes nearby cells. |
| vault-door | Security | secure storage, financial security, controlled access | A recessed frame, circular door, and spoke wheel | Horizontal pointer position rotates the wheel through a bounded arc. |
| coffee-cup | Objects | breaks, hospitality, team culture | A cup with a separated handle, saucer, and sparse steam contours | Approach raises and gently bends the steam contours. |
| city-block | Architecture | real estate, communities, infrastructure | Three buildings with different footprints around a shared street | Pointer height raises the buildings from their resting heights. |
| piston-row | Mechanics | automation, throughput, production | Three piston rods in an open supporting frame | Horizontal pointer position advances a bounded piston wave. |
| branching-tree | Nature/abstract | growth, sustainability, ecosystems | A trunk with several legible branches and a stable root base | Pointer height extends the branches from a recognizable resting tree. |
| magnifier-grid | UI concepts | search, inspection, discovery | A tilted grid and thick-rimmed lens with an offset handle | Pointer position moves the lens and expands nearby grid spacing. |

Suggested PR order: circuit-board + heat-grid; vault-door + coffee-cup;
city-block + branching-tree; piston-row + magnifier-grid. This separates the two
most geometry-heavy models into different PRs and keeps review manageable.

Heat-grid uses line tones and at most one accent element, without colored heatmap
fills. Circuit-board carries no text, branding, or logos. Coffee steam is finite
spring-driven geometry, not an indefinite particle simulation. Magnifier-grid
changes bounded local geometry; it adds no filter, texture, or browser zoom.

## Batch C: thirty-two figures, balanced categories

| Figure | Category | Selection intentions | Distinctive resting geometry | Primary interaction available now |
| --- | --- | --- | --- | --- |
| antenna | Technology | connectivity, broadcasting, communication | A mast, footings, and a few open signal arcs | Approach expands the signal arcs. |
| pie-layers | Data | proportions, allocation, segmentation | A shallow segmented circular chart on a low base | Pointer position lifts one slice. |
| key-ring | Security | permissions, credentials, account access | A ring holding three differently proportioned generic keys | Horizontal pointer position swings the keys through a bounded arc. |
| tower-crane | Architecture | construction, development, project delivery | A lattice mast, counterweight, jib, and hanging hook | Horizontal pointer position rotates the jib through a bounded arc. |

Suggested PR order: antenna + key-ring, then pie-layers + tower-crane. A crane is
deliberately last: occlusion, hook clearance, and animated bounds make it harder
to review than the first batch. Pie slices must remain recognizable without
colored fills. Key silhouettes must remain separate at 240 px.

## Input support is a separate completion gate

The current engine supports pointer coordinates/inside/pressed, focus, key, and
autoplay time. It does not implement scroll progress, drag displacement/velocity,
or pointer speed. The tables above describe achievable initial interactions;
they do not claim to implement all interactions proposed in SPEC Section 7.

Thirty-two accepted geometries complete the planned collection size, not Phase 3.
The release balance rule also requires three scroll-primary and three drag-primary
figures. Plan a separately designed signal increment before claiming that gate:

- Scroll: stairs, city-block, and branching-tree.
- Drag: balance-scale, vault-door, and tower-crane; pendulum is a possible later
  refinement once drag velocity and spring release are specified.

Keep keyboard alternatives and reduced-motion resting poses for every model now.
Do not implement local wheel listeners or ad hoc dragging inside figure files.
Changing public signal names, input behavior, or the core requires its own design,
phase authorization, and compatibility review (API-01/05, CODE-03, GEN-04).

## Quality and acceptance workflow

For each figure, write the primary interaction and intentions before geometry.
Review the unanimated 240 px silhouette first, then rest/full/reduced poses at
intensity 0, 0.5, and 1. Keep isometric projection, unit-aligned dimensions, shared
stroke, four tones, at most one accent element, hidden-line plates only, and at
least 8% padding throughout the interaction envelope (VIS-01–09, MOT-01–06).

Prefer 80–240 segments where the silhouette allows it; 60–400 is the existing SVG
acceptance range. These preferences are not new rules. Remove lines that obscure
recognition before adding detail. Static and reduced-motion poses must tell the
same visual story. Inspect the result ourselves without repeatedly asking the
owner to identify images. Record that this is agent inspection: an independent
human blind-recognition audit and formal flashing audit remain pending, and must
not be reported as completed (VIS-08, A11Y-05).

During authoring, run focused determinism/bounds checks and look only for changed
figures. At each PR boundary, run the existing required lint/type/build, unit,
browser, docs-example, and performance checks once against the final increment;
rerun only when failures or further changes justify it. Add reproducing tests for
bugs and preserve existing references; intentional visual changes need before/after
evidence. Every new figure receives rest/full/reduced references (TEST-01–04, FIG-04).

Enforce zero runtime dependencies in core, no frame-loop allocations, 2,048 gzip
bytes per figure, zero idle/offscreen callbacks, and meaningful keyboard/label/
contrast checks. Core is already at its 6,144-byte cap; the figure batches must
not grow it. Preserve the existing owner-authorized timing-only exception and
all raw duration warnings; it does not excuse size, lifecycle, or accessibility
failures. The latest twelve-figure local sample exceeded the 4 ms frame target.
Do not describe a passing advisory gate as meeting the original timing budget.

Keep the benchmark at twenty mounted instances. Once the registry exceeds twenty
definitions, measure deterministic cohorts that cover every new figure plus a
cohort of the measured heaviest models. Include differing simultaneous poses,
not only repeated synchronized ones; disclose cohort membership and workload
changes. Do not compare changed cohorts as identical performance samples (PERF-06).

## Integration and delivery evidence

Each figure PR updates typed exports/registry, bundled entry verification, browser
fixtures, visual references, gallery imports and counts, relevant category/search
expectations, executable examples, documentation, a Changeset, and DECISIONS.md.
Replace stale fixed counts with expectations derived from the existing registry
where appropriate; do not introduce the Phase 2 generated catalog or skills here.

The gallery retains its eight categories, intent search, and larger mobile previews.
Check the growing grid at 320/390/768/1440 px, existing theme controls, copied code,
offscreen sleeping, and cleanup. Add pagination or a new browsing interface only
if observed usability or performance makes it necessary, in a separate UI PR.

At 20, 28, and 32 figures, report the delivered models and category counts, review
images, measurements and warnings, pending audits, merged PRs, and the verified
live Pages URL. Package publication, wrappers, generated agent surfaces, and custom
domain migration retain their existing separate gates. No time estimate is a
promise: later geometry-heavy models advance only after their quality checks pass.

Relevant rules: GEN-01–05, CODE-01–08, API-02/03/05/06, VIS-01–09, MOT-01–06,
FIG-01–06, PERF-01–06, A11Y-01–05, TEST-01–04, GIT-01–06, DEP-01–04, DOC-01.
