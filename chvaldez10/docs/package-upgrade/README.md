# Upgrade Playbook

Process docs from migrating this project (npm → pnpm, TypeScript 5 → 7), written to be
reused on other projects. Each doc covers one idea:

| Doc | What it covers | Required? |
| --- | --- | --- |
| [pnpm-migration.md](./pnpm-migration.md) | npm → pnpm 11, Vercel setup | yes |
| [typescript-7-upgrade.md](./typescript-7-upgrade.md) | TS 5/6 → 7 (native compiler) | yes |
| [eslint-typescript-7-conflict.md](./eslint-typescript-7-conflict.md) | Why ESLint breaks on TS 7, options | read before TS 7 |
| [oxlint.md](./oxlint.md) | Swapping ESLint for Oxlint | **optional** |
| [git-hooks.md](./git-hooks.md) | Pre-commit lint/typecheck hooks | optional |

## Recommended order

1. **pnpm migration first.** It's independent of everything else and gives you a clean
   lockfile baseline. Verify with `pnpm install --frozen-lockfile`, `typecheck`, `build`.
2. **Decide on linting before touching TypeScript.** TS 7 breaks typescript-eslint
   (see the conflict doc). If the project's lint stack can't change — e.g. a company-owned
   repo — stop at TypeScript 6 and wait for upstream.
3. **TypeScript 7** (needs Next.js ≥ 16.3 for Next projects; Playwright/Node projects have
   no framework gate, only the lint one).
4. **Oxlint** only if the project owns its lint config and wants lint working on TS 7 today.
5. **Git hooks** last, once `lint` and `typecheck` scripts are stable.

## Verify at every step

```bash
pnpm install --frozen-lockfile   # lockfile consistent with package.json
pnpm typecheck                   # tsc --noEmit
pnpm lint
pnpm build
pnpm dev                         # build passing does NOT guarantee dev works; check both
```

The `dev` check is not paranoia: during this migration we hit a state where `build`
passed and `dev` crashed (see the alias trap in the TS 7 doc).
