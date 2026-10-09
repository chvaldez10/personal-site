# Migration checkpoints

Use with the [migration plan](./README.md). Application/tooling preparation is recorded in [PREPARATION.md](./PREPARATION.md); the cloud/setup/acceptance checkboxes remain unchecked. Codex prepares the deliverable before Chris handles the account/setup/review step. Record results and resume from the next named phase.

Confirmed preference: keep email/password login; GitHub is optional.

Use [REVIEW.md](./REVIEW.md) to make the checkpoint 1 auth/asset choices. The review recommends one root layout, fixed media in `public/` when deployment-based updates are acceptable, and small import tooling unless the data warrants more.

## Checkpoint 1 — Project and source inventory

**Codex delivers:** phase 1 code changes, baseline results, dependency/version notes, an ignored export location, and working setup instructions.

**Chris does:**

- [ ] From `chvaldez10/`, run the prepared local Convex initialization command (`pnpm exec convex dev`) and complete login/team/project selection. Confirm the selected deployment is development. Stop it when setup is complete; use the combined runner afterward.
- [ ] Confirm the Supabase live table/column/index list, RLS policies, triggers/functions, and whether anything besides `brand_logos` and `waffle_switch` is used by the app.
- [ ] Export both tables as JSON/JSONL, or provide CSV for Codex to normalize. Save exports in the prepared ignored location; provide paths, not secrets in chat.
- [ ] Inventory/download actual referenced objects from the `meda` bucket, including the résumé and database logo URLs. Include other buckets if live inspection finds them. Record object names, MIME types, and counts.
- [ ] Confirm how many existing accounts need continuity and whether any have user-owned records. Do not export passwords or tokens into repository files.
- [ ] Choose dashboard access: owner/admin only (recommended for this personal site), or all authenticated users. Confirm whether logo `active` values should affect visibility; default is preserving current displayed data.
- [ ] Choose a mail provider/sender and email verification policy. Identify how existing users can reenroll when open signup is disabled.
- [ ] Choose the auth integration after Codex presents the maintenance/Next.js support tradeoffs: Convex Auth as a learning-oriented candidate, or a managed integration. Keep email/password; prove the selected choice in phase 2.
- [ ] Choose fixed media in `public/` (recommended when files change through deployment), or Convex storage if uploads/updates without redeployment are needed.

**Gate:** Codex can access the development configuration and source data, and access/account policy is recorded. No production traffic has changed.

**Resume:** “Execute phase 2 of the Convex migration plan; stop at checkpoint 2.”

Decision record:

```text
Convex project / development deployment:
Live tables and additional backend features:
Export directory and capture timestamp:
Storage inventory location:
Account count / continuity needs:
Dashboard access policy:
Logo visibility and ordering decision:
Mail provider / sender / verification policy:
Existing-user reenrollment mechanism:
Selected auth integration and maintenance preference:
Media hosting / update workflow:
```

## Checkpoint 2 — Authentication readiness

**Codex delivers:** schema/import dry run, isolated auth compatibility flow, exact initializer instructions, backend access checks, and mail configuration instructions. It must distinguish implemented code from checks waiting on credentials.

**Chris does:**

- [ ] Run the prepared development auth initializer; review generated changes with Codex. Keep generated signing secrets in the proper environment, not Git/chat.
- [ ] Configure development mail credentials and sender verification in the service/deployment settings.
- [ ] Create/verify the test owner through the planned closed registration flow; apply the trusted admin assignment if owner-only access was selected.
- [ ] Confirm password recovery and verification mail arrives and the expired/invalid path behaves sensibly.
- [ ] If GitHub is desired now, configure its development OAuth app using Codex's exact callback instructions; otherwise leave it for later.

**Codex completes:** actual Next.js 16 / React 19 / TypeScript 7 / selected auth integration checks, token forwarding, request entry-point choice, and tests proving direct calls cannot bypass access or signup rules. Convex Auth initialization/signing-key steps apply only when that library is selected; otherwise Codex supplies the chosen provider's exact setup.

**Gate:** auth works in the real app runtime, codegen/typecheck/lint/build compatibility is established, and permission checks pass. If it fails, document the cause and make an explicit provider/package decision before replacing the existing integration.

