# Project review and recommended improvements

Reviewed October 8, 2026. These are recommendations and planned work; application code has not changed.

## Overall judgment

Convex is a reasonable choice if the goal is to learn its backend model and eventually manage site content. The current repository does not demonstrate a need for realtime subscriptions: it reads logo metadata and a signup flag, and its dashboard only renders the user's email. Changing providers alone will not make this small portfolio easier to maintain. The migration should deliver a simpler content/auth boundary and reproducible development workflow.

The first plan overcommitted to migrating every file into backend storage, duplicated providers across two root layouts, and described a repeatable importer before knowing the dataset size. The revised plan keeps the rollout checkpoints but makes those implementation choices proportional to the actual app.

## Highest-value changes

| Priority | Recommendation | Evidence and benefit | Timing |
| --- | --- | --- | --- |
| 1 | One shared root layout | `(main)` and `(admin)` duplicate HTML/body, fonts, global styles, and metadata. Put these in `src/app/layout.tsx`; keep public navbar/footer in `(main)/layout.tsx`. This gives auth one composition point. | Phase 3, isolated structural change |
| 1 | Choose auth by maintenance needs | The original plan picked Convex Auth because the tutorial did. Preserve email/password, then compare supported Next integration, recovery/verification, signup enforcement, and operational burden before choosing the implementation. | Checkpoint 1; prove it in phase 2 |
| 1 | Prefer static hosting for fixed media | There are already local logo assets. If the résumé/logos only change through deployments, use verified equivalents under `public/` and a stable `/docs/resume.pdf` URL. Backend storage is useful when authenticated uploads or changes without redeploying are actually needed. | Checkpoint 1 decision; phase 3 implementation |
| 1 | Separate unavailable data from empty data | `fetchBrandLogos()` logs errors and returns `[]`, so a backend outage silently removes the logo content. Add a section-level fallback/error state and bounded server request handling; keep the rest of the portfolio usable. | Phase 3 |
| 1 | Make setup predictable | Node has only a broad engine range; the app README is still the starter README. Add one supported Node major shared by local setup, CI, and Vercel; one documented bootstrap; checked env names; safe demo data. | Phase 1 |
| 2 | Provide one quality command and CI | Scripts cover typecheck/lint/build, but no checked-in tests or GitHub Actions workflow were found. Add `pnpm check` and Linux CI for meaningful tests and build verification with explicit codegen/env setup. | Phase 1 foundations; complete phase 3/4 |
| 2 | Reuse existing accessible UI | The logo popup manually creates a portal/backdrop without dialog focus/Escape behavior; the project selector uses clickable breadcrumb links for state changes. Use the existing Dialog and semantic buttons/tabs. | Phase 3 for touched logo UI; project selector follow-up |
| 2 | Finish the auth interaction | Login lacks pending state and user-visible caught errors. Logout has an action but no caller was found. Add inline field/general errors, disabled pending submit, recovery, and a reachable signout control. | Phase 3 |
| 3 | Improve portfolio polish | Add a direct résumé open/download fallback for mobile PDF viewers, mobile menu close-on-selection, reduced-motion treatment, and appropriate social metadata. | Separate follow-up after migration |

