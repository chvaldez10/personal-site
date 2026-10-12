import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { appRoot, loadLocalEnvironment } from "./environment.mjs";
import { serializeSettings } from "./convex-settings.mjs";

loadLocalEnvironment();
if (
  process.env.CONVEX_DEPLOYMENT !== "dev:fearless-llama-873" ||
  process.env.CONVEX_DEPLOY_KEY
)
  throw new Error(
    "Expected the reviewed development source without a deploy-key override.",
  );
const destination = new URL(
  "../migration-private/readiness/production-auth-settings.env",
  import.meta.url,
);
if (existsSync(destination))
  throw new Error(
    "Production settings are already prepared; keep the existing keys.",
  );
const settings = {
  SITE_URL: "https://chvaldez10.vercel.app",
  OWNER_SETUP_KEY: randomBytes(32).toString("hex"),
};
for (const name of [
  "OWNER_EMAIL",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_IMAGES_ACCOUNT_HASH",
  "CLOUDFLARE_IMAGES_VARIANT",
  "CLOUDFLARE_IMAGES_API_TOKEN",
]) {
  const value = execFileSync(
    process.execPath,
    [
      "node_modules/convex/bin/main.js",
      "env",
      "get",
      name,
      "--deployment",
      "fearless-llama-873",
    ],
    { cwd: appRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
  if (!value)
    throw new Error("Development is missing a required setting: " + name);
  settings[name] = value;
}
const keys = await generateKeyPair("RS256", { extractable: true });
settings.JWT_PRIVATE_KEY = (await exportPKCS8(keys.privateKey))
  .trimEnd()
  .replace(/\n/g, " ");
settings.JWKS = JSON.stringify({
  keys: [{ use: "sig", ...(await exportJWK(keys.publicKey)) }],
});
await writeFile(destination, serializeSettings(settings), { mode: 0o600 });
console.log(
  "Production settings prepared locally for animated-roadrunner-856. Nothing was uploaded or changed on production.",
);
