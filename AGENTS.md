# Hattat agent instructions

Read `docs/SPEC.md` before writing code. It is the project's source of truth.
All repository code, comments, commits, documentation, and skill text must be in English.

## Current phase gate

The bootstrap prepares the monorepo and `docs/design/phase-1.md`.
Wait for the owner's approval of that design before implementing Phase 1.
The owner's approval to implement the bootstrap does not approve the engine design.

## Project rules

**MUST** is mandatory. **SHOULD** is the default; departures require a reason. `[CI]` means automated enforcement, `[LINT]` means lint/type enforcement, and `[REVIEW]` means review enforcement. Cite rule IDs in commits, PRs, and comments. Exceptions use `RULE-EXCEPTION: <ID> <reason>` in code.

### GEN — General

- **GEN-01 MUST** use English for all repository text. [REVIEW]
- **GEN-02 MUST** copy nothing from other projects; stop when originality is in doubt. [REVIEW]
- **GEN-03 MUST** add no feature whose contribution to the north star cannot be explained. [REVIEW]
- **GEN-04 MUST** record important decisions in `DECISIONS.md`. [REVIEW]
- **GEN-05 SHOULD** avoid unmeasured optimizations and speculative "we may need this later" code. [REVIEW]

### CODE — Implementation

- **CODE-01 MUST** enable TypeScript `strict` and `noUncheckedIndexedAccess`; `any` is forbidden. [LINT]
- **CODE-02 MUST** use one tool, Biome, for linting and formatting. [LINT]
- **CODE-03 MUST** keep `core` free of runtime dependencies. [CI]
- **CODE-04 MUST** make `build` pure and deterministic: no `Math.random`, `Date.now`, or DOM access. [CI]
- **CODE-05 MUST** create no objects, arrays, or closures in the frame loop. [CI]
- **CODE-06 MUST** give public APIs TSDoc and executable examples. [LINT]
- **CODE-07 SHOULD** keep each file at or below 300 lines. [REVIEW]
- **CODE-08 MUST** use kebab-case filenames, PascalCase types, camelCase functions, UPPER_SNAKE_CASE constants, and English kebab-case figure names. [LINT]

### API — Public contracts

- **API-01 MUST** use identical props, types, and defaults in all wrappers, derived from `core` types. [CI]
- **API-02 MUST** look good without any props. [CI]
- **API-03 MUST** type figure names as a string literal union. [LINT]
- **API-04 MUST** give every error a `HATTAT_E###` code and explain what happened, why, and how to fix it. [CI]
- **API-05 MUST** reserve breaking changes for major releases, with a migration guide and a codemod where possible. [REVIEW]
- **API-06 SHOULD** prefer existing signal/theme mechanisms over new props. [REVIEW]

### VIS — Visual language

- **VIS-01 MUST** use isometric projection at ±30°. [CI]
- **VIS-02 MUST** express all dimensions as whole or half multiples of the `u` unit. [CI]
- **VIS-03 MUST** use the shared `--hattat-stroke`; figures must not choose their own stroke width. [CI]
- **VIS-04 MUST** use only four tones and at most one `accent` element per figure. [CI]
- **VIS-05 MUST** use fills only for hidden-line plates; no gradients or shadows. [CI]
- **VIS-06 MUST** stay centered, leave at least 8% padding on each edge, and never overflow in any pose. [CI]
- **VIS-07 SHOULD** use 60–600 segments. [CI]
- **VIS-08 MUST** be recognizable without a name at 240 px in a blind test. [REVIEW]
- **VIS-09 SHOULD** use the minimum detail needed for recognition; no logos, brands, or text. [REVIEW]

### MOT — Motion

- **MOT-01 MUST** have one primary interaction described in one sentence in `interaction`. [CI+REVIEW]
- **MOT-02 MUST** start responding within 100 ms. [CI]
- **MOT-03 MUST** use spring presets. [REVIEW]
- **MOT-04 MUST** settle and leave the loop within 1.5 s after input ends; only `autoplay` may loop indefinitely. [CI]
- **MOT-05 MUST** make intensity 0 calm and intensity 1 clear without becoming chaotic. [REVIEW]
- **MOT-06 MUST** make the resting pose meaningful on its own. [REVIEW]

### FIG — Figure acceptance

- **FIG-01 MUST** define each figure in one file using `defineFigure`. [CI]
- **FIG-02 MUST** supply complete metadata and at least three `intents`. [CI]
- **FIG-03 MUST** describe real user intentions in `intents`. [REVIEW]
- **FIG-04 MUST** include regression references for rest, full response, and reduced-motion poses. [CI]
- **FIG-05 MUST** pass all VIS, MOT, PERF, and A11Y rules. [CI+REVIEW]
- **FIG-06 MUST** avoid duplicate figures in the catalog. [REVIEW]

### PERF — Performance

- **PERF-01–05 MUST** meet all Section 9 budgets. [CI]
- **PERF-06 MUST** justify any change that worsens a budget by more than 5% with measurements in the PR. [CI+REVIEW]

### A11Y — Accessibility

- **A11Y-01 MUST** honor reduced motion. [CI]
- **A11Y-02 MUST** provide `role="img"` and an `aria-label`. [CI]
- **A11Y-03 MUST** support keyboard interaction. [CI]
- **A11Y-04 MUST** meet AA contrast. [CI]
- **A11Y-05 MUST** limit flashing to no more than three flashes per second. [CI]

### AGT — Agent surface

