import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import concurrently from "concurrently";
import { appRoot, loadLocalEnvironment } from "./environment.mjs";

loadLocalEnvironment();
const root = fileURLToPath(appRoot);
const commands = [{ command: "pnpm dev:web", name: "next" }];
if (existsSync(join(root, "convex/schema.ts"))) {
  if (!process.env.CONVEX_DEPLOYMENT || !process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error(
      "Convex code is present but configuration is missing. Run pnpm run doctor.",
    );
    process.exit(1);
  }
  commands.push({ command: "pnpm dev:backend", name: "convex" });
} else {
  console.log(
    "Starting Next.js. Convex watcher will be enabled when convex/schema.ts is configured.",
  );
}
try {
  await concurrently(commands, {
    cwd: root,
    killOthersOn: ["success", "failure"],
  }).result;
} catch {
  process.exitCode = 1;
}
