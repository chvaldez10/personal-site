# Christian Valdez's personal site

Next.js 16, React 19, TypeScript 7, Tailwind 4, Convex, and Convex Auth. Cloudflare Images hosts logos. The development migration is in place; publishing remains a separate checkpoint.

## Setup

Use Node 24 and the pnpm version in package.json. On Windows or macOS, open Warp or your usual terminal in the app folder:

```sh
cd chvaldez10
corepack enable
pnpm install --frozen-lockfile
```

Skip cd if already in the app folder. Copy .env.example to .env.local using your editor; keep an existing .env.local. Convex setup fills in CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL.

```sh
pnpm run doctor
pnpm dev
```

Open http://localhost:3000. One runner starts Next and the Convex development watcher. dev:web and dev:backend also work separately. Starting the backend watcher updates the selected cloud development deployment; routine checks do not.

Cloudflare's API token and auth secrets belong in the Convex deployment settings. Never put them in NEXT_PUBLIC_ variables.

For owner account setup, follow [the short Convex guide](docs/convex-migration/README.md).

## Commands

| Command          | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| pnpm run doctor  | Check versions and configuration without displaying secrets |
| pnpm dev         | Start Next and Convex development together                  |
| pnpm dev:web     | Start Next only                                             |
| pnpm dev:backend | Start the Convex development watcher only                   |
| pnpm check       | Typecheck, lint, formatting, and unit/backend tests         |
| pnpm format      | Format the maintained files in .format-files.json           |
| pnpm test        | Run Node validation tests and Convex backend tests          |
| pnpm build       | Build using the selected environment                        |
| pnpm test:e2e    | Build real pages against a test-only local backend          |

Before the first browser test:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

Browser tests start a temporary HTTP backend stub and exercise the real pages, including login errors and private-route protection. Fixtures are used only by tests; the app always uses its configured Convex deployment. CI never deploys. After browser tests, run pnpm build before pnpm start so the build uses your real Convex URL. Live owner login, signout, and direct Cloudflare upload still need acceptance with your privately chosen password.

## Media

The dashboard uploads images directly to Cloudflare using a short-lived upload URL issued after owner authorization. The API token stays on the backend. Convex confirms the upload before saving the logo record.

Résumé links use /api/resume, which serves the PDF from Convex and falls back to /docs/resume.pdf if it is unavailable. Keep public/docs/resume.pdf current. Logo failures show an icon while keeping their text and details usable.

Supabase data, hosted source files, and old integration files are preserved during review. The active development app uses Convex.

See the [reusable migration guide](docs/convex-migration/README.md).
