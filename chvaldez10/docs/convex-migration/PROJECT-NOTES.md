# This repo: personal-site

The [main guide](./README.md) also works for new projects. These steps are specific to this site.

## What changed

- Development database: Convex project chvaldez10, deployment fearless-llama-873.
- Login: Convex Auth, email/password, one owner account. Public signup is blocked.
- Logos: Cloudflare Images hosts the files; Convex stores their labels and links.
- Résumé: Convex storage, with /docs/resume.pdf as the fallback.
- A missing or broken logo shows a fallback icon in the list and popup.
- Dashboard: protected on the server and in backend functions; includes image upload and signout.
- Supabase records, files, and the old integration files are preserved. The public website has not been switched.

## You: create your dashboard account once per deployment

Your development owner account already exists. Use Login with your chosen password. Follow the account-creation steps only for a new deployment.

Run these commands from chvaldez10 in Warp or your usual terminal. They work on Windows and macOS:

```sh
pnpm run doctor
pnpm dev
```

1. Check that .env.local points to your Convex development deployment.
2. Open http://localhost:3000/login.
3. Choose **Set up owner account**.
4. Enter your configured owner email.
5. Choose your own password, at least 12 characters, and confirm it.
6. Open migration-private/owner-setup.txt locally. Copy its setup key into the form. It is a setup key, not your password.
7. Submit and check that the dashboard opens.
8. Upload a test logo. Check it appears on the homepage.
9. Sign out. Opening /dashboard should send you back to login.

Keep the setup key and password out of chat and Git. Setup closes after the owner account is created. Old Supabase passwords are not copied. Password reset and email delivery are not configured; this first version is a single-owner dashboard.

**Stop and tell me:** “Dashboard login and upload work,” or describe the problem.

## Me: checks before publishing

Verified: 14 logo records, one setting, and 14 Cloudflare images. All images loaded in the local browser, and the Convex résumé returned a valid PDF. Typecheck, lint, formatting, the unit/backend/component tests and browser checks, and a normal build passed. Anonymous dashboard access redirects to login. The owner account has been created in development. Live owner signout and direct upload acceptance are still pending.

The import script is guarded to this development deployment. It copies the 14 logo records and one setting from migration-private/ and preserves their original IDs for repeat runs. Existing Cloudflare images are reused on a repeat run.

## You and me: publish later

The production Convex deployment needs its own auth settings and data. The website host needs the production Convex URL. SITE_URL must match the website's URL.

I prepare and verify those changes, then you approve publishing. Keep Supabase available until the public site, owner login, uploads, and résumé have been checked.

## If owner setup fails

The auth entry is src/middleware.ts beside src/app; it calls the preserved root middleware implementation. Development requests to /api/auth must reach Convex rather than return 404. The route fix was checked in the running development server, and successful owner creation/password login was checked in an isolated local test database. Your real password is never used by those tests.

If account creation succeeds but login fails, verify that the deployment's JWKS setting is valid JSON and matches JWT_PRIVATE_KEY. The settings script now preserves JSON correctly. The dashboard waits for Convex to confirm browser authentication before reading private logos.

## Where things are

- App folder: chvaldez10.
- Windows checkout: D:\\chris\\Documents\\Personal\\Personal Projects\\personal-site\\chvaldez10.
- CSVs, private setup key, and import report: migration-private/ (ignored by Git).
- Local résumé fallback: public/docs/resume.pdf.
- Convex functions: convex/.
- Image upload form: src/components/dashboard/LogoManager.tsx.
