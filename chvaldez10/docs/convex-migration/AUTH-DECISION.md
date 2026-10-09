# Authentication decision before Convex migration

Email/password stays; GitHub login is optional. The current application still uses Supabase authentication, so existing accounts and sessions remain supported while the backend choice is evaluated.

| Choice                            | What we maintain                                                                                            | Benefit                                               | Tradeoff                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Convex Auth                       | Custom forms, mail/reset/verification setup, session integration, and package compatibility                 | Auth logic stays close to Convex; useful for learning | Current Convex documentation describes Next.js support as experimental  |
| Managed integration such as Clerk | Application permissions and provider integration; provider handles more of the account UI/session lifecycle | Less custom auth maintenance                          | Another service, provider-specific setup, and plan/usage considerations |

See [Convex's authentication guidance](https://docs.convex.dev/auth/overview) and [Clerk integration](https://docs.convex.dev/auth/clerk).

Recommendation: choose a managed integration if reliable account flows with less auth maintenance are the priority. Choose Convex Auth if learning its implementation and accepting the compatibility work is the priority. Prove the selected choice with real login, recovery, verification, logout, and protected server calls before switching.

No replacement auth package has been installed. The Convex client/CLI is available for future setup, but no deployment or backend schema has been initialized.

The current signup Server Action validates input and respects the signup flag. This does not change Supabase's own signup settings: preventing direct calls to its public auth endpoint requires a corresponding service-level configuration or hook. The migration's checkpoint 1 should settle that policy.

Owner-only dashboard authorization and existing-user reenrollment remain product decisions at checkpoint 1; today's dashboard continues to require a verified Supabase user.
