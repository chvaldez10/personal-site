import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const appRoot = new URL("../", import.meta.url);

export function loadLocalEnvironment() {
  // loadEnvFile preserves explicitly supplied process variables.
  for (const file of [".env.local", ".env"]) {
    const path = join(fileURLToPath(appRoot), file);
    if (existsSync(path)) process.loadEnvFile(path);
  }
}
