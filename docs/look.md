# Headless figure preview

The private Phase 1 CLI renders trusted local modules using installed development tools.
It is not yet a standalone npm executable. Build with `pnpm build`, install Chromium with
`pnpm exec playwright install chromium`, then run:

```sh
pnpm look padlock --yes --json
```

Use a built-in name or an absolute/local path to a module with a default `FigureDefinition`
export. `--out <directory>` selects output; the default is `artifacts/look`. Modules execute
trusted code; browser routing blocks runtime network requests but is not a code sandbox.
The CLI never prompts, accepts `--yes`, and exits 1 with an actionable `HATTAT_E###` on failure.
`--json` emits one JSON object, including errors, without progress text on stdout.

For intensity 0, 0.5 and 1, it emits 240 px rest, full response, blind, and reduced-motion PNGs;
a 720 px three-frame motion strip; and JSON reports with counts, contrast, padding, overflow,
and unthrottled numerical build/projection timing. A fixed 60 Hz frame clock makes poses
repeatable. The strip shows full response returning to rest, with 120 ms between frames.
Reduced motion must equal the resting image despite pointer input.

Padding is sampled along each parameter's envelope and all joint endpoint combinations.
This detects the supplied figures' extrema; arbitrary non-linear custom modules can have
unsampled intermediate extrema. `look` cannot prove exhaustive bounds for custom code.
Contrast uses computed `hi`/`edge` strokes against the actual background. Segment overflow,
padding below 8%, contrast below 4.5, and browser errors fail validation.
Do not interpret the numerical preview timing as the full 20-instance performance budget.

Regression references live in `tests/references` and are compared against the bundled public
entries in Chromium. Initial references and intentional simplification are documented in
[visual changes](visual-changes/README.md). Human blind recognition remains a separate review.
The expanded twelve-figure collection and intentional before/after images are recorded in
[collection review](collection-review.md). See [expansion review](expansion-review.md) for subsequent additions.
All built-in entries are accepted by name.

The [physical detail review](realism-review.md) preserves matched before/after
triplets for intentional changes to database, shield, rack, and lamp geometry.
