# Step 5: choose how login will work

Skip this if the app has no login or private data.

If an existing login service already works, ask me to check whether we can keep it with Convex before choosing a replacement.

If we need a new login service, two options are:

1. **Convex Auth:** build the login screens and email flows around Convex. Its Next.js support is still being developed, so Next.js apps may need more troubleshooting.
2. **Clerk:** use a separate login service that handles more of the account screens and login behavior. You need a Clerk account.

Choose based on the repo and how much login code you want to maintain. Ask me for a short recommendation if unsure.

See [Convex's login guidance](https://docs.convex.dev/auth/overview).

**Tell me:**

- Login methods: email/password, GitHub, or something else.
- Who can access private screens.
- Whether existing users need to keep access.

I will prepare the code and give you the exact setup steps. During a migration, keep the old login working until the replacement is tested.

For this personal site, Convex Auth with email/password is implemented for one owner. A private setup key gates initial account creation; public signup is blocked. You choose the password locally. GitHub, email confirmation, and password reset are not part of this first version. See [the account setup steps](./PROJECT-NOTES.md#you-create-your-dashboard-account).

Return to [step 5](./README.md#5-you-and-me-handle-login-if-needed).
