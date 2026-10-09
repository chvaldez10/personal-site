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
  "Use the version in .node-version.",
);
const pnpm = spawnSync("pnpm --version", {
  encoding: "utf8",
  shell: true,
});
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
if (process.env.SITE_DEMO_MODE === "true") {
  console.log("Demo mode: authentication is disabled; no cloud data is read.");
  check(
    "Demo fixtures",
    existsSync(join(root, ".demo/brand-logos.json")),
    "Run pnpm seed:dev.",
  );
} else {
  for (const name of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]) {
    check(
      name,
      Boolean(process.env[name]),
      "Set this variable in .env.local or choose demo mode.",
    );
  }
}
if (existsSync(join(root, "convex/schema.ts"))) {
  for (const name of ["CONVEX_DEPLOYMENT", "NEXT_PUBLIC_CONVEX_URL"]) {
    check(name, Boolean(process.env[name]), "Finish Convex development setup.");
  }
  check(
    "Generated Convex API",
    existsSync(join(root, "convex/_generated/api.d.ts")) ||
      existsSync(join(root, "convex/_generated/api.ts")),
    "Run the configured Convex CLI to generate the API.",
  );
} else {
  console.log(
    "Convex migration: not initialized; current application uses Supabase.",
  );
}
process.exitCode = failed ? 1 : 0;
