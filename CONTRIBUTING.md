# Contributing

Read [AGENTS](AGENTS.md), [SPEC](docs/SPEC.md), and [the phase design](docs/design/phase-1.md) first.
Phase 1 implementation is blocked on owner design approval, not on toolchain setup.

## Local setup

Use Node 24.13.0 and pnpm 10.25.0. Install pnpm through your existing package manager
if necessary, then run:

```sh
pnpm install --frozen-lockfile
pnpm check
```

`pnpm format` applies Biome formatting and safe fixes.
`pnpm check` runs Biome, workspace/script type checks, placeholder compilation, and structural
bootstrap checks. It reports future runtime gates as pending rather than passing them.
Build artifacts are ignored; a skeleton build is not evidence of a working figure.

## Pull requests

Create a focused branch from main. Use Conventional Commits and cite relevant rule IDs.
Do not push directly to main. Use the PR template and mark agent authorship explicitly.
Include actual verification evidence, visual images when applicable, and measured budget changes.
Rule changes require a separate PR. New runtime dependencies require owner approval and a decision.
A user-facing released-package change requires `pnpm changeset`; this private bootstrap does not.

## Figures and releases

Once the CLI is implemented, follow SPEC Section 6 to create, inspect, check, and propose figures.
Never copy another project's figure design, code, naming, or text.
Generated references must be regenerated from source rather than edited by hand.
No publication workflow exists yet; npm publication must eventually use CI with provenance.
