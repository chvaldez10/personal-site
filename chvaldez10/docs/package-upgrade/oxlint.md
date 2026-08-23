# Oxlint (Optional)

**This step is optional and project-specific.** Only do it in repos that own their lint
setup. Company-owned repos with a mandated ESLint stack (e.g. the Playwright project on
`@typescript-eslint/*`) should skip this and stay on TypeScript 6 instead — see
[eslint-typescript-7-conflict.md](./eslint-typescript-7-conflict.md).

## Why we did it here

After the TS 7 upgrade, `eslint .` couldn't even load (typescript-eslint has no TS 7
support). Oxlint is a Rust linter that **parses TypeScript itself and never touches the
TypeScript compiler**, so the TS version is irrelevant to it. Adopting it took lint from
"crashes on startup" to "runs in ~2s" — and it immediately found six real accessibility
bugs that had been invisible while lint was down.

Why Oxlint over Biome for this project:

- Oxlint ports the `@next/eslint-plugin-next` rules (`--nextjs-plugin`); Biome's
  Next-specific coverage is thinner.
- Biome is also a formatter and wants to own formatting — a repo-wide mechanical diff we
  didn't want. Oxlint is lint-only.
- Oxlint coexists with ESLint, so the exit path back is trivial.

## What you give up

No type-aware rules (`no-floating-promises`, etc.) — those need the type checker, which
is exactly what's unavailable on TS 7. This is a temporary regression until
typescript-eslint supports TS 7.

## Setup

```bash
pnpm add -D oxlint
pnpm exec oxlint --init
```

Then edit `.oxlintrc.json` — enable the plugins that match the project:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "unicorn", "oxc", "react", "nextjs", "jsx-a11y"],
  "categories": { "correctness": "error" },
  "ignorePatterns": [".next", "next-env.d.ts"]
}
```

Point the script at it: `"lint": "oxlint"`. Non-zero exit on findings, so it works in
hooks/CI as-is.

## Keep the ESLint config around

We left `eslint.config.mjs`, `eslint`, and `eslint-config-next` in place, inert, with a
header comment explaining why. When typescript-eslint gains TS 7 support, `eslint .`
becomes usable again and recovers the type-aware rules — run both linters or retire one
then. Oxlint honors `eslint-disable` comments, which eases moving between them.
