# Specification translation audit

Source: owner's `hattat_master_spec.md`, supplied on 2026-10-06.
Source SHA-256: `BFA65DB81217F46196A113141EE3E48FE6612B05CD84BB2DB2CDD1AFB3B9BDFA`.
The Turkish original remains at its supplied external location and is not copied into the repo.

The owner selected a complete English translation to satisfy GEN-01.
All 14 numbered sections (0–13), all eight categories and 32 names, option defaults,
CLI commands, performance thresholds, phase gates, and rule groups have been retained.
Section 12 is expanded into individually identified bullets and synchronized with AGENTS.
The grouped PERF-01–05 label is retained as supplied; no new metric-to-ID mapping is invented.

| Sections | Preserved content |
| --- | --- |
| 0–3 | Initial task order, approval gate, working mode, originality, north star, scope, monorepo layout |
| 4–6 | Projection equations, rendering/physics/signals/SSR, options and tokens, figure API and authoring workflow |
| 7–8 | All 32 figures, balance requirements, four skills, six CLI commands, generated assets, catalog entry, distribution |
| 9–11 | All eight budgets, a11y requirements, test layers, eval starters/task counts, all four phase gates and reports |
| 12–13 | All 14 rule groups, MUST/SHOULD and enforcement tags, definition of done, unresolved questions and defaults |

Intentional normalization: `KULLANICI` becomes `hattatdev` in repository/installation references
and the fallback npm scope. Turkish human-facing example text is translated; technical
identifiers, figures, proposed code snippets, values, and existing English descriptions are preserved.
The prose error example still mentions `lock`, even though the catalog name is `padlock`,
because the source does; runtime errors must use the actual generated figure registry.

Known source tensions are preserved, not silently removed:
the sample `build` allocates tuples while CODE-05 forbids frame-loop allocations;
the SVG path strings also allocate; plane painting and global tone batching need clipping;
Section 8 proposes npm in Phase 1 while Section 11 places v0.1 publication in Phase 3.
The phase design explains these issues. No release occurs during bootstrap.

AGT-07 is deferred only for proposed unpublished API examples, including the source's
`handle.update({...})` comment. The README has a complete, explicitly planned example.
No example is claimed to have executed. CI lists this exception and pending runtime gates.
