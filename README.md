# Hattat

Hattat is a free, MIT-licensed library of interactive isometric line figures for the web, designed for integration by AI agents.

**Pre-release:** the library, CLI, and skills are not published. The commands and API below
show planned usage; they will work only after their corresponding releases.

```sh
# Planned skill installation (Phase 2)
npx skills add hattatdev/hattat
# Planned library installation (after a CI release)
npm install hattat
```

```js
// Planned vanilla usage (Phase 1); not implemented in the bootstrap.
import { mount } from "hattat";
import { gearTrain } from "hattat/figures/gear-train";

const hero = document.querySelector("#hero");
if (hero instanceof HTMLElement) {
  const handle = mount(hero, gearTrain, { intensity: 0.6 });
  handle.update({ intensity: 0.8 });
  handle.destroy();
}
```

## Develop locally

Use Node 24.13.0 and pnpm 10.25.0:

```sh
pnpm install --frozen-lockfile
pnpm check
```

The current build compiles private placeholders. CI checks structure, formatting,
types, compilation, PR metadata, and dependency licenses.
Engine behavior, visual rendering, runtime budgets, coverage, and agent evals remain pending.

## Project documents

- [Agent instructions](AGENTS.md) and [contribution guide](CONTRIBUTING.md)
- [Complete specification](docs/SPEC.md) and [translation audit](docs/spec-translation.md)
- [Phase 1 design awaiting approval](docs/design/phase-1.md)
- [Decisions](DECISIONS.md) and [bootstrap readiness](docs/bootstrap-status.json)

The repository uses pnpm workspaces and Turborepo. Internal packages live under
`packages/`; the future `hattat` distribution bundles their public entries.
Framework bindings, the docs application, skills, and evals have reserved directories.
Core must have zero runtime dependencies. No telemetry or paid service is planned.

Licensed under [MIT](LICENSE).
