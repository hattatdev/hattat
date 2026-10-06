# Contributing

Read [AGENTS](AGENTS.md), [SPEC](docs/SPEC.md), and [the phase design](docs/design/phase-1.md) first.
Phase 1 design is approved. Runtime timing and human review still block its acceptance gate.

## Local setup

Use Node 24.13.0 and pnpm 10.25.0. Install pnpm through your existing package manager
if necessary, then run:

```sh
pnpm install --frozen-lockfile
pnpm check
```

`pnpm format` applies Biome formatting and safe fixes.
`pnpm check` runs Biome, workspace/script type checks, workspace compilation and distribution size validation, and structural
bootstrap checks. It reports future runtime gates as pending rather than passing them.
Build artifacts are ignored; a skeleton build is not evidence of a working figure.

## Pull requests

Create a focused branch from main. Use Conventional Commits and cite relevant rule IDs.
Do not push directly to main. Use the PR template and mark agent authorship explicitly.
Include actual verification evidence, visual images when applicable, and measured budget changes.
Rule changes require a separate PR. New runtime dependencies require owner approval and a decision.
Every user-facing change requires a Changeset, including this private implementation.

## Figures and releases

Use `pnpm look <figure-or-file> --yes --json` to inspect trusted local figures.
Run `pnpm test`, `pnpm test:browser`, and `pnpm test:performance` before requesting review.
The broader create/check CLI and generated catalog are reserved for Phase 2.
Never copy another project's figure design, code, naming, or text.
Generated references must be regenerated from source rather than edited by hand.
No publication workflow exists yet; npm publication must eventually use CI with provenance.
