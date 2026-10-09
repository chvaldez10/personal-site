import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { appRoot } from "./environment.mjs";

const require = createRequire(import.meta.url);
const env = {
  ...process.env,
  SITE_DEMO_MODE: "true",
  NEXT_TELEMETRY_DISABLED: "1",
};
async function run(args) {
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: fileURLToPath(appRoot),
      env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
  if (code !== 0) process.exit(code);
}
await run(["scripts/seed-demo.mjs"]);
await run([require.resolve("next/dist/bin/next"), "build"]);
await run([require.resolve("@playwright/test/cli"), "test"]);
