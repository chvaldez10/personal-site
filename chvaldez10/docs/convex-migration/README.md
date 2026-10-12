# Convex setup and migration

For this site, the app uses Convex and Cloudflare Images. Local and hosted pages can share the existing Convex database. A frontend preview does not require another database.

## New projects

From the app folder in Warp or a normal Windows/macOS terminal:

```sh
pnpm add convex
pnpm exec convex dev
```

Follow the account/project prompts. Tell the coding agent the project name when setup finishes; keep credentials out of chat.

The agent creates the schema and functions, connects the pages, and implements login/private access if needed. Keep the implementation proportional to the app.

## Migrate an existing app

1. Save table exports and hosted files in an ignored private folder.
2. Tell the agent which data and accounts must remain available.
3. Have the agent migrate the data, connect the pages, and verify the affected behavior.
4. Check images, file links, login/signout, uploads, and protected routes before updating the hosted site.
5. Keep old data/files until the replacement works.

## This site's preview

The existing Convex database already contains the data and owner account. vercel.json builds the frontend against it without deploying backend changes.

```sh
vercel
```

Use your existing owner email and password. Preview uploads change the same database used locally. The public domain stays unchanged until you choose to update it.
