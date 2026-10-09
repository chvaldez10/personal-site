# Preparation changes

These changes prepare the existing application for migration. Supabase still handles database reads, authentication, and session refresh. No Convex project, backend schema, provider account, or cloud deployment was created.

## Implemented

- A shared root layout owns HTML/body, fonts, metadata, and global styles; route groups retain their own shells.
- The existing root middleware entry point is preserved. Session checks remain verified, protected routes fail closed, and redirects carry refreshed cookies.
- Login/signup use shared Zod validation, React action state, pending submit controls, field errors, and safe general errors. Signup checks the application flag again on the server.
- The dashboard exposes signout. Confirmation failures lead to a useful login message and confirmation destinations are constrained to local paths.
- Logo reads distinguish failed requests from successful empty data and have bounded requests. Database metadata still comes from Supabase.
- Fifteen local logo files were compared byte-for-byte to the existing hosted objects. The previously missing YouTube SVG and résumé PDF were copied into public/. Existing cloud objects were preserved.
- The logo popup reuses Dialog, with Escape/focus behavior; project selectors use buttons with pressed state; mobile navigation has a title and closes after selection.
- The résumé has a named trigger and direct open/download links. Contact links honor their destination without nesting a button inside a link.
- Node 24, pnpm scripts, a read-only doctor, local demo seed, gradual formatting baseline, and Linux CI are configured.
- Unit tests cover input validation, local redirect constraints, logo URL mapping, and data shape. Browser tests use a production demo build without production credentials.

## Deliberately pending

Checkpoint 1 still decides the replacement auth integration, administrative access policy, and account reenrollment. Convex Auth and managed auth tradeoffs are in AUTH-DECISION.md.

The current server signup flag does not reconfigure Supabase's public auth endpoint. Provider-level signup controls require a cloud configuration decision.

Actual live data exports, import sizing, mapping of any additional files, and cloud cutover remain in the migration phases. No generalized importer was built before the data inventory.

A real-account password/login/logout check and mail/confirmation acceptance require the existing project's accounts and email setup. Demo/browser tests cannot establish those live-service outcomes.

## Verification

Typecheck, Oxlint, the maintained formatting check, five unit tests, and four Chromium smoke tests passed. Both the demo and normal Supabase production builds passed. The project's read-only doctor passed against the configured environment. Existing TypeScript/ESLint peer incompatibility remains documented in the package-upgrade playbook; Oxlint is the active linter.

The normal local production server also loaded the existing Supabase logo content without the unavailable-data fallback and redirected anonymous dashboard access to login. Desktop dialog and mobile login layouts were visually inspected; the development runner was checked for startup and shutdown.

The build confirmed an on-disk stylesheet casing mismatch on Windows. The filename was normalized to the lowercase name already tracked by Git; its contents were preserved.

CI configuration is prepared locally; it will execute when these changes are pushed. No deployment is implied by passing local checks. Live authenticated account/mail flows remain a separate acceptance step.
