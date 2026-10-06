# HATTAT — Project Document for Agents

This document is the project's single source of truth. Do not write code before reading it.

Translation provenance: complete English translation of the owner's `hattat_master_spec.md`, supplied on 2026-10-06. Organization placeholders are resolved to `hattatdev`. Section 12 is also reproduced in `AGENTS.md`. The examples below preserve the source's proposed API; they are not an implementation or a release announcement.

## 0. Your task

You are the senior graphics/frontend engineer autonomously building **Hattat**. Hattat is an **MIT-licensed, completely free** open-source library of thin-line isometric figures added to web pages and responding to the pointer and other inputs. Its primary user is **a human's AI agent**, rather than the human directly.

Name: Hattat is a master of the line in the art of calligraphy. npm: `hattat` (the unscoped name appears available; if unavailable, use `@hattatdev/hattat`). GitHub: `hattatdev/hattat`.

**Your first tasks, in order:**

1. Translate Section 12 (rules) into English and put it in the root `AGENTS.md`. `CLAUDE.md` must say only "Read and follow AGENTS.md". Preserve this entire document as `docs/SPEC.md`.
2. Set up the monorepo skeleton (Section 3).
3. Write a short Phase 1 technical design document (`docs/design/phase-1.md`) and **wait for my approval**.

**Working mode:**

- Build your own feedback loop: after every change, run tests, budget measurements, and visual verification with `look`. Do not say "it should work"; prove it.
- Stop and ask only at phase boundaries, for hard-to-reverse decisions (public API names, licensing), or for two equally good visual alternatives (with screenshots).
- For everything else, choose a reasonable default, record the date, decision, and a one-line rationale in `DECISIONS.md`, and continue.
- All code, comments, commits, documentation, and skill text in the repository must be **English**.
- **Originality:** similar projects exist (for example, `hairline`). Copy none of their code, figure designs, figure names, API naming, or text.

## 1. North star

> Any developer's agent should be able to add a working, accessible, performant figure that fits the project's framework and theme in under two minutes, without human intervention, from a single sentence such as "add an interactive security-themed figure to the hero". If the catalog has no suitable figure, the agent should be able to design a new one and verify it visually.

| Criterion | Target |
| --- | --- |
| Agent task success on the eval set | ≥ 90%, on the first attempt |
| Zero configuration | Correct installation in React, Next.js, Vue, Svelte, Astro, and plain HTML without asking questions |
| Appropriate figure selection by intent | ≥ 85% appropriate, judged by humans |
| Figures produced with `hattat-create` | ≥ 80% pass validation within the first two attempts |
| Performance budgets | Always green in CI |

## 2. Scope

**Included:** isometric line figures; SVG + Canvas2D; pointer, scroll, drag, keyboard, touch, and tilt inputs; Vanilla, React, Vue, Svelte, Web Component; skills, CLI, catalog, llms.txt, shadcn registry; theming, a11y, SSR; eval set.

**Excluded from v1.0:** WebGL/true 3D, native mobile, Angular, paid plans/hosted service, telemetry (forbidden).

## 3. Architecture

pnpm workspaces + Turborepo. Dependencies flow downward only; `core` has zero runtime dependencies.

```text
packages/
  core/      # projection, scene model, renderers, loop, signals, physics
  figures/   # one file per figure, separate tree-shakable entries
  react/ vue/ svelte/ element/   # thin wrappers + <hattat-figure>
  cli/       # npx hattat
skills/      # hattat-use, hattat-create, hattat-theme, hattat-contribute
evals/       # agent evaluation set
apps/docs/   # gallery, playground, llms.txt, registry
AGENTS.md  CLAUDE.md  DECISIONS.md  CONTRIBUTING.md  CODE_OF_CONDUCT.md
```

## 4. Core engine

**Frame flow:** input → normalized signal (0–1) → spring physics → the figure's `build` function produces 3D lines grouped by tone → projection → the renderer draws each tone in a single call → when springs settle and there is no input, the figure leaves the loop.

