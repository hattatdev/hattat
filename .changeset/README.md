# Changesets

Run `pnpm changeset` for a user-facing package change once the distribution package is enabled for release.
The bootstrap has no public runtime API and all packages are private, so it carries no release Changeset.
No publication workflow is enabled. Releases must eventually run from CI with npm provenance (GIT-05).
