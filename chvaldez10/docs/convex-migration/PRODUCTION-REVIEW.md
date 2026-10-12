# Component and page review

Reviewed the unstaged and new component/page changes, their data helpers, and the auth entry points.

## Fixed

- Removed DemoLogin, the demo setting, fixture seeding, and all app behavior branches. Tests now use a separate local backend stub.
- Kept login components focused on authentication. The page loads owner setup availability; setup passwords require 12–128 characters, matching the backend.
- Added recovery screens for login and dashboard failures. Private logo queries still wait for confirmed browser authentication.
- Moved upload handling into a focused hook with shared input validation. Retrying a failed metadata save reuses the uploaded image.
- Bounded résumé query/file timeouts and stopped reading oversized PDFs. Invalid or unavailable files still use the local fallback.
- Removed backend route assumptions from the reusable PDF dialog; the page supplies the download URL.
- Checked referral links before rendering them. Keyboard focus pauses the marquee; mouse scrolling and the seamless loop remain intact.

## Before publishing

- Configure the production Convex deployment, auth keys, owner email/setup key, Cloudflare settings, and data. Development settings have not been promoted.
- Set the website's production Convex URL and matching auth SITE_URL.
- Check owner login, signout, uploading, public logo display, and résumé retrieval on the production/preview setup.
- Password reset and email delivery are outside this single-owner version. No recovery flow is claimed.

Existing Supabase source data/files and local assets remain preserved. No production deployment was performed during this review.

Verification: typecheck, lint, formatting, 22 unit/backend/component tests, seven browser checks, a normal build, and the configuration preflight passed. Browser checks include login failure/recovery, anonymous access denial, logo fallback, keyboard dialogs, and a wide-screen continuous marquee.