- **Projection:** isometric, ±30°: `xs = (x − y)·cos30°`, `ys = (x + y)·sin30° − z`. Dimetric/slight perspective is allowed per figure with a rationale.
- **Hidden lines:** plane-based painter's algorithm; first fill plates in the background color, then lines. Sort depth only when topology changes.
- **Renderers:** SVG by default for ≤ 400 segments; one `<path>` per tone, `vector-effect: non-scaling-stroke`, update only `d` per frame. Canvas2D above 400 segments; support `devicePixelRatio` and one `stroke` per tone. `auto` selects; the user may override.
- **Loop:** all figures share one `requestAnimationFrame`; stop the loop when no figure is active. `IntersectionObserver` sleeps offscreen figures; `ResizeObserver` tracks size. Physics is delta-time based.
- **Physics:** critically damped springs, inertia, easing. Spring presets: `snappy`, `default`, `gentle`, `heavy`.
- **Signals:** `pointer.{x,y,inside,pressed}`, `scroll.progress`, `drag.{dx,dy,velocity}`, `tilt.{x,y}` (permission-gated, optional), `focus`, `key` (arrow keys), `time` (only with `autoplay`). Users/agents can change mappings. `autoplay` runs a slow demo without input and yields when real input arrives.
- **SSR:** render a static SVG resting pose on the server; the client takes over the same DOM, with CLS = 0.

## 5. Public API

All entry points accept the same options, names, and defaults. The single source of truth is `core` types.

```js
import { mount } from "hattat";
import { gearTrain } from "hattat/figures/gear-train";
const handle = mount(document.querySelector("#hero"), gearTrain, { intensity: 0.6 });
// handle.update({...}); handle.destroy();
```

```jsx
import { GearTrain } from "hattat/react";
<GearTrain intensity={0.6} input="scroll" />
```

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/hattat/element"></script>
<hattat-figure name="gear-train" intensity="0.6"></hattat-figure>
```

| Option | Type | Default |
| --- | --- | --- |
| `intensity` | 0–1 | 0.5 |
| `input` | Signal name or mapping | Figure's default |
| `renderer` | `svg` / `canvas` / `auto` | `auto` |
| `theme` | Theme name or object | Automatic light/dark |
| `autoplay` | boolean | false |
| `motion` | `auto` / `reduce` / `full` | `auto` |
| `label` | string | Figure's a11y label |
| `interactive` | boolean | true |

**Theme variables:** `--hattat-plate` (must match the background), `--hattat-hi`, `--hattat-edge`, `--hattat-mid`, `--hattat-lo`, `--hattat-accent` (at most one element per figure), `--hattat-stroke` (CSS pixels). Preset themes: `mono`, `blueprint`, `terminal`, `paper`, `neon`, `contrast`.

**Error codes:** `HATTAT_E###`; every message explains what happened, why, and how to fix it. Example: `HATTAT_E001`, unknown figure: "'lok' does not exist. Did you mean 'lock'? List figures: npx hattat search". The full list belongs in `docs/errors.md`.

## 6. Figure definition API

New figure = one file using `defineFigure`, without touching the core.

```ts
import { defineFigure } from "hattat/core";

export default defineFigure({
  name: "drawer-stack",
  category: "objects",
  intents: ["storage", "archive", "files", "organize"],
  mood: ["calm", "orderly"],
  interaction: "The pointer's height opens the nearest drawer, its neighbours less.",
  aspect: "1:1",
  a11y: { label: "A cabinet of drawers that open toward the pointer" },
  params: { open: { input: "pointer.y", spring: "default" } },
  build(ctx, p) {
    const u = ctx.unit;
    ctx.box([0, 0, 0], [4 * u, 3 * u, 6 * u], { tone: "edge" });
    for (let i = 0; i < 4; i++) {
      const pull = ctx.falloff(p.open, i / 3) * p.intensity * 2 * u;
      ctx.box([0, -pull, i * 1.5 * u], [4 * u, 3 * u, 1.5 * u],
        { tone: i === ctx.nearest(p.open, 4) ? "hi" : "mid" });
    }
  },
});
```

**Required metadata:** `name` (kebab-case), `category`, `intents` (≥ 3 real user intentions, rather than visual descriptions), `mood` (1–3), `interaction` (one sentence), `aspect` (`1:1`, `4:3`, `16:9`, `3:4`), `a11y.label`.

**`ctx` helpers:** `box`, `cylinder`, `prism`, `grid`, `arc`, `curve`, `polyline`, `line`, `repeat` (array/radial), `unit`, `falloff`, `nearest`, `lerp`, seeded `random`.

