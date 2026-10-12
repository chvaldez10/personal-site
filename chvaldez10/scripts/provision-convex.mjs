import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { appRoot, loadLocalEnvironment } from "./environment.mjs";
import { serializeSettings } from "./convex-settings.mjs";

loadLocalEnvironment();
const root = fileURLToPath(appRoot);
const deployment = process.env.CONVEX_DEPLOYMENT;
if (deployment !== "dev:fearless-llama-873" || process.env.CONVEX_DEPLOY_KEY)
  throw new Error(
    "Expected the confirmed development deployment without a deploy-key override.",
  );
const cli = fileURLToPath(
  new URL("../node_modules/convex/bin/main.js", import.meta.url),
);
async function convex(args) {
  const result = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [cli, ...args, "--deployment", "fearless-llama-873"],
      { cwd: root, env: process.env },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (value) => {
      stdout += value;
    });
    child.stderr.on("data", (value) => {
      stderr += value;
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve({ code, stdout, stderr }));
  });
  if (result.code !== 0)
    throw new Error(
      "Convex configuration command failed; no secret values were displayed.",
    );
  return result.stdout;
}
const existing = new Map(
  (await convex(["env", "list"])).split(/\r?\n/).map((line) => {
    const index = line.indexOf("=");
    return index < 0
      ? [line, ""]
      : [line.slice(0, index).trim(), line.slice(index + 1)];
  }),
);
const ownerEmail = process.argv[2];
if (!ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail))
  throw new Error("Provide the owner's email as the first argument.");
const settings = {
  OWNER_EMAIL: ownerEmail.trim().toLowerCase(),
  OWNER_SETUP_KEY:
    existing.get("OWNER_SETUP_KEY") || randomBytes(32).toString("hex"),
  CLOUDFLARE_ACCOUNT_ID: "d2b5ccbc65c28bfb6903e63b3141f6af",
  CLOUDFLARE_IMAGES_ACCOUNT_HASH: "EVfpTCcTyYozHMUDHi2cUQ",
  CLOUDFLARE_IMAGES_VARIANT: "public",
  SITE_URL: "http://localhost:3000",
};
if (!existing.get("JWT_PRIVATE_KEY") || !existing.get("JWKS")) {
  const keys = await generateKeyPair("RS256", { extractable: true });
  settings.JWT_PRIVATE_KEY = (await exportPKCS8(keys.privateKey))
    .trimEnd()
    .replace(/\n/g, " ");
  settings.JWKS = JSON.stringify({
    keys: [{ use: "sig", ...(await exportJWK(keys.publicKey)) }],
  });
}
await mkdir(new URL("../migration-private/", import.meta.url), {
  recursive: true,
});
const privateFile = fileURLToPath(
  new URL("../migration-private/convex-auth-settings.env", import.meta.url),
);
await writeFile(privateFile, serializeSettings(settings), { mode: 0o600 });
await convex(["env", "set", "--from-file", privateFile]);
await writeFile(
  new URL("../migration-private/owner-setup.txt", import.meta.url),
  "Owner setup key (not your password):\n" + settings.OWNER_SETUP_KEY + "\n",
  { mode: 0o600 },
);
console.log(
  "Development auth and image settings configured. Owner setup key saved in ignored migration-private/owner-setup.txt. No secret values were displayed.",
);
