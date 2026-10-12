import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { appRoot, loadLocalEnvironment } from "./environment.mjs";
loadLocalEnvironment();
const root = fileURLToPath(appRoot);
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
let failed = false;
function check(label, ready, help) {
  console.log(
    (ready ? "OK: " : "MISSING: ") + label + (ready ? "" : ". " + help),
  );
  if (!ready) failed = true;
}
check(
  "Node 24",
  Number(process.versions.node.split(".")[0]) === 24,
  "Use .node-version.",
);
const pnpm = spawnSync("pnpm --version", { encoding: "utf8", shell: true });
check(
  "Pinned pnpm",
  pnpm.status === 0 && pnpm.stdout.trim() === pkg.packageManager.split("@")[1],
  "Run corepack enable and pnpm install.",
);
check(
  "Installed dependencies",
  existsSync(join(root, "node_modules/next")),
  "Run pnpm install.",
);
for (const name of ["CONVEX_DEPLOYMENT", "NEXT_PUBLIC_CONVEX_URL"])
  check(name, Boolean(process.env[name]), "Finish Convex development setup.");
check(
  "Generated Convex API",
  existsSync(join(root, "convex/_generated/api.d.ts")),
  "Run Convex code generation.",
);
console.log(
  "Cloudflare credentials are stored on Convex, not checked or displayed here.",
);
process.exitCode = failed ? 1 : 0;
