# Git Hooks (Optional)

Pre-commit checks with no dependencies: a tracked `.githooks/` directory at the repo
root plus one local config command.

## Layout

- `.githooks/pre-commit` — on `main`: `pnpm lint` + `pnpm typecheck` (full suite, since
  commits on main deploy straight to production). On any other branch: `pnpm lint` only,
  to keep the loop fast. `set -e` aborts the commit on any failure.
- `.githooks/pre-merge-commit` — delegates to `pre-commit`. Needed because `git merge`
  does **not** fire `pre-commit`; merge commits fire this hook instead.

## Activation (once per clone/machine)

```bash
git config core.hooksPath .githooks
git config core.hooksPath   # verify: prints .githooks
```

Git config is local and never pushed, so every clone runs this once. That's the tradeoff
versus Husky, which automates activation via a `prepare` script at the cost of a
dependency. If a project gets more contributors, switch to Husky.

## Caveats

- **Fast-forward merges run no hook at all** (no commit is created). Use
  `git merge --no-ff` into `main` when you want the full suite to gate the merge.
- `git commit --no-verify` bypasses hooks — that's a feature, but know it exists.
- Hooks run from the repo root; the scripts `cd` into the app directory
  (`chvaldez10/`) before running pnpm. Adjust that path per project.
