# Preparation: already done

This file records work completed in personal-site. It is not a setup checklist for other repos.

You do not need to repeat this work.

- One shared layout holds the app's fonts, styles, and page setup.
- Known logos and the résumé have local copies under public/.
- Logo loading shows a useful message when it fails.
- Login/signup show input errors and a waiting state.
- The dashboard has a signout button.
- Logo dialogs and project buttons work with the keyboard.
- Mobile navigation closes after selecting a link.
- The résumé has preview, open, and download links.
- Development commands, local demo data, formatting, and automated checks are ready.
- Convex is installed, but its project and database have not been set up.

## Useful commands

Run these from chvaldez10/:

- pnpm run doctor — check your local setup.
- pnpm dev — start development.
- pnpm check — run code and formatting checks.
- pnpm seed:dev — create local demo data.
- pnpm test:e2e — build a demo and check it in a browser.

The [app README](../../README.md) explains demo mode and setup.

## Checks previously completed

Code checks, five unit tests, four browser tests, and both builds passed. The normal Supabase homepage loaded correctly, and logged-out visitors were redirected away from the dashboard.

Real account login and email delivery still need to be checked with the chosen replacement.

**The app still uses Supabase. Next: [step 2](./README.md#2-you-install-convex-and-create-a-test-project).**
