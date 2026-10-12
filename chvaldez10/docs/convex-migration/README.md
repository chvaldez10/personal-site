# Set up Convex or migrate an existing app

Use this guide for either:

- **Migration:** replace an app's current database/backend with Convex.
- **New setup:** add a new Convex backend to another repo.

Follow the steps in order. Skip the steps marked “migration only” when starting fresh.

For this personal site, see [PROJECT-NOTES.md](./PROJECT-NOTES.md) for the folder, table names, and work already done.

## 1. You: open the app folder

Open Warp or your usual terminal in the folder containing the app's package.json.

In a repo with several folders, this may be a subfolder rather than the repo root.

The pnpm/npm commands below work on Windows and macOS, in Warp or another terminal. On Windows you can use PowerShell or Command Prompt; on macOS use your usual terminal. Run the commands from the app folder on either system.

If you need to change folders, put paths containing spaces in quotes. For example, cd "my app" works on both systems. Use your own folder location rather than copying someone else's Windows or macOS path.

## 2. You: install Convex and create a test project

These examples use pnpm. Keep using the package manager already used by the repo.

If Convex is not installed yet:

```sh
pnpm add convex
```

Then run:

```sh
pnpm exec convex dev
```

1. Follow the sign-in prompt.
2. Choose your account/team.
3. Create a project for this app. Each unrelated app should have its own Convex project.
4. Start with its development version for testing.
5. Wait until the terminal says the functions are ready.
6. Press Ctrl+C (Control+C on macOS) to stop the command.

For an npm repo, use npm install convex and npx convex dev instead.

See the [official setup examples](https://docs.convex.dev/quickstarts) if you are following along manually.

**Stop and tell me:** “Convex setup is done.” Include the repo and project name, not keys or passwords.

## 3. You and me: save the old data — migration only

Skip this step for a new setup.

1. Ask me to prepare a folder for saved data that Git will ignore. This repo already ignores migration-private/.
2. Open the current database service and export the app's tables as CSV or JSON.
3. Save the files in that folder and note each table's row count.
4. Tell me how many existing users need to keep access.
5. Tell me whether the old service also stores images or other files.

For Supabase, start in Table Editor, export each app table, and check Authentication → Users for the account count.

**Stop and send me:** the saved file paths, row counts, and account count. Keep passwords and account keys out of the files and chat.

I will check which files and other database features also need to move.

Exported rows may contain image links, not the image files themselves. We must check the files separately. [Convex has file storage](https://docs.convex.dev/file-storage/overview) for uploaded files; fixed assets can also stay in the app's public/ folder.

If files are already hosted by another service, such as Cloudflare Images, tell me and provide an example image link. We can keep that service and store its links in Convex rather than copying the files again.

## 4. Me: connect the app to Convex

For a migration, send:

> Do step 4 of the Convex guide for this repo. Copy the saved data and connect the app to Convex. Keep the current login working for now.

For a new setup, send:

> Do step 4 of the Convex guide for this repo. The app should let users [describe what they can do].

I will:

1. Inspect the repo and match its existing framework and coding style.
2. Create the Convex tables and functions for reading/changing the app's data.
3. Copy and compare the saved data if this is a migration.
4. Connect the relevant screens to those functions.
5. Set up one development command for the app and Convex where appropriate.
6. Add useful error messages and a fallback icon for missing or failed images, then run the project's checks.
7. Give you the command and local URL for testing.

**Stop:** I show you the working result; you check the main screens before we continue.

## 5. You and me: handle login if needed

If the app has no login or private data, skip this step. If it already has a working login service, we first check whether it can stay.

Otherwise:

1. Read [AUTH-DECISION.md](./AUTH-DECISION.md) and choose how login should work.
2. Tell me which login methods you want and who can access private screens.
3. I prepare the login code and give you the exact account/email settings to enter.
4. You enter those settings and test the account emails.
5. We check login, signout, and blocked access for people without permission.
6. If using passwords, also check password reset and account confirmation as needed.

**Migration only:** we must decide how existing users keep access before switching. Do not assume their old passwords will copy across.

**Stop:** the required account flows must work before publishing.

## 6. You: check the app on your computer

Run the development command I provided. It will usually be:

```sh
pnpm dev
```

For npm, use npm run dev. Open the URL printed in the terminal.

Check the features this app has:

- Displaying, creating, editing, and deleting data.
- Loading, empty, and error messages.
- Images, file links, and downloads.
- A fallback icon appears when a logo cannot load; its label and details still work.
- Login, signout, and private screens.
- Mobile layout and keyboard controls.

**Migration only:** compare the screens and data with the old app.

**Stop and tell me:** “Local checks passed,” or list what failed. I fix failures before the next step.

## 7. Me, then you: test a separate online copy

1. I prepare instructions for this repo's hosting service, such as Vercel.
2. I give you the exact build command, settings, and where to enter them.
3. You configure a separate Convex test database and the online test copy.
4. You open its URL and repeat the checks from step 6.
5. I fix any failures.

**Stop:** the online test copy must work before launch.

## 8. Me, then you: launch

1. I prepare the launch steps and a way to restore a working version.
2. You enter the public app's Convex, hosting, and login settings using my instructions.
3. We verify the app and required accounts work with those settings.
4. I show you the finished result and checks; you approve publishing.
5. After publishing, you repeat the main checks on the public URL.

**Migration only:** pause edits to the old data, save a fresh copy if it changed, and have me copy/check the final data before the switch. Keep the old service available while we check the new app.

**Stop:** fix any important failures before considering the launch finished. For a migration, restore the old working version if necessary and account for any data changed since the switch before retrying.

## 9. You: finish the move — migration only

1. Use the new app for an agreed period; a week is a reasonable starting point.
2. Report missing content, broken files, or account problems.
3. I review the leftover old integration and update the setup docs.
4. Keep existing files until you decide what cleanup is allowed.
5. You decide when to stop using the old service. First confirm the app no longer needs it for data, login, or files. Keep the saved data copies.

## Track progress

Use [CHECKPOINTS.md](./CHECKPOINTS.md) for each repo.

The [Convex tutorial](https://docs.convex.dev/tutorial/overview) explains the concepts. This guide gives the order to follow.
