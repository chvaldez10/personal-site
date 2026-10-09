# Christian Valdez's personal site

Next.js 16 App Router, React 19, TypeScript 7, Tailwind 4, and Supabase. Convex dependencies and development tooling are prepared; cloud setup and data/auth migration have not started.

## Setup

Use Node 24 (see .node-version) and the exact pnpm version declared in package.json.

From this directory:

```sh
corepack enable
pnpm install --frozen-lockfile
```

Copy .env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for the existing app. Do not overwrite an existing .env.local or commit its values.

```sh
pnpm run doctor
pnpm dev
```

pnpm 11 also has a built-in doctor command; use pnpm run doctor to run this project's read-only preflight.

Open http://localhost:3000. The runner starts Next now and adds the Convex watcher when convex/schema.ts and its development environment are configured. dev:web and dev:backend remain available separately. Starting the backend CLI can initialize/update a cloud development deployment; routine checks do not run it.

## Local demo without cloud credentials

Demo seeding only writes .demo/brand-logos.json on this computer. It never writes to Supabase or Convex and does not create accounts.

```sh
pnpm seed:dev
```

Set SITE_DEMO_MODE=true in .env.local, or set it temporarily for the current shell:

```powershell
$env:SITE_DEMO_MODE = 'true'
pnpm run doctor
pnpm dev
```

The demo uses local logo fixtures, disables signup/login, and redirects protected pages to /login. Leave SITE_DEMO_MODE unset or false for the real site. Set the same value before a build and while running that build; public demo content can be generated at build time.

## Commands

| Command         | Purpose                                                                        |
| --------------- | ------------------------------------------------------------------------------ |
| pnpm run doctor | Read-only version/configuration/fixture checks; prints names, not secrets      |
| pnpm dev        | Named development processes with coordinated shutdown                          |
| pnpm dev:web    | Next development server only                                                   |
| pnpm seed:dev   | Validate and write deterministic local demo data                               |
| pnpm check      | Typecheck, Oxlint, maintained formatting baseline, and unit tests              |
| pnpm format     | Format files listed in .format-files.json                                      |
| pnpm test       | Node's built-in tests for validation, redirect destinations, and media mapping |
| pnpm build      | Production build using the selected environment                                |
| pnpm test:e2e   | Seed demo data, build, and run browser smoke tests on port 3100                |

Before the first browser run, install Chromium:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

test:e2e builds in demo mode. After it finishes, rebuild with normal environment settings before using pnpm start for the real site.

GitHub Actions runs checks and browser tests on Linux with demo data and no production credentials. It does not deploy. Live email delivery, existing-account login, and authenticated signout still need acceptance against the configured Supabase project.

Formatting uses an explicit maintained baseline to keep legacy formatting changes out of this work. Add newly maintained files to .format-files.json. Generated output, dependencies, private exports, and credentials are excluded by keeping them outside that baseline.

## Media

The résumé is served from /docs/resume.pdf. Verified existing logo objects are mapped to /logos/... while their metadata still comes from Supabase. Unknown/external image URLs are preserved rather than silently replaced.

To update a fixed asset, replace its file under public/ and redeploy. New logo filenames also need a mapping in src/lib/media.ts when replacing old hosted object URLs. The original Supabase objects remain available.

## Authentication and migration

The login form uses validated Server Actions and displays field/general errors and pending states. Signup respects the database flag at the app action boundary; direct Supabase signup must also be governed by the provider's configuration. The dashboard keeps its existing authenticated-user policy and now exposes signout.

See [migration plan](docs/convex-migration/README.md), [checkpoints](docs/convex-migration/CHECKPOINTS.md), [auth comparison](docs/convex-migration/AUTH-DECISION.md), and [preparation status](docs/convex-migration/PREPARATION.md).
