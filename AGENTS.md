# Project guidance for coding agents

This is a small personal site maintained by one person. Keep the code, workflow, and explanations simple. Solve the current problem with as little ongoing maintenance as possible.

## Keep it simple

- Make the smallest coherent change. Reuse what exists; add abstractions or dependencies only when they solve a concrete problem.
- Backend migrations must preserve existing styling and visual behavior. Change CSS only when required for the requested feature or explicitly requested by the user. General cleanup is not permission to redesign components.
- Use one shared Convex database for the local app, Vercel previews, and the hosted site. Use the configured, populated deployment. Do not introduce separate databases, staging environments, or data-copy workflows unless requested.
- Unit tests are not required for this project. Do not add or expand unit tests, test frameworks, mocked backends, or demo modes unless the user asks.
- Match the requested scope. A Vercel preview is a frontend preview using the existing database; it does not require a production migration.
- Keep documentation short and actionable. Update an existing guide instead of creating additional planning, comparison, audit, scoring, or release documents.
- Apply framework guidance within these project constraints. Generic workflows are not a reason to add environments, tests, or approval steps.
- Answer simple questions directly. When asked whether something is ready, lead with yes or no and mention only actual blockers.
- Proceed within the user's authorized scope. Ask only for genuinely missing information or necessary approval; avoid repeated confirmations and unnecessary process.
- Preserve unrelated user changes, existing assets, and data unless their removal is requested.

## Project map and code

- The app is in chvaldez10/. Run app commands there. Use Node 24 and the pnpm version in package.json.
- Stack: Next.js App Router, React, TypeScript, Tailwind, existing shadcn/Radix UI, Convex, and Convex Auth.
- Pages/layouts: src/app/. Components: src/components/. Shared content: src/constants/. Types/helpers: src/types/ and src/lib/. Backend: convex/. Use the @/ alias for src imports.
- Read chvaldez10/AGENTS.md before app changes. Preserve its generated rules and consult the installed Next.js guide for the API being changed. Read convex/_generated/ai/guidelines.md before backend changes.
- Keep pages focused on composition. Keep components server-rendered unless they need browser state or events. Keep server-only code out of client components.
- Enforce owner access in backend functions and protected routes. Validate inputs, handle failures, and keep credentials in deployment settings rather than client code.
- Cloudflare Images hosts logos. Convex hosts the résumé, with public/docs/resume.pdf as the fallback.
- Before building a new UI element, check the existing components and theme. Reuse them when they fit; add custom components or styles only for a concrete need. Preserve responsive layouts, keyboard access, focus states, image fallbacks, and established visual behavior.
- The public site uses a light theme: cream and white surfaces, dark text, and orange or pink accents. Match it on new pages and sections unless the user explicitly requests a different theme.
- Use clear TypeScript contracts. Avoid any, unsafe assertions, silent failures, unrelated formatting, and unnecessary generated-file or lockfile changes.

## Verify proportionately

- After code changes, run pnpm typecheck and pnpm lint. The lint command uses Oxlint; do not substitute ESLint.
- Run pnpm build for route, server, configuration, dependency, or other build-sensitive changes.
- Check the affected behavior in a browser when practical. A focused manual check is enough for ordinary UI changes.
- Unit tests and full test suites are not routine requirements. Documentation-only edits do not need application tests or builds.
- Keep maintained formatting consistent. Report what changed, what was checked, and any real remaining issue concisely.
- Backend changes affect the shared live data. Do not seed, reset, migrate, or initialize databases as part of routine verification.
