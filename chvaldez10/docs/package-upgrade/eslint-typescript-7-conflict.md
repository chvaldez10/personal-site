# ESLint vs TypeScript 7

The single biggest blocker in the TS 7 upgrade. Read this before upgrading any project
whose lint stack you don't fully control.

## The conflict

typescript-eslint requires the TypeScript **JavaScript compiler API**, which TS 7
removed. Every 8.x release — including the latest 8.67.0 — declares:

```
peerDependencies.typescript: ">=4.8.4 <6.1.0"
```

and hard-fails at load:

```
Error: typescript-eslint does not support TS 7.0.
```

Upstream tracking: [typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)
(support expected once TS 7.1 ships its new API). There is no 9.x as of Aug 2026.

**Yes, this hits a project pinned to `@typescript-eslint/eslint-plugin@^8.61.1` /
`@typescript-eslint/parser@^8.61.1`** — 8.61.1 has the same `<6.1.0` peer range as
latest. `^` cannot save you because no compatible release exists to float to.

Note it's not just the rules: `@typescript-eslint/parser` is what lets ESLint *parse*
`.ts` files at all. You can't "just remove" typescript-eslint and keep linting TypeScript
with stock ESLint.

In Next.js projects you hit this even if you never installed typescript-eslint yourself:
`eslint-config-next` depends on it and imports it unconditionally at config load.

## Things that do NOT work (tested)

- **Aliasing `typescript` to `@typescript/typescript6`** — fixes lint, breaks
  `next build`/`next dev` (see the alias trap in
  [typescript-7-upgrade.md](./typescript-7-upgrade.md)). Only viable for projects with no
  tool that resolves the `typescript` package by name — verify everything before trusting it.
- **pnpm `packageExtensions` giving typescript-eslint a private TS 6** — `typescript` is
  a *peer* dependency, so it always resolves from the project root; the private copy is
  ignored.

## Options

| Situation | Do this |
| --- | --- |
| Can't change the lint stack (company repo, shared config) | **Stay on TypeScript 6.0.x.** Wait for typescript-eslint TS 7 support, then upgrade both together. |
| Own the lint stack, want TS 7 now | Swap to a linter with no TS-compiler dependency — see [oxlint.md](./oxlint.md). Keep the ESLint config in-repo (inert) to restore type-aware rules later. |
| Want TS 7 and can live without lint temporarily | Upgrade, leave `eslint .` failing, document why. |

## Related: ESLint 10

Independent of TS 7, ESLint 10 breaks `eslint-plugin-react` (≤7.37.5, latest): it calls
the removed `context.getFilename()` API while auto-detecting the React version, crashing
with `contextOrFilename.getFilename is not a function`. Its peer range also stops at
`eslint ^9.7`. Workaround if you want ESLint 10 anyway — pin the React version so
detection never runs:

```js
// eslint.config.mjs
{ settings: { react: { version: "19.2.8" } } }
```

Otherwise stay on ESLint 9.x (deprecated upstream, but it's what the Next lint stack
declares support for).