**Resume:** “Execute phase 3; migrate development data and the app, then stop at checkpoint 3.”

## Checkpoint 3 — Local acceptance

**Codex delivers:** migrated local app, import/storage reconciliation report, rerun evidence, automated check results, and list of intentional behavior changes.

**Chris does:**

- [ ] Open `/` logged out: sections, logos, detail popups, referral links, résumé preview, and PDF download work.
- [ ] Compare logo count/order/fields and feature flags against the export, including missing/disabled signup behavior.
- [ ] Test password login, signup policy, verification, recovery, wrong credentials, and logout.
- [ ] Refresh and navigate between public and dashboard pages; test anonymous and ordinary-user access against the chosen policy.
- [ ] Review mobile layout and form pending/error states.
- [ ] Verify shared-root navigation, reachable signout, logo dialog keyboard behavior, direct résumé link, and the logo section's unavailable-data state.
- [ ] Confirm `doctor`, demo seed, quality checks, and CI setup are documented and do not require production credentials for routine development.
- [ ] Confirm source records/files were preserved and the import can be repeated without duplicates.

**Gate:** local behavior is accepted; unexplained parity/access issues are resolved.

**Resume:** “Prepare phase 4 preview deployment instructions and checks; stop at checkpoint 4.”

## Checkpoint 4 — Preview acceptance

**Codex delivers:** reviewable deployment configuration, exact environment scopes, sanitized preview seed, and smoke-test instructions.

**Chris does:**

- [ ] Configure Vercel root directory `chvaldez10` and the prepared build command.
- [ ] Configure a separate Convex preview deployment/key and auth/mail settings. Verify the preview frontend cannot write to production.
- [ ] Deploy the candidate preview and test its build, public content, media, login/recovery/logout, and protected access.
- [ ] Confirm callback/reset links return to the intended preview origin and no production accounts or secrets were seeded.

**Gate:** preview passes the acceptance matrix and Codex has fixed review findings. Production remains on Supabase.

**Resume:** “Prepare phase 5 final migration and rollback runbook; stop before the production switch.”

## Checkpoint 5 — Production switch and observation

**Codex delivers before the switch:** exact production instructions, final data/file reconciliation, prepared verified-owner setup, candidate revision, fallback revision/environment record, and rollback steps. Use a stable staging/rehearsal run first when production credentials are not yet configured.

**Chris does, with Codex assisting the prepared work:**

- [ ] Configure production Convex auth, sender/mail credentials, correct site origin, optional production OAuth app, and Production-scoped Vercel deploy key.
- [ ] Choose the cutover window and keep a fallback Vercel revision plus Supabase configuration available.
- [ ] Freeze source content/storage changes and signup for the final export; record the timestamp.
- [ ] Review the final production import/reconciliation report and verify the owner can sign in, recover access, and exercise the selected permissions.
- [ ] Authorize the prepared production frontend switch.
- [ ] Immediately test public site/media and login/logout/recovery/protected routes on the live origin. Roll back if a required check fails.
- [ ] Observe errors, failed logins, media failures, and account reenrollment during the agreed window; proposed duration is seven days.

**Gate:** live acceptance is recorded; no unresolved discrepancy or access failure remains. Supabase is still available for fallback during observation. Reconcile any new Convex writes/accounts before a rollback or retry.

**Resume after observation:** “Execute phase 6 cleanup; stop before revoking credentials or shutting down Supabase.”

## Checkpoint 6 — Cleanup and retirement

**Codex delivers:** removal of unused integration code/packages/env references, updated project guidance/setup docs, final checks, and evidence that active source/config no longer calls Supabase or references its hosted media.

**Chris does:**

- [ ] Review and accept cleanup and the final live smoke checks.
- [ ] Archive source exports, file inventory, ID mapping, reconciliation report, and account reenrollment record securely.
- [ ] Decide when the fallback window is closed and revoke obsolete credentials/remove old environment variables.
- [ ] Retire Supabase separately once data retention and remaining consumers have been checked.

**Gate:** all app functionality runs on the accepted target; source data is retained according to the chosen policy; Chris has separately accepted service retirement.