**Figure authoring steps:** `npx hattat new <name>` → write the `interaction` sentence first → build the resting pose and inspect it with `look` → add interaction and inspect the full-response pose → compare intensity 0 / 0.5 / 1 → `npx hattat check` → create visual regression references → PR.

## 7. Initial release catalog (32 figures, 8 categories)

This is the initial list. Names and interactions may change during design, but no figure enters the catalog before passing the FIG rules.

- **Technology:** `server-rack` (pointer height pulls out a card), `circuit-board` (traces beneath the pointer light up), `antenna` (proximity enlarges signal rings), `db-stack` (the pointer separates a layer).
- **Data:** `bar-city` (the column beneath the pointer rises), `pie-layers` (a slice lifts), `heat-grid` (the area near the pointer heats up), `node-graph` (a node and its neighbors are highlighted).
- **Security:** `padlock` (the shackle opens on approach), `vault-door` (pointer angle rotates the wheel), `shield-layers` (layers separate), `key-ring` (keys swing toward the pointer).
- **Objects:** `drawer-stack`, `desk-lamp` (the head turns toward the pointer), `bookshelf` (a book moves forward), `coffee-cup` (pointer speed increases steam).
- **Architecture:** `city-block` (scroll raises buildings), `bridge` (the span completes), `tower-crane` (the arm rotates), `stairs` (steps highlight in sequence).
- **Mechanics:** `gear-train` (gears drive each other), `pendulum` (dragging gives it a push), `balance-scale` (a pan descends), `piston-row` (pistons follow a wave).
- **Nature/abstract:** `wave-field` (a wave spreads), `crystal` (rotates), `branching-tree` (scroll grows branches), `wind-turbine` (pointer speed turns blades).
- **UI concepts:** `loader-ring` (the ring fills), `envelope` (the flap opens), `empty-box` (lids open slightly), `magnifier-grid` (the lens moves and magnifies).

Balance rule: each category has ≥ 4 figures; scroll and drag are each the primary interaction for ≥ 3 figures; keyboard is an alternative input for every figure.

## 8. Agent layer

**Skills:** `skills/<name>/SKILL.md`; frontmatter contains only `name` + `description`; ≤ 200 lines; heavy content belongs under `references/`; never hand-edit generated references. Installation: `npx skills add hattatdev/hattat`.

| Skill | Trigger | Action | Success check |
| --- | --- | --- | --- |
| `hattat-use` | Requests for isometric/animated/interactive illustrations, hero art, or empty-state graphics on a page | Detect framework, install, select by intent, theme, integrate | Clean `check`, `look` image captured |
| `hattat-create` | No suitable catalog figure, or a custom figure requested | Author with `defineFigure`, render, inspect, refine | VIS/MOT and blind test pass |
| `hattat-theme` | Match brand colors | Read CSS variables / Tailwind and produce a theme | A11Y-04 contrast passes |
| `hattat-contribute` | Submit a figure to the main repository | Run checks and fill the PR template | All FIG rules pass |

`description` format: what it does + "Use when ..." + keywords. Example:

```markdown
---
name: hattat-use
description: Adds interactive isometric line illustrations that react to the pointer, scroll or keyboard to web pages. Use when the user wants a hero illustration, empty-state graphic, animated or interactive figure, or line art for a landing page or dashboard. Keywords: isometric, illustration, hero, empty state, animation, interactive, line art, React, Vue, Svelte.
---
```

**CLI:** `npx hattat`; every command supports noninteractive `--yes`, machine-readable `--json`, exit code 0 on success, and nonzero on failure.

| Command | Purpose |
| --- | --- |
| `init` | Detect framework, install, set theme variables |
| `search "<intent>"` | Rank suggestions by intent (`{query, results:[{name, score, matched}]}`) |
| `add <figure> [--to <file>]` | Add correct imports and usage |
| `check` | Validate usage: props, theme, SSR |
| `look <figure\|file>` | Headless rendering: `-rest.png`, `-full.png`, `-motion.png` (frame sequence), `-blind.png` (unnamed), `-report.json` (segments, frame time, contrast, overflow) |
| `new <name>` | Figure template |

**Generated files:** CI fails if they are out of sync with their sources: `catalog.json`, `previews/*.png`, `llms.txt`, `llms-full.txt`, Markdown versions of docs pages, and skill `references/`.

A `catalog.json` entry:

