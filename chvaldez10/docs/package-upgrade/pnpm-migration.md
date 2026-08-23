# npm → pnpm 11 Migration

What we did for this project and what to repeat elsewhere.

## Steps

1. Delete `package-lock.json`, run `pnpm install` to generate `pnpm-lock.yaml`.
2. Pin the package manager in `package.json` (exact version — corepack requires it):

   ```json
   "packageManager": "pnpm@11.20.0",
   "engines": { "node": ">=20", "pnpm": ">=11" }
   ```

   `engines.pnpm` is a tripwire: if some environment resolves the wrong pnpm major, the
   install fails loudly with `ERR_PNPM_UNSUPPORTED_ENGINE` instead of half-working.
3. Move pnpm settings into `pnpm-workspace.yaml`. **pnpm 11 no longer reads the `pnpm`
   field in `package.json`** (it warns and ignores it), and npm's top-level `overrides`
   is npm-only:

   ```yaml
   # replaces onlyBuiltDependencies from pnpm ≤10
   allowBuilds:
     sharp: true
     unrs-resolver: true

   # replaces package.json "overrides"
   overrides:
     "@types/react": 19.2.18
   ```

4. Expect `ERR_PNPM_IGNORED_BUILDS` on first install. pnpm blocks dependency build
   scripts by default; approve the ones you trust in `allowBuilds` (above). In this
   project: `sharp` (native image lib used by Next) and `unrs-resolver` (pulled in by
   eslint-config-next).
5. Delete any `vercel.json` `installCommand` override that forces npm, and remove stale
   npm workarounds (`--legacy-peer-deps` etc.). pnpm auto-installs peers by default.
6. Update README setup instructions.

## Vercel

Vercel's built-in support stops at **pnpm 10**, and it picks the version from
`lockfileVersion` in `pnpm-lock.yaml`. pnpm 11 writes `9.0` — same as pnpm 9 — so old
projects get pnpm 9, which cannot parse the new `pnpm-workspace.yaml` and dies with
`ERROR packages field missing or empty`.

Fix: project Settings → Environment Variables →

```
ENABLE_EXPERIMENTAL_COREPACK=1
```

for **all environments you deploy** (preview builds don't see a production-only var).
With corepack on, Vercel honors the `packageManager` field instead of guessing.
Success looks like this in the build log:

```
Detected ENABLE_EXPERIMENTAL_COREPACK=1 and "pnpm@11.20.0" in package.json
```

If you instead see `Using pnpm@9.x based on project creation date`, the variable isn't
reaching that environment.

## Verification

```bash
rm -rf node_modules
pnpm install                    # no ERR_PNPM_IGNORED_BUILDS
pnpm install --frozen-lockfile  # what CI/Vercel runs; must pass
pnpm typecheck && pnpm build
```

## Habits

- `pnpm dlx` replaces `npx`.
- Commit `pnpm-lock.yaml` and `pnpm-workspace.yaml`.