Navigation between separate root layouts triggers a full page load; a shared root is preferable here unless isolation is deliberate. See [Next.js layout behavior](https://nextjs.org/docs/app/api-reference/file-conventions/layout). Fixed files can be served directly from `public/`; this requires redeployment to publish changes, which is the tradeoff. See [Next.js public assets](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder).

## Auth deserves a deliberate decision

Convex's main auth documentation describes its Auth library's Next.js support as experimental. That is a stronger qualification than the first plan's generic beta warning. A successful happy-path login is insufficient to establish a low-maintenance choice. Compare Convex Auth with a managed integration such as Clerk using the existing email/password requirement, Next 16 support, recovery, verification, backend authorization, cost, and who owns operational fixes. See [Convex authentication guidance](https://docs.convex.dev/auth/overview).

My recommendation: treat Convex Auth as a learning-oriented candidate, and prefer a supported managed integration if minimizing auth maintenance matters more. Do not install a second auth provider or switch the chosen implementation without Chris's checkpoint decision. GitHub login remains optional and must not replace the requested password flow.

Likewise, decide what an account enables. There is currently no content editor or user-facing product behind login. Keep migration scope limited to existing functionality, with server-controlled owner access if selected. A future editor for logos/projects would provide an actual reason for private mutations and dynamic file storage; it should be a separate feature.

## Developer quality of life worth adding

1. **`pnpm run doctor`:** check Node/pnpm availability, required environment variable names, and generated API presence. Print missing names and corrective commands, never secret values. Keep it read-only; do not provision services implicitly.
2. **`pnpm dev`:** start both watchers with named output and coordinated shutdown. Preserve `dev:web` for UI work and `dev:backend` for backend troubleshooting.
3. **`pnpm seed:dev`:** create a small deterministic set of public demo content. Make it repeatable and explicitly development-only; keep auth accounts and production exports out of fixtures. Document whether the seed command mutates cloud development data.
4. **`pnpm check`:** deterministic typecheck, lint, and focused tests. Document code generation separately when a fresh checkout needs it; do not let a routine check silently deploy backend changes.
5. **Formatting:** one formatter configuration and `format:check` for new/touched code, expanding coverage gradually. Add an editor configuration for indentation/newlines. Avoid a repository-wide formatting diff mixed with backend changes. [Prettier setup](https://prettier.io/docs/install) documents formatting/check commands.
6. **Linux CI:** frozen-lockfile install, generated-type setup, checks, and a build using an isolated backend or documented fixtures. Keep production keys out of ordinary pull-request checks; untrusted forks must not require privileged deploy secrets.

Do not add a monorepo orchestrator, an ORM, a generic repository abstraction, React Hook Form, or a second query cache simply because the tutorial uses additional tooling. This app has one application package and small forms. A few package scripts and clear backend functions are enough.

Use Convex validators at database/function boundaries and browser-safe shared Zod schemas for forms/import rules. Start with native validators plus explicit Zod parsing; adopt `convex-helpers` wrappers only where they materially reduce duplicated business validation. This avoids introducing a helper dependency before we know the validation requirements.

## Concrete UI/code issues to address separately

- `MarqueeIcons.tsx`: replace the custom popup with the existing Dialog, including a title, labeled close control, focus return, and Escape handling. Store the selected ID if subscribing to changing logo data, so an open popup doesn't keep an obsolete copied record. [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) provides those interaction primitives.
- `Navbar.tsx`: its mobile Sheet lacks a title; add an accessible title. Section links should work from `/login` as links to `/#section`, close the mobile sheet after selection, and account for the fixed header.
- `Projects.tsx`: selection changes content rather than navigating a breadcrumb trail. Use keyboard-operable buttons or tabs with an explicit selected state.
- `BrandButton.tsx`: the declared `href` prop is ignored and a button is nested inside a link. Make it a single styled link that honors `href`.
- `PdfDialogButton.tsx` and `AboutMeJumbotron.tsx`: provide a named résumé trigger and a direct open/download link alongside the iframe. The existing trigger has an icon without text children.
- `globals.css`: the universal selector applies `transition-all` to every element. Scope transitions to actual interactive properties and honor reduced motion. Check the font variable application and raw HSL token usage before changing appearance.
- `src/actions/`: the data-reading modules are not Next Server Actions. Put server reads in a clearly named data module with a server-only boundary instead of spreading provider-specific imports through UI components. This is a small naming/boundary improvement, not a generic abstraction layer.

These observations come from source inspection. They do not claim measured accessibility scores, performance results, or browser reproduction. UI follow-ups should be verified in a browser and kept in separate commits from provider replacement.

## Make the migration smaller

Measure row/file/account counts first. For a few dozen metadata rows and fixed public assets, use a validated export transform and one repeatable, explicitly targeted import command. Preserve source IDs for reconciliation. Build chunking/resume machinery only if actual size or retry behavior warrants it. Keep the final backup and rollback plan regardless of size.

Use database indexes for real lookups (`featureFlags.name`, source IDs during import); do not implement generic flag administration. Use server rendering for public metadata. Choose realtime only for a feature with a clear freshness need; `preloadQuery` opts its server component out of static rendering under the documented no-store policy. See [Convex server rendering](https://docs.convex.dev/client/nextjs/app-router/server-rendering).

Retain one explicit environment matrix and the six handoffs, but ask Chris only for cloud login, credentials, product decisions, acceptance, and service retirement. Codex should handle validation, transformations, code fixes, and reconciliation before the relevant review gate.

## Verification performed during this review

- Installed TypeScript check (`node_modules/.bin/tsc.cmd --noEmit`): passed.
- Installed Oxlint (`node_modules/.bin/oxlint.cmd`): passed.
- Standard `pnpm typecheck` / `pnpm lint`: could not start because Corepack attempted to download the pinned pnpm package and registry DNS resolution failed in this environment. This is an environment/setup finding, not a compiler failure.
- No production build or browser session was run. Live Supabase/Vercel data, user counts, provider limits, and deployment settings remain unverified.
- A filesystem display initially suggested a CSS filename casing issue. Git tracks `hero.module.css`, matching the imports, so this review does not identify it as a confirmed defect. Linux CI remains useful for detecting real portability issues.

## Recommended order

First agree on media hosting and auth maintenance preferences at checkpoint 1. Then implement tooling/preflight, prove auth compatibility, consolidate the root layout, migrate the two reads and media, and finish error/auth interactions. Add CI and verify the real preview. Follow with the small UI/accessibility fixes. Build a content editor or add realtime behavior only when a concrete feature is requested.
