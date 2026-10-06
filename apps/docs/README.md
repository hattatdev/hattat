# Gallery and playground

Live preview: https://hattatdev.github.io/hattat/

A static gallery built from the existing public vanilla API. Explore twelve figures, search by
name or intent, filter categories, and use the playground to change figure, intensity,
autoplay, and the Paper/Ink/Blueprint color palettes. Palettes use the existing theme object;
these are gallery presets, not new library theme names. Reduced motion remains automatic.
The copyable example follows the current selection, including palette and intensity.
The npm package is not published; the site labels examples as an API preview.
The collection covers eight categories, with larger single-column previews on phones.
See [collection review](../../docs/collection-review.md) for the additions and screenshots.

## Local preview and checks

Run `pnpm build` then `pnpm preview:docs` from the repository root. Open
http://127.0.0.1:4173/hattat/. Run `pnpm test:docs` to check built assets, search/filtering,
figure changes, controls, copy feedback, example execution, reduced motion, and layout at
320, 390, 768, and 1440 px. Screenshots are saved under `artifacts/gallery`.

## Hosting

The Pages workflow builds `apps/docs/dist/site` and publishes it after main changes.
Deploy only the site folder; workspace source/declarations are outside the uploaded artifact.
Assets use relative URLs and there are no client routes, remote fonts, analytics, or runtime
fetches. The same folder works under `/hattat/`, a custom domain root, or another static host.
For a future custom domain, verify ownership, configure DNS and the Pages custom-domain
setting, and enable HTTPS. The API package does not need to change.

Generated llms files, a public CLI, framework wrappers, and the full catalog remain separate
future work. This owner-requested public demo does not claim those phases are complete.
