# Supabase to Convex migration plan

Status: preparation improvements implemented; cloud setup and backend migration have not started. Prepared on October 8, 2026. See [PREPARATION.md](./PREPARATION.md) for the code changes and remaining decisions.

Reviewed against the actual project: see [REVIEW.md](./REVIEW.md) for prioritized improvements, evidence, and tradeoffs. The plan now recommends one shared root layout, a deliberate auth choice, static hosting for fixed media, and import tooling sized to the actual dataset. These are proposed choices to record at checkpoint 1.

Migrate the existing personal site in place: database reads, authentication, and Supabase-hosted files. Keep email/password login; GitHub login is an optional later addition, as confirmed by Chris. Adopt the tutorial's useful development improvements alongside the migration.

Use [CHECKPOINTS.md](./CHECKPOINTS.md) for the handoffs between Chris and Codex. Each phase ends with a working, reviewable result and an explicit exit condition. Account setup, credentials, data exports, and production switching belong to Chris; Codex prepares the code, tools, checks, and instructions first.

| Phase | Codex prepares | Chris's stopping point |
| --- | --- | --- |
| 1. Foundation | Dependencies, one runner, setup/export instructions | Create development project; provide inventory; decide access/account policy |
| 2. Backend proof | Schema, import dry run, auth compatibility flow | Configure development auth/mail and verify the owner account |
| 3. Local migration | Data/files, app integration, checks | Accept local behavior and data parity |
| 4. Preview | Deploy configuration, safe seed, smoke checks | Configure and accept isolated preview |
| 5. Production | Final import, reconciliation, rollback runbook | Authorize switch and accept live behavior |
| 6. Retirement | Remove obsolete integration; update docs | Close fallback window and retire Supabase |

## What the repository actually uses

Paths below are relative to `chvaldez10/`. This inventory comes from source code, not a live inspection of Supabase or Vercel. Confirm deployed tables, policies, accounts, and buckets at checkpoint 1.

| Area | Current implementation | Migration work |
| --- | --- | --- |
| Logo metadata | `src/actions/fetchMedia.ts` reads all of `brand_logos`; `TechFinds.tsx` passes rows to `MarqueeIcons.tsx` | Convex query, data import, generated types, media URL mapping |
| Feature flags | `src/actions/fetchWaffleSwitch.ts` looks up `waffle_switch` by name; login reads `enable_signup` | Indexed flag query; preserve missing flag = signup disabled |
| Login/signup | `src/app/(main)/login/actions.ts`, `login/page.tsx`, `src/components/ui/forms/Login.tsx` | Replace Supabase calls; add shared validation and useful pending/error states |
| Session and dashboard | `middleware.ts`, `src/utils/supabase/middleware.ts`, `src/app/(admin)/dashboard/page.tsx` | Convex Auth session handling, server token forwarding, route checks |
| Confirmation/logout | `src/app/auth/confirm/route.ts`, `src/app/(main)/logout/actions.ts` | Replace confirmation flow and logout; remove browser `alert()` calls from server code |
| Files | Supabase `meda` bucket URLs in `AboutMeJumbotron.tsx` and `src/data/mockBubbleData.tsx`; database logo `src` fields may also use that bucket | Inventory files; prefer `public/` for fixed assets, Convex storage for dynamic uploads; replace runtime URLs |
| Integration scaffolding | `src/utils/supabase/{client,server,middleware}.ts`, `src/types/supabase.ts`, Supabase packages and env variables | Remove after successful cutover |
| Image hosts | Supabase hostname in `next.config.mjs` | Allow actual new file hosts; remove old hostname after migration |
| Layouts | Separate root layouts in `src/app/(main)/layout.tsx` and `src/app/(admin)/layout.tsx` | Consolidate HTML/body, fonts, styles, metadata, and provider composition in `src/app/layout.tsx`; keep group-specific shells |