- **AGT-01 MUST** put skills in `skills/<name>/SKILL.md`, with only `name` and `description` in frontmatter and the directory name equal to `name`. [CI]
- **AGT-02 MUST** make descriptions include what the skill does, "Use when", and keywords. [CI+REVIEW]
- **AGT-03 MUST** keep `SKILL.md` at or below 200 lines. [CI]
- **AGT-04 MUST** end every skill step with a verifiable check, such as "`npx hattat check` is clean." [REVIEW]
- **AGT-05 MUST** generate the catalog, llms files, and skill references automatically. [CI]
- **AGT-06 MUST** provide CLI `--yes`, `--json`, and correct exit codes. [CI]
- **AGT-07 MUST** run every documentation example in CI; no `...` placeholders. [CI]
- **AGT-08 MUST** run the eval set on PRs affecting the agent surface and block merging if the success rate falls. [CI]
- **AGT-09 MUST** test skill triggering. [CI]

### TEST — Verification

- **TEST-01 MUST** reach at least 90% `core` coverage. [CI]
- **TEST-02 MUST** accompany bug fixes with a reproducing test. [REVIEW]
- **TEST-03 MUST** update regression references only for intentional visual changes, with before/after images. [REVIEW]
- **TEST-04 MUST** never merge flaky tests. [REVIEW]

### GIT — Collaboration and release

- **GIT-01 MUST** use Conventional Commits. [LINT]
- **GIT-02 MUST** keep each PR to one purpose; figure PRs must contain no unrelated changes. [REVIEW]
- **GIT-03 MUST** use a PR template covering purpose, rule IDs, test evidence, `look` images, and performance impact. [CI]
- **GIT-04 MUST** include a Changeset for every user-facing change. [CI]
- **GIT-05 MUST** use semver and publish to npm only from CI with provenance. [CI]
- **GIT-06 MUST** identify agent-authored PRs; direct pushes to `main` are forbidden. [CI]

### DEP — Dependencies and security

- **DEP-01 MUST** get approval and record a decision for new runtime dependencies; never add them to `core`. [REVIEW]
- **DEP-02 MUST** use only MIT, Apache-2.0, BSD, or ISC licenses. [CI]
- **DEP-03 MUST** make no runtime network requests and include no telemetry, `eval`, or `new Function`. [CI]
- **DEP-04 MUST** never insert raw user input into the DOM as HTML. [CI]

### DOC — Documentation

- **DOC-01 MUST** document each public feature in the same PR. [REVIEW]
- **DOC-02 SHOULD** write precise documentation with examples for agents first. [REVIEW]
- **DOC-03 MUST** put a one-sentence description, skill installation, npm installation, and a minimal example in the first screen of the README. [REVIEW]

### GOV — Governance

- **GOV-01 MUST** change rules only in a separate PR. [REVIEW]
- **GOV-02 MUST** stop when a rule conflicts with a task, report the rule ID, and suggest options rather than violating the rule. [REVIEW]
- **GOV-03 MUST** list exceptions in CI. [CI]
- **GOV-04 SHOULD** turn repeatedly missed `[REVIEW]` rules into `[CI]` checks. [REVIEW]

### Definition of done for every task

- [ ] All applicable `[CI]` and `[LINT]` checks are green.
- [ ] Relevant `[REVIEW]` rules are identified in the PR.
- [ ] Visual changes include `look` images in the PR.
- [ ] Budgets are met and changes are reported.
- [ ] Agent-surface changes pass the eval set.
- [ ] Documentation, Changesets, and `DECISIONS.md` are current where needed.


<!-- CODEGRAPH_START -->
## CodeGraph

This project has a CodeGraph MCP server (`codegraph_*` tools) configured. CodeGraph is a tree-sitter-parsed knowledge graph of every symbol, edge, and file. Reads are sub-millisecond and return structural information grep cannot.

### When to prefer codegraph over native search

Use codegraph for **structural** questions — what calls what, what would break, where is X defined, what is X's signature. Use native grep/read only for **literal text** queries (string contents, comments, log messages) or after you already have a specific file open.

| Question | Tool |
| --- | --- |
| "Where is X defined?" / "Find symbol named X" | `codegraph_search` |
| "What calls function Y?" | `codegraph_callers` |
| "What does Y call?" | `codegraph_callees` |
| "What would break if I changed Z?" | `codegraph_impact` |
| "Show me Y's signature / source / docstring" | `codegraph_node` |
| "Give me focused context for a task/area" | `codegraph_context` |
| "See several related symbols' source at once" | `codegraph_explore` |
| "What files exist under path/" | `codegraph_files` |
| "Is the index healthy?" | `codegraph_status` |

### Rules of thumb

- **Answer directly — don't delegate exploration.** For "how does X work" / architecture / trace questions, answer with 2-3 codegraph calls: `codegraph_context` first, then ONE `codegraph_explore` for the source of the symbols it surfaces. Codegraph IS the pre-built index, so spawning a separate file-reading sub-task/agent — or running a grep + read loop — repeats work codegraph already did and costs more for the same answer.
- **Trust codegraph results.** They come from a full AST parse. Do NOT re-verify them with grep — that's slower, less accurate, and wastes context.
- **Don't grep first** when looking up a symbol by name. `codegraph_search` is faster and returns kind + location + signature in one call.
- **Don't chain `codegraph_search` + `codegraph_node`** when you just want context — `codegraph_context` is one call.
- **Don't loop `codegraph_node` over many symbols** — one `codegraph_explore` call returns several symbols' source grouped in a single capped call, while each separate node/Read call re-reads the whole context and costs far more.
- **Index lag**: the file watcher debounces ~500ms behind writes; don't re-query immediately after editing a file in the same turn.

### If `.codegraph/` doesn't exist

The MCP server returns "not initialized." Ask the user: *"I notice this project doesn't have CodeGraph initialized. Want me to run `codegraph init -i` to build the index?"*
<!-- CODEGRAPH_END -->
