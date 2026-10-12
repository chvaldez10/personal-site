# This repo: personal-site

These notes apply only to this site. The [main guide](./README.md) is reusable in other repos.

## Current status

Preparation is complete. The app still uses Supabase. Convex is installed, but no Convex project or database has been set up.

Next action: [step 2 of the guide](./README.md#2-you-install-convex-and-create-a-test-project). Skip the install command because Convex is already installed.

## Folder and commands

Open Warp in personal-site, then run:

```sh
cd chvaldez10
pnpm exec convex dev
```

If already in chvaldez10, skip the cd command.

This repo uses pnpm and Node 24. See the [app setup guide](../../README.md) for the development and testing commands.

## What needs to move

- brand_logos: the logos' labels, descriptions, and links.
- waffle_switch: settings such as whether signup is enabled.
- Supabase login and existing accounts, once the replacement is chosen.
- Any additional hosted files found when checking the saved data.

For guide step 3, export brand_logos and waffle_switch from Supabase. Save the CSV files in chvaldez10/migration-private/, which is already excluded from Git.

Known logos and the résumé already have local copies. Keep those local files unless a feature needs uploads or updates without publishing the site again.

## Login preference

Keep email/password login. GitHub login is optional later.

The replacement login service and who can access the dashboard still need a decision at step 5.

## Already done

See [PREPARATION.md](./PREPARATION.md). You do not need to repeat that work.
