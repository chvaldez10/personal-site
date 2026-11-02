# Christian Valdez's personal site

Next.js 16, React 19, TypeScript 7, Tailwind 4, Convex, and Convex Auth. Cloudflare Images hosts logos. This README covers local setup and site features; the architecture guide covers reusable implementation patterns.

**Architecture and reuse:** See [the architecture guide](docs/architecture.md) for a new-project setup recipe, package roles (including `cn` and Zod), data fetching, forms, authentication, and UI/UX conventions.

## Setup

Use Node 24 and the pnpm version in package.json. On Windows or macOS, open Warp or your usual terminal in the app folder:

```sh
cd chvaldez10
corepack enable
pnpm install --frozen-lockfile
```

Skip cd if already in the app folder. Copy .env.example to .env.local using your editor; keep an existing .env.local. Convex setup fills in CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL.

```sh
pnpm run doctor
pnpm dev
```

Open http://localhost:3000. One runner starts Next and the Convex development watcher. dev:web and dev:backend also work separately. Starting the backend watcher updates the selected cloud development deployment; routine checks do not.

Cloudflare's API token and auth secrets belong in the Convex deployment settings. Never put them in NEXT_PUBLIC_ variables.

For owner account setup, follow [the short Convex guide](docs/convex-migration/README.md).

## Commands

| Command          | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| pnpm run doctor  | Check versions and configuration without displaying secrets |
| pnpm dev         | Start Next and Convex development together                  |
| pnpm dev:web     | Start Next only                                             |
| pnpm dev:backend | Start the Convex development watcher only                   |
| pnpm check       | Typecheck, lint, formatting, and unit/backend tests         |
| pnpm format      | Format the maintained files in .format-files.json           |
| pnpm test        | Run Node validation tests and Convex backend tests          |
| pnpm build       | Build using the selected environment                        |
| pnpm test:e2e    | Build real pages against a test-only local backend          |

Before the first browser test:

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

Browser tests start a temporary HTTP backend stub and exercise the real pages, including login errors and private-route protection. Fixtures are used only by tests; the app always uses its configured Convex deployment. CI never deploys. After browser tests, run pnpm build before pnpm start so the build uses your real Convex URL. Live owner login, signout, and direct Cloudflare upload still need acceptance with your privately chosen password.

## Media

The dashboard uploads images directly to Cloudflare using a short-lived upload URL issued after owner authorization. The API token stays on the backend. Convex confirms the upload before saving the logo record.

Résumé links use /api/resume, which serves the PDF from Convex and falls back to /docs/resume.pdf if it is unavailable. Keep public/docs/resume.pdf current. Logo failures show an icon while keeping their text and details usable.

## AI shadowboxing

The manual builder at `/hobbies/mma` remains public. Workout generation appears only for the signed-in owner. Add `GEMINI_API_KEY` to `.env.local` and restart Next; set the same server-only variable in Vercel if you want generation on the hosted site. Never use a `NEXT_PUBLIC_` key. The model selector lists only configured Gemini models that the key reports as available. Gemini 3.5 Flash-Lite is the default, with Gemini 3.1 Flash-Lite as another free-tier option. The API route validates requests and generated workouts with Zod, and each regeneration makes another API call. Google sets the actual quota for your project; check [AI Studio rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) if you receive a limit message.

Owner-only coaching audio offers Gemini (with the same server-only key) and Kokoro 82M, which generates speech in your browser without an API key. Choose the current edited workout or the last AI-generated workout, select a model and voice, and preview it before preparing audio. Kokoro loads only when used; its quantized model is about 92 MB on first download and needs enough device memory. Model files and generated clips are cached in that browser. The player combines round introductions, shared technique prompts, and silence into one track before Start; it supports pause, resume, restart, and stop. Prepare up to 12 rounds and 45 minutes. A fresh three-round Gemini workout needs up to five voice requests; previewing adds one. Long pauses inside spoken clips are shortened locally, including previously cached clips; use Prepare again to rebuild the track. Start the track before locking a phone; verify Kokoro generation, background playback, and headset controls on your actual device. The model and voice catalogs are in `src/lib/workouts/audio/models.server.ts` and `src/lib/workouts/audio/kokoro.ts`; Gemini provider code is in `src/lib/workouts/audio/providers/`. The [Gemini TTS guide](https://ai.google.dev/gemini-api/docs/speech-generation) describes Gemini models and voices; the [Kokoro model card](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) describes its local model and voices.

The builder starts with one 3-minute skill round. Signed-in owners can name and save a shadowboxing session, then reopen it from the builder or `/dashboard/workouts` to edit and practice. Named plans contain only settings and round text in the existing Convex deployment. New unsaved drafts are kept in this browser; generated audio remains in its browser cache. The dashboard also lets the owner delete old plans.

Dashboard lists load in pages, and saved-session pickers fetch full plans only when opened. Owner-only AI and image requests share server-enforced hourly/daily budgets; the [architecture guide](docs/architecture.md#expensive-requests-and-background-work) lists the limits and multi-user adaptation. Publish the backend functions and indexes before deploying these frontend changes to the existing shared deployment.

For a phone check, prepare two one-minute rounds, tap Start, then lock the screen. Listen through the round change and use headphone pause/resume. Unlock and confirm the round and remaining time match the audio. Repeat in iPhone Safari or Android Chrome on the device you will train with.

See the [Convex setup and preview guide](docs/convex-migration/README.md) for the existing deployment workflow.

## Architecture at a glance

The architecture overview and implementation patterns now live in [docs/architecture.md](docs/architecture.md), including instructions for reproducing the stack in another project.
