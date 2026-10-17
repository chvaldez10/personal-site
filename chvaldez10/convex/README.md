# Convex backend

This site uses one populated Convex deployment for local development, Vercel previews, and the hosted frontend. A frontend preview uses the existing database; it does not need a backend migration. Run Convex commands from `chvaldez10/`. Do not seed or reset the shared data for routine checks.

## Data and access

| Table | Purpose | Access |
| --- | --- | --- |
| Convex Auth tables | Password login and owner session | Convex Auth; account setup is limited to `OWNER_EMAIL` and the one-time `OWNER_SETUP_KEY` |
| `brandLogos` | Tech Finds content and Cloudflare image references | Public list; owner-only admin list and status mutation |
| `pendingImages` | Owner-bound direct-upload tickets and completion IDs | Internal functions only |
| `tutoringInquiries` | Public form submissions and owner-managed status | Public submit; owner-only list, status update, and delete |
| `siteAssets` | Named files in Convex storage, currently the résumé PDF | Public résumé URL query; internal release upload/import |
| `featureFlags` | Legacy imported flags | The public signup query currently returns `false` without reading this table |

The schema and indexes are in `schema.ts`. Auth configuration is in `auth.ts` and `auth.config.ts`. `permissions.ts` resolves the signed-in Convex Auth user and checks its email against `OWNER_EMAIL`; owner access is checked again inside protected backend functions. The dashboard layout also redirects nonowners to login, but that route check is not the data authorization boundary.

## Request paths

- **Tech Finds:** The home page reads active logos through `brandLogos.list` and `src/lib/data/brandLogos.ts`. The dashboard uses `brandLogos.listForAdmin` to see all logos. Both return at most 200 logos ordered by `sortOrder`.
- **Logo upload:** `images.requestUpload` checks owner access and requests a short-lived Cloudflare direct-upload URL. The browser sends the file directly to Cloudflare. `images.completeUpload` rechecks owner access, validates the details and completed image, then calls the internal `imageRecords.complete` mutation. That mutation creates the logo and records its ID in `pendingImages` in one transaction, making completion retries safe. An hourly job deletes expired upload tickets in batches of 200. Cloudflare credentials stay in Convex environment settings.
- **Tutoring:** `tutoringInquiries.submit` validates and stores public inquiries; a filled honeypot field is ignored. Submissions are limited to three per email per day and 60 globally per hour using the Convex rate limiter component. The owner list uses the `by_status` index and returns the newest 100 per status. Owner mutations update status or delete an inquiry.
- **Résumé:** `siteAssets.resume` returns a Convex storage URL only for a PDF. Next's `/api/resume` route fetches it and falls back to `public/docs/resume.pdf` if unavailable.
- **Signup switch:** `featureFlags.signupEnabled` always returns `false`; public registration remains closed. Owner account setup is controlled in `auth.ts` and `admin.ts`.

`http.ts` registers Convex Auth routes. `migrations.ts` and the migration functions in `images.ts` are internal release tools, not browser APIs. See [the migration guide](../docs/convex-migration/README.md) for setup and preview commands.

## Configuration

The local Convex CLI uses `CONVEX_DEPLOYMENT`; the frontend uses `NEXT_PUBLIC_CONVEX_URL` from `.env.local`. Set `OWNER_EMAIL`, optional `OWNER_SETUP_KEY`, and the `CLOUDFLARE_*` variables declared in `convex.config.ts` on the configured Convex deployment. Keep auth and Cloudflare secrets out of client variables.
