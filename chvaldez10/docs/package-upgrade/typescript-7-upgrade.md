# TypeScript 5/6 → 7 Upgrade

TypeScript 7 is the native Go port of the compiler (~10x faster type checking). The
catch: **it no longer ships the JavaScript compiler API** (`lib/typescript.js` is gone;
the package's main export is just a version stub). Anything that does
`import ts from "typescript"` breaks — that is the root of every problem below.

## Read first

- [eslint-typescript-7-conflict.md](./eslint-typescript-7-conflict.md) — if the project
  uses typescript-eslint (directly or via eslint-config-next) and you cannot change the
  lint stack, **stop at TypeScript 6.0.x** until upstream ships support.

## Prerequisites

- **Next.js projects: Next ≥ 16.3.0.** Next 16.3 type-checks by shelling out to the
  project-local `tsc` CLI; older versions load TypeScript as a JS module and fail with a
  misleading *"It looks like you're trying to use TypeScript but do not have the required
  package(s) installed"* even though `tsc --version` works.
- **Non-framework projects (e.g. Playwright suites):** no framework gate. The only
  blockers are tools that import the compiler API — typescript-eslint, ts-node, custom
  AST transformers.
- **tsconfig:** TS 7 turns TS 6 deprecations into hard errors. Grep for the offenders:
  `target: es5`, `baseUrl`, `moduleResolution: node10/classic`, legacy `module` values.
  Modern configs (`moduleResolution: bundler`, `paths` without `baseUrl`) need no changes.

## Steps (Next.js project)

```bash
pnpm add --save-exact next@latest            # ≥16.3, keep eslint-config-next in lockstep
pnpm add -D --save-exact eslint-config-next@latest
pnpm add -D typescript@7
pnpm typecheck && pnpm build && pnpm dev     # verify ALL THREE
```

A passing build confirms the native path: look for a fast `Finished TypeScript in ~350ms`
line in `next build` output.

## The alias trap (do not do this)

The TS 7 release notes suggest running TS 6 side-by-side via aliases so tools that need
the JS API keep working:

```json
"typescript": "npm:@typescript/typescript6@^6.0.2",
"@typescript/native": "npm:typescript@^7.0.2"
```

**This breaks Next.js.** Both `next build` and `next dev` detect TypeScript by resolving
the `typescript` package, and the aliased package's real name is
`@typescript/typescript6`, so detection fails ("required package(s) are not installed",
plus a dev-server crash and a spurious auto-install attempt). We hit both. Keep
`typescript` a plain install of 7.x.

## Known limitations of 7.0

- No JS compiler API (7.1 is expected to add a new API; typescript-eslint tracks it).
- `tsc --watch` not yet supported (coming in 7.1) — dev-time watch workflows may care.
- Editor language service still maturing; TS-plugin-based features (like Next's
  `"plugins": [{ "name": "next" }]`) can degrade.

## Also affected

- `@types/node`: match the Node **runtime** major (we deliberately used `@types/node@22`
  on Node 22 instead of latest 26), so types don't describe APIs that don't exist.
