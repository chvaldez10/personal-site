# Convex backend

This site uses one populated Convex deployment for local development, Vercel previews, and the hosted frontend. A frontend preview uses the existing database; it does not need a backend migration. Run Convex commands from `chvaldez10/`. Do not seed or reset the shared data for routine checks.

## Data and access

| Table                        | Purpose                                                 | Access                                                                                        |
| ---------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Convex Auth tables           | Password login and owner session                        | Convex Auth; account setup is limited to `OWNER_EMAIL` and the one-time `OWNER_SETUP_KEY`     |
| `brandLogos`                 | Tech Finds content and Cloudflare image references      | Public list; owner-only admin list and status mutation                                        |
| `projectSection`, `projects` | Home page Projects copy and cards                       | Public read; owner-only import, edit, order, and delete                                       |
| `pendingImages`              | Owner-bound direct-upload tickets and completion IDs    | Internal functions only                                                                       |
| `tutoringInquiries`          | Public form submissions and owner-managed status        | Public submit; owner-only list, status update, and delete                                     |
| `shadowboxingWorkouts`       | Named practice plans                                    | Owner-only paginated summaries, detail read, save, and delete; records are scoped by owner ID |
| `siteAssets`                 | Named files in Convex storage, currently the résumé PDF | Public résumé URL query; internal release upload/import                                       |
| `featureFlags`               | Legacy imported flags                                   | The public signup query currently returns `false` without reading this table                  |

The schema and indexes are in `schema.ts`. Auth configuration is in `auth.ts` and `auth.config.ts`. `permissions.ts` resolves the signed-in Convex Auth user and checks its email against `OWNER_EMAIL`; owner access is checked again inside protected backend functions. The dashboard layout also redirects nonowners to login, but that route check is not the data authorization boundary.

## Request paths

- **Tech Finds:** The home page reads up to 200 visible logos through `brandLogos.list` and `src/lib/data/brandLogos.ts`. `by_active_and_sortOrder` selects visible entries, including legacy null values, before applying the display limit. The dashboard uses `brandLogos.pageForAdmin`, loading 20 records at a time across all logos.
- **Logo upload:** `images.requestUpload` checks owner access and requests a short-lived Cloudflare direct-upload URL. The browser sends the file directly to Cloudflare. `images.completeUpload` rechecks owner access, validates the details and completed image, then calls the internal `imageRecords.complete` mutation. That mutation creates the logo and records its ID in `pendingImages` in one transaction, making completion retries safe. An hourly job deletes expired upload tickets in batches of 200. Cloudflare credentials stay in Convex environment settings.
- **Projects:** The home page reads up to 100 cards through `projects.list`, with code-defined fallback content. If the section is absent, the dashboard offers **Import current projects**; opening it does not import data. The editor reads section copy separately and uses `projects.pageForAdmin` in pages of 20. `by_status_and_sortOrder` locates adjacent records for moves without scanning the collection. The existing 100-card portfolio limit remains. Project image uploads reuse the Cloudflare direct-upload ticket; `images.completeProjectUpload` verifies the uploaded image before the editor saves its URL.
- **Tutoring:** `tutoringInquiries.submit` validates and stores public inquiries; a filled honeypot field is ignored. Submissions are limited to three per email per day and 60 globally per hour using the Convex rate limiter component. `pageForOwner` paginates through the `by_status` index, newest first, with 20 records initially. Owner mutations update status or delete an inquiry.
- **Saved workouts:** `shadowboxingWorkouts.page` returns 12 summaries initially through `by_ownerId_and_updatedAt`. The builder fetches full round details with the ownership-checked `get` query only when opening a plan. Direct links work beyond the first page; malformed, missing, or foreign IDs return null after authorization. The former 50-session save cap is removed; each plan retains its round/text/duration validation.
- **External request budgets:** `admin.consumeExternalRequest` derives the owner's ID and consumes shared hourly/daily quotas through the mounted rate limiter. Next AI routes reserve allowance before generation; image actions do so before provider calls. Denied AI requests return 429 with `Retry-After`; quota outages fail closed. See [the quota table and scaling guidance](../docs/architecture.md#expensive-requests-and-background-work). Older bounded list endpoints remain for compatibility; new list UI uses pagination.
- **Résumé:** `siteAssets.resume` returns a Convex storage URL only for a PDF. Next's `/api/resume` route fetches it and falls back to `public/docs/resume.pdf` if unavailable.
- **Signup switch:** `featureFlags.signupEnabled` always returns `false`; public registration remains closed. Owner account setup is controlled in `auth.ts` and `admin.ts`.

`http.ts` registers Convex Auth routes. `migrations.ts` and the migration functions in `images.ts` are internal release tools, not browser APIs. See [the migration guide](../docs/convex-migration/README.md) for setup and preview commands.

## Configuration

The local Convex CLI uses `CONVEX_DEPLOYMENT`; the frontend uses `NEXT_PUBLIC_CONVEX_URL` from `.env.local`. Set `OWNER_EMAIL`, optional `OWNER_SETUP_KEY`, and the `CLOUDFLARE_*` variables declared in `convex.config.ts` on the configured Convex deployment. Keep auth and Cloudflare secrets out of client variables.

Publish backend functions and additive indexes to that same deployment before updating the frontend. These changes require no seed, reset, or data import. A frontend-only preview does not publish backend changes. Multi-user access is documented as an adaptation in the [architecture guide](../docs/architecture.md#adapting-access-for-a-multi-user-project); this app remains owner-only.