The generated Supabase types show two application tables and no relationships. They do not prove the live database has no other tables, triggers, policies, or functions. `src/types/Profile.ts` is a project-card interface, not evidence of a user profile table. Projects/navigation already live in local constants and do not need to move into Convex.

Two behavior decisions need care: the existing logo query does not filter `active`, and the existing dashboard permits any authenticated user. Preserve the visible logo set until Chris explicitly chooses filtering. Recommend restricting administrative capabilities to an explicit admin identity; checkpoint 1 records whether the dashboard is owner-only or intended for all signed-in users.

## Tutorial ideas to adopt

Source: Chris's transcript at `D:\chris\Downloads\del.txt`; a video URL and publication date were not supplied. Use its explanations and timestamps, while checking package APIs against current documentation.

Also use the [official Convex tutorial](https://docs.convex.dev/tutorial/overview) Chris supplied. It demonstrates generated API references, runtime argument validators, transactional mutations, subscriptions, and a combined development command. Adapt those concepts to the existing Next app; its example runs on port 5173, while our Next development app normally uses port 3000. Signing into the Convex dashboard with GitHub is separate from choosing how visitors log into this site.

Its [external-services lesson](https://docs.convex.dev/tutorial/actions) clarifies that outside network calls belong in actions, with database changes delegated to mutations. Apply this to any backend file-transfer or mail work; local migration scripts can also handle transfers. Its [scaling lesson](https://docs.convex.dev/tutorial/scale) is a follow-up reference for query/index decisions in phase 2. We define explicit schemas and permission checks before importing real site data, rather than relying on the simplified example's schema-free, public chat functions.

| Transcript section | Apply to this project |
| --- | --- |
| 2:53–7:37: setup, queries/mutations/actions, generated API | Put backend code in `chvaldez10/convex/`; use generated API references and types. Reads are queries; writes are mutations; external service work is actions. |
| 7:43–9:03: one development runner | One `pnpm dev` starts Next and Convex with named output and coordinated shutdown. Use `concurrently` here; its documented Windows support suits this workspace. See the [runner documentation](https://github.com/open-cli-tools/concurrently). |
| 16:42–28:09: shared Zod validation and field errors | Add Zod for form/import/business validation on both client and backend. Keep authoritative checks on the backend. Current helper documentation shows the Zod 4 adapter at `convex-helpers/server/zod4`; verify installed versions before using wrappers. See [convex-helpers Zod validation](https://github.com/get-convex/convex-helpers/tree/main/packages/convex-helpers#zod-validation). |
| 32:53–33:28: inferred document types | Use generated `Doc`, `Id`, and query result types; stop maintaining duplicate database row types. |
| 41:17–57:06: Convex Auth, server access, signout | Keep the existing login routes and email/password behavior. Check current installation requirements rather than copying the video's `@auth/core@0.37.0` pin. |
| 57:13–59:41: authorization in functions | Check identity and permissions inside each protected Convex function. Route redirects alone are insufficient. |

Reuse the existing shadcn components. React Hook Form and its Zod resolver are optional if form complexity warrants them; this migration does not require adding them to the simple login form. Use inline field errors, disabled submit states, and accessible status messages. The tutorial's todo editor, styling replacement, whole-site login requirement, and deletion of existing data do not apply to this personal site.

## Proposed target design

### Authentication and access

Choose the auth integration at checkpoint 1 using maintenance needs and email/password requirements, rather than the tutorial alone. Compare Convex Auth with a managed integration such as Clerk. Convex describes its Auth library's Next.js support as experimental; see [Convex authentication guidance](https://docs.convex.dev/auth/overview). Convex Auth remains a candidate if Chris prefers learning and accepting that maintenance tradeoff. Prove the selected integration against Next.js 16.3, React 19, and TypeScript 7 in phase 2. The Convex Auth file/API examples below are conditional on selecting that library; a managed integration will use its own providers/configuration. Do not install both or silently switch the decision. See [Convex Auth](https://labs.convex.dev/auth) and its [setup requirements](https://labs.convex.dev/auth/setup).

Keep `/` public, `/login` available, and `/dashboard` protected. Protect `/admin` if introduced; do not create an admin product as part of this migration. If Chris chooses owner-only access, use a server-controlled admin assignment keyed by the new authenticated user ID. Never accept a role or owner ID from a signup form. Ordinary signup must never grant administration.

Enforce `enable_signup` in the actual backend account-creation path, including direct calls that bypass the UI. Do not block existing users from logging in when signup is disabled. Decide and test a closed registration mechanism for reenrolling existing users before launch. A public query should expose only the signup flag, not all future internal flags. Private reads/writes must obtain the current user from the auth context and perform their own permission checks.

If passwords remain, include account recovery and the verification policy selected at checkpoint 1. Put mail credentials in the Convex deployment that sends mail. Use safe application errors instead of exposing raw backend details. Password reset/verification integration is documented in [Convex Auth passwords](https://labs.convex.dev/auth/config/passwords).

Supabase sessions will not carry across. Plan fresh login and, unless a separately verified migration mechanism is chosen, account reenrollment/password setup. For an owner-only site, recreate the owner account after proving control of the identity. If other accounts exist, record how verified identities and any user-owned data map to new Convex IDs. Do not import Supabase auth internals/password hashes as ordinary Convex documents or assume a reset flow can recover an account that was never created.

Next's installed docs use `proxy.ts`; the current Convex Auth guide still illustrates `middleware.ts`. Confirm their integration behavior during the compatibility spike and choose one working entry point. Test cookies, redirects, callback/reset routes, and server token propagation. See [server-side auth guidance](https://labs.convex.dev/auth/authz/nextjs).

### Data model and files

Proposed names and fields are provisional until the live export is checked:

| Source | Convex destination | Mapping |
| --- | --- | --- |
| `brand_logos` | `brandLogos` | Keep `alt`, `description`, `label`, `active`; map `referral_link` to `referralLink`. Retain numeric source ID as indexed `legacyId`. Use `storageId` for migrated files and a validated external source only when needed. |
| `waffle_switch` | `featureFlags` | Keep `name`, `description`; map `is_active` to `isActive`. Index `name`; import must reject duplicate names. Retain `legacyId` for reconciliation. |
| Résumé PDF | Prefer `public/docs/resume.pdf` for a fixed file; otherwise `siteAssets` | Stable local URL with redeployment to update; use storage ID/metadata only if dynamic file publishing is needed. |
| Existing auth accounts | Selected auth integration plus server-controlled admin assignment if selected | Reenroll/map verified identities using the selected integration; not a direct SQL/auth-table import. |

Use Convex schema validators for persisted structure and function boundaries, with Zod for richer rules such as URL format, trimmed labels, and form input. Establish explicit null/optional mappings from the export; do not treat `false`, `0`, or an empty string as missing. Preserve source timestamps separately if useful; `_creationTime` reflects import creation unless deliberately handled otherwise. Generated `_id` values replace numeric UI keys. Indexes do not enforce uniqueness by themselves; enforce unique names/legacy IDs in import and write logic.

Set a deterministic logo order based on the captured existing presentation and preserve it during import. Do not introduce an `active` filter as an accidental migration change. Add a sort field if the live data has no ordering contract.

Prefer validated JSON/JSONL exports over raw CSV booleans/nulls. Convex can import these formats, but source numeric IDs must not be copied into `_id`. First measure the export size. For small tables, a validated transform plus an explicitly targeted import/upsert command is sufficient; add batching/resume machinery only if needed. Include dry-run validation, rejected rows, and reconciliation. Use an empty staging deployment first; do not use a destructive production `--replace` by default. See [Convex data import](https://docs.convex.dev/database/import-export/import).

Choose file hosting at checkpoint 1. Recommend `public/logos/` and a stable `public/docs/resume.pdf` for files updated through deployments; compare existing local logos against source files first. Use Convex storage if updating/uploading files without redeployment is a requirement. For storage, preserve MIME types, deduplicate by source path/checksum, and record source path → storage ID per deployment; obtain delivery URLs through its API. See [Serving Files](https://docs.convex.dev/file-storage/serve-files). Test SVG logos, optimized images, PDF preview, and a direct open/download fallback. Both choices remove Supabase-hosted media from the app.

The apparent unused mock dataset still contains Supabase URLs; update or remove it deliberately. A logo or description about the Supabase product can remain—it is portfolio content, not a dependency.

### Next.js integration and development workflow

Create one root `src/app/layout.tsx` for HTML/body, fonts, global styles, metadata, and selected provider composition. Keep the public navbar/footer in `(main)/layout.tsx` and the dashboard shell in `(admin)/layout.tsx`. Keep session-sensitive server auth composition scoped appropriately so the public rendering strategy remains deliberate. Keep server components for initial homepage content and flag reads. Start with `fetchQuery`; use `preloadQuery` only for a concrete realtime requirement, considering its documented no-store rendering behavior. Pass auth tokens for protected server queries. See [Next.js server rendering](https://docs.convex.dev/client/nextjs/app-router/server-rendering).

Suggested locations:

```text
convex/
  schema.ts
  brandLogos.ts
  featureFlags.ts
  siteAssets.ts
  auth.ts, auth.config.ts, http.ts
  lib/authorization.ts
  migrations/                 # internal import helpers only as needed
  _generated/                 # generated, never hand-edited
src/components/providers/ConvexClientProvider.tsx
src/lib/validation/           # browser-safe shared Zod schemas
scripts/convex-migration/     # validation/import/reconciliation tools
```

Add `@convex/*` → `./convex/*` to the app's TypeScript paths; preserve the existing `@/*` → `./src/*`. Ensure both app and Convex code are checked; handle Convex's separate tsconfig and generated-code lint ignores explicitly. Verify compatibility with the native TypeScript 7 compiler and keep Oxlint as the project linter.

Proposed package scripts, added incrementally once their commands work:

```json
{
  "dev": "concurrently --kill-others --names next,convex \"pnpm dev:web\" \"pnpm dev:backend\"",
  "dev:web": "next dev",
  "dev:backend": "convex dev",
  "build": "next build",
  "lint": "oxlint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "check": "pnpm typecheck && pnpm lint && pnpm test"
}
```

Initialize Convex interactively before using the combined runner. Pin resolved dependencies in the pnpm lockfile and use the local CLI (`pnpm exec convex`), rather than downloading a CLI on every run. Add Zod and `concurrently`; start with native Convex validators and explicit business parsing, adding `convex-helpers` only when justified. Add Vitest/`convex-test` for meaningful permission/import tests; see [convex-test documentation](https://docs.convex.dev/testing/convex-test). Keep build separate because it may need deployment configuration. Add a read-only `pnpm run doctor`, explicitly development-only `seed:dev`, formatting checks, and Linux CI with documented codegen/environment setup as detailed in [the review](./REVIEW.md). Checks must not silently provision or deploy backends.

## Phases and stopping points

### Phase 1 — Codex: prepare the foundation

1. Record baseline typecheck, lint, build, and current route behavior on an isolated migration branch (`codex/convex-migration` when creating one). Distinguish preexisting failures from migration failures.
2. Add the initial dependencies, script changes, `.env.example`, and an ignored directory for private exports/manifests. Keep the current app working against Supabase during setup.
   Prepare a read-only environment preflight, supported Node baseline, corrected setup README, formatter/editor configuration, and a CI skeleton. Complete seed/tests/CI only once the real backend setup is available; avoid unrelated formatting changes.
3. Prepare exact local setup/export instructions; inspect the diff for incidental initializer changes.

**Stop 1 — Chris:** initialize the Convex development project, provide the live inventory/exports, and decide access/account policy. [Checkpoint 1](./CHECKPOINTS.md#checkpoint-1--project-and-source-inventory) lists the deliverables.

### Phase 2 — Codex: build and prove the backend

1. Define the schema, indexes, read functions, import validation, and storage mapping. Dry-run the supplied data and report all unmapped or invalid records.
   Follow the official tutorial's query/mutation/generated-API workflow, using our logo/flag domain. Keep file/network work in scripts or actions, and database writes in bounded mutations.
2. Install/configure the auth integration chosen at checkpoint 1 according to current requirements. Prepare password/reset/verification code and server-controlled access rules.
3. Build a development-only compatibility probe or test flow before routing the real app through the new auth stack. Prepare tests for unauthorized calls and signup bypass attempts.
4. Prepare the auth initializer and email configuration instructions. Do not deploy this probe or replace production sessions.

**Stop 2 — Chris:** complete development auth initialization and mail setup, reenroll the test owner, and verify receipt of reset/verification messages. Codex then completes the compatibility checks. Do not enter phase 3 until the real Next/Convex/auth combination works. [Checkpoint 2](./CHECKPOINTS.md#checkpoint-2--authentication-readiness).

### Phase 3 — Codex: migrate the app in development

1. Import into development, copy verified fixed assets to `public/` or upload dynamic assets according to the selected strategy, and reconcile rows/flags/files. Make reruns safe and test one; size tooling to actual data.
2. Replace data fetchers and Supabase row types; update marquee keys/fields, résumé lookup, image host rules, and mock URLs.
3. Consolidate the root layout and provider composition; replace login, signup, logout, confirmation, session handling, and dashboard reads. Implement pending/field/general error states, a reachable signout control, and backend signup enforcement. Add section-level logo error/fallback behavior and reuse the existing Dialog while touching that component.
4. Keep old integration code available in Git for rollback; do not add a permanent runtime backend toggle or dual writes for this small app. Remove transient probes when done.
5. Run the validation matrix below; record data reconciliation and outstanding behavior decisions.

**Stop 3 — Chris:** review the actual local site, source-data parity, access rules, and account flows. [Checkpoint 3](./CHECKPOINTS.md#checkpoint-3--local-acceptance).

### Phase 4 — Codex prepares; Chris configures preview

Codex prepares the deploy command, environment matrix, sanitized preview seed, and exact account/mail/OAuth configuration instructions. Use the existing Vercel project with root directory `chvaldez10`. Candidate build command: `pnpm exec convex deploy --cmd "pnpm build" --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`.

Chris configures an isolated preview backend and Vercel Preview environment. Production and preview deploy keys must be scoped separately; preview data/auth configuration are not inherited from production. Seed only safe data, and verify the preview can render at build time. See [Convex on Vercel](https://docs.convex.dev/production/hosting/vercel).

**Stop 4 — Chris:** review the deployed preview and complete the same acceptance flows there. Codex fixes discovered issues before production preparation. [Checkpoint 4](./CHECKPOINTS.md#checkpoint-4--preview-acceptance).

### Phase 5 — Production cutover

Codex prepares a final import/reconciliation report, an immutable fallback revision, and a production runbook. Chris configures production auth/mail and deployment credentials, then chooses the switch window.

1. Freeze edits to Supabase tables/storage and account creation for the agreed window; record the final export timestamp.
2. Import the final data snapshot into Convex production and publish files through the chosen asset strategy. Reconcile against the source; if using Convex storage, development storage IDs cannot be reused as production mappings.
3. Reenroll/verify the owner, assign admin access through the trusted mechanism, and prove login and recovery before switching the frontend. If other users exist, execute the agreed reenrollment/mapping process.
4. Verify backend changes remain compatible with any frontend currently talking to that Convex deployment. Deploy the candidate frontend; Convex deployment/build orchestration is not an atomic frontend/backend rollback mechanism.
5. Run production smoke checks immediately. Keep Supabase exports, credentials, and the old Vercel revision available throughout the observation window.

**Stop 5 — Chris:** authorize the production switch after the candidate and reconciliation report are ready, then confirm live acceptance. [Checkpoint 5](./CHECKPOINTS.md#checkpoint-5--production-switch-and-observation).

Rollback: if public media fails, auth is unreliable, data differs, or unauthorized access is possible, restore the known Supabase frontend revision and its environment configuration; ensure the old project is still available. Existing Supabase sessions may require login again. Record any writes/accounts created in Convex since cutover before rolling back; keep them for reconciliation and do not assume data flows back automatically. If changes occurred, freeze writes and resolve differences before retrying. Do not delete Convex data or alter schema destructively to undo a frontend release.

### Phase 6 — Codex cleans up; Chris retires Supabase

After an agreed observation window (proposed: seven days), Codex removes unused Supabase packages/CLI, utility files, generated SQL types, old confirmation code, remote host configuration, and obsolete env references. Update the README and root `AGENTS.md` to describe Convex. Remove migration-only callable functions or leave them strictly internal with documented targeting. Re-run the checks and scan application source/config for old backend references.

**Stop 6 — Chris:** review cleanup, archive the final exports, and separately decide when to revoke credentials and shut down Supabase. [Checkpoint 6](./CHECKPOINTS.md#checkpoint-6--cleanup-and-retirement).

## Validation matrix

| Check | Required evidence |
| --- | --- |
| Tooling | Typecheck, Oxlint, focused tests, build; clean checkout can install/codegen/check with documented setup |
| One runner | Both watchers start; changes sync; Ctrl+C stops both; a failed child stops the other on Windows |
| Data/import | Counts and field parity; null/false handling; duplicate flags rejected; rerun does not create duplicate rows/files |
| Public site | Logged-out `/` works; logo ordering/details/referral links match; all images/SVGs and résumé preview/download work |
| Auth | Signup policy; verified login; wrong credentials; expired/invalid verification; reset; logout; session after refresh and navigation across both layouts |
| Authorization | Anonymous protected access denied; direct unauthorized Convex calls denied; signup-disabled bypass denied; non-admin administration denied when owner-only access is selected |
| Preview/production | Correct backend URL; isolated data; callbacks/mail target correct origin; build and runtime both work; previous release can be restored |

Use focused backend tests for validation, access, and import behavior, plus real browser/mail checks for auth and rendering. Mock tests alone cannot prove cookie and callback integration. Migration completion means the deployed app uses no Supabase auth, database calls, or hosted media, data is reconciled, and Chris has accepted live behavior.

## Environment ownership

| Location | What belongs there |
| --- | --- |
| Local `.env.local` | CLI-selected `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`; any server-only variables required by the selected integration |
| Convex deployment settings | Auth-generated signing configuration, correct `SITE_URL`, mail credentials, optional OAuth credentials, server-controlled admin bootstrap configuration |
| Vercel environment scopes | Correct frontend/backend configuration; server-only `CONVEX_DEPLOY_KEY` separately for Preview and Production |
| Versioned `.env.example` | Variable names/placeholders and setup notes only |

For optional GitHub login, Chris creates separate OAuth configuration for development and production and supplies credentials directly in deployment settings. Follow the documented Convex HTTP action callback URL, not the Next hostname or the database `.convex.cloud` URL. See [GitHub provider configuration](https://labs.convex.dev/auth/config/oauth/github). Email matching alone is not permission to link accounts; follow the chosen provider's verified linking behavior.

## First action when implementation begins

Application/tooling preparation is implemented in [PREPARATION.md](./PREPARATION.md). Review that work, then complete checkpoint 1's cloud project, source-inventory, and auth-policy inputs before beginning phase 2. Convex initialization, data import, and production deployment remain separate migration steps.