```json
{
  "name": "padlock",
  "category": "security",
  "intents": ["login", "authentication", "privacy", "encryption"],
  "mood": ["calm", "technical"],
  "interaction": "The shackle lifts open as the pointer comes close.",
  "inputs": ["pointer.inside", "pointer.x"],
  "aspect": "1:1",
  "lineCount": 140,
  "renderer": "svg",
  "a11yLabel": "A padlock that opens as the pointer approaches",
  "imports": {
    "vanilla": "hattat/figures/padlock",
    "react": "hattat/react#Padlock",
    "vue": "hattat/vue#Padlock",
    "svelte": "hattat/svelte#Padlock",
    "element": "<hattat-figure name='padlock'>"
  },
  "preview": "previews/padlock.png"
}
```

**Distribution:** npm (Phase 1), skills.sh + CDN (Phase 2), shadcn registry + docs site (Phase 3), optional MCP server with `search_figures`, `get_figure_code`, `render_preview`, `validate_figure` (Phase 4, only if it provides something skills + CLI cannot). Consult current official documentation at publication time to complete the skills.sh listing process.

## 9. Performance and accessibility budgets (measured in CI)

| Metric | Budget |
| --- | --- |
| `core` size | ≤ 6 KB gzip |
| One figure, excluding core | ≤ 2 KB gzip |
| 20 figures, CPU throttled 4×, script time per frame | ≤ 4 ms |
| Idle rAF | Stopped |
| Offscreen drawing | 0 |
| First draw after mount | ≤ 16 ms |
| Hydration CLS | 0 |
| Memory allocation per frame | ~0 |

A11y: no motion under `prefers-reduced-motion` (resting pose); `role="img"` + meaningful `aria-label`; keyboard focus and arrow-key primary interaction; `hi`/`edge` meet WCAG AA in the high-contrast theme; ≤ 3 flashes per second.

## 10. Tests and agent eval set

| Layer | Tool | Threshold |
| --- | --- | --- |
| Unit | Vitest | `core` line coverage ≥ 90%; determinism test for every figure |
| Visual regression | Playwright | Rest, full-response, reduced-motion poses |
| Rule checks | `check` + scripts | Zero violations |
| Performance | Playwright + tracing, size-limit | Section 9 |
| Documentation examples | CI compilation | All work |
| Skill triggering | Prompt lists | 100% |
| Agent eval set | `evals/` | ≥ 90% |

**Eval set:** empty starter projects for Next.js, Vite+React, Vue, SvelteKit, Astro, and plain HTML, with and without Tailwind. Phase 2 has 10 tasks; Phase 3 has ≥ 30. Task types: integration, intent selection, theme, input mapping, new figure, contribution PR. Automated checks: build, `look` rendering, zero console errors, a11y, budgets. Run on every PR touching skills / CLI / catalog schema / public API; do not merge if the success rate falls.

```yaml
id: hero-security-nextjs
starter: nextjs-tailwind
prompt: "Add an interactive security-themed illustration to the hero section."
expect: { build: pass, figure_category: security, look: renders, console_errors: 0, a11y: pass, max_duration_s: 120 }
```

## 11. Phases

| Phase | Contents | Gate: do not proceed until passed |
| --- | --- | --- |
| 1. Core | Design document, CI rule scripts, projection, SVG renderer, springs, shared loop, pointer, `look`, budget measurement, 5 figures, vanilla API | Five figures render with `look`; budgets measured in CI |
| 2. Agent layer | `catalog.json`, CLI, `hattat-use` + `hattat-create`, `llms.txt`, 10 eval tasks | A clean agent solves ≥ 80% of the first 10 tasks |
| 3. Expansion | Canvas, all signals, themes + `hattat-theme`, a11y, all wrappers, 32 figures, 30 evals | Section 1 criteria met; v0.1 on npm and skills.sh |
| 4. Community | `hattat-contribute`, gallery + playground, optional MCP, OffscreenCanvas | — |

Report at each phase boundary: completed work, budget results, eval results, known issues.

## 12. Rules

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

## 13. Open questions (use defaults until decided)

- npm: can the unscoped `hattat` name be registered? If not, use `@hattatdev/hattat`.
- Domain: `hattat.com` and probably `hattat.dev` are taken; use GitHub Pages temporarily for docs.
- Community figures in the main package or a separate package? Default: the main package, after passing FIG rules.
