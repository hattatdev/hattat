# Hattat

Hattat is a free, MIT-licensed library of interactive isometric line figures for the web, designed for integration by AI agents.

**Pre-release:** the library, CLI, and skills are not published. The vanilla API works in this
workspace; installation commands await their corresponding releases.

```sh
# Planned skill installation (Phase 2)
npx skills add hattatdev/hattat
# Planned npm installation (CI release with provenance)
npm install hattat
```

Provide a `#hero` element with a CSS width. The figure reserves its aspect ratio:

```js
import { mount } from "hattat";
import { gearTrain } from "hattat/figures/gear-train";

const hero = document.querySelector("#hero");
if (hero instanceof HTMLElement) {
  mount(hero, gearTrain, { intensity: 0.6 });
}
```

The example is compiled and run in Chromium in CI. Available entries are `server-rack`,
`padlock`, `drawer-stack`, `gear-train`, and `wave-field`, with default and named exports.
Pointer movement and arrow keys drive the figures. Reduced motion shows their resting poses.
See [core API](docs/core.md) and [preview CLI](docs/look.md) for options and lifecycle behavior.

## Develop locally

Use Node 24.13.0 and pnpm 10.25.0:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm exec playwright install chromium
pnpm test:browser
pnpm test:performance
pnpm look padlock --yes --json
```

`pnpm check` validates formatting, strict types, workspace builds, distribution sizes,
repository rules, and the README example. Unit coverage exceeds 90%; browser checks cover
packaged imports, interaction, accessibility, and 15 visual references.
The 4× CPU timing check currently exceeds its 4 ms/frame budget, so Phase 1 remains open.
Human blind recognition and later-phase agent evals are also pending. See the
[Phase 1 evidence](docs/phase-1-report.md) for measured results and limitations.

## Project documents

- [Agent instructions](AGENTS.md) and [contribution guide](CONTRIBUTING.md)
- [Complete specification](docs/SPEC.md) and [translation audit](docs/spec-translation.md)
- [Approved Phase 1 design](docs/design/phase-1.md)
- [Decisions](DECISIONS.md) and [readiness](docs/bootstrap-status.json)

The repository uses pnpm workspaces and Turborepo. Internal packages and the bundled `hattat`
distribution remain private. Framework bindings, the docs application, skills, and evals have
reserved directories. Core has zero runtime dependencies, telemetry, and runtime network calls.

Licensed under [MIT](LICENSE).
