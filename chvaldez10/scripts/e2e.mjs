import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { appRoot } from "./environment.mjs";
import { startBackendStub } from "../tests/support/backend-stub.mjs";

const require = createRequire(import.meta.url);
const backend = await startBackendStub();
const env = {
  ...process.env,
  NEXT_PUBLIC_CONVEX_URL: backend.url,
  E2E_BACKEND_URL: backend.url,
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
  if (code !== 0)
    throw new Error("Browser check command failed with exit code " + code);
}
try {
  await run([require.resolve("next/dist/bin/next"), "build"]);
  await run([require.resolve("@playwright/test/cli"), "test"]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await backend.close();
}
