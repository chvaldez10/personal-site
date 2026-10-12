import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { appRoot, loadLocalEnvironment } from "./environment.mjs";
import { brandLogosSchema } from "../src/lib/validation/brandLogos.ts";

loadLocalEnvironment();
if (
  process.env.CONVEX_DEPLOYMENT !== "dev:fearless-llama-873" ||
  process.env.CONVEX_DEPLOY_KEY
)
  throw new Error(
    "This script only targets the confirmed development deployment.",
  );
const root = fileURLToPath(appRoot);
const cli = fileURLToPath(
  new URL("../node_modules/convex/bin/main.js", import.meta.url),
);
async function run(name, args = {}) {
  const result = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        cli,
        "run",
        name,
        JSON.stringify(args),
        "--deployment",
        "fearless-llama-873",
      ],
      { cwd: root, env: process.env },
    );
    let output = "";
    let error = "";
    child.stdout.on("data", (value) => {
      output += value;
    });
    child.stderr.on("data", (value) => {
      error += value;
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve({ code, output, error }));
  });
  if (result.code !== 0)
    throw new Error(
      "Migration step failed: " +
        name +
        ". No credential values were displayed.",
    );
  return JSON.parse(result.output);
}
const nullable = (value) =>
  value === "" || value === undefined ? null : value;
function boolean(value, allowNull = false) {
  if (value === "true" || value === "t") return true;
  if (value === "false" || value === "f") return false;
  if (allowNull && (value === "" || value === undefined)) return null;
  throw new Error("Invalid boolean in exported data.");
}
const readCSV = async (filename) =>
  parse(
    await readFile(
      new URL("../migration-private/" + filename, import.meta.url),
      "utf8",
    ),
    { columns: true, bom: true, skip_empty_lines: true },
  );
const raw = await readCSV("brand_logos_rows.csv");
const logos = brandLogosSchema.parse(
  raw.map((row) => ({
    id: Number(row.id),
    alt: row.alt,
    description: row.description,
    src: row.src,
    active: boolean(row.active, true),
    label: nullable(row.label),
    referral_link: nullable(row.referral_link),
    created: nullable(row.created),
    updated: nullable(row.updated),
  })),
);
if (new Set(logos.map((row) => row.id)).size !== logos.length)
  throw new Error("Duplicate logo IDs.");
const flags = (await readCSV("waffle_switch_rows.csv")).map((row) => ({
  name: row.name,
  enabled: boolean(row.is_active),
}));
if (new Set(flags.map((row) => row.name)).size !== flags.length)
  throw new Error("Duplicate flag names.");
const result = await run("migrations:importData", {
  logos,
  flags,
  resumeStorageId: "kg231mahwy354cfh4380k8x7ks8g41r4",
});
console.log(
  "Copied metadata: " +
    result.logos +
    " logos and " +
    result.flags +
    " settings.",
);
const images = [];
for (const logo of logos) {
  const image = await run("images:migrateLegacyImage", { legacyId: logo.id });
  images.push(image);
  console.log("Logo " + logo.id + ": " + image.status);
}
const status = await run("migrations:status");
const resumeURL = await run("siteAssets:resume");
await writeFile(
  new URL("../migration-private/convex-migration-report.json", import.meta.url),
  JSON.stringify(
    { ...status, resumeAvailable: Boolean(resumeURL), images },
    null,
    2,
  ) + "\n",
);
if (
  status.logos !== logos.length ||
  status.flags !== flags.length ||
  status.migratedImages !== logos.length
)
  throw new Error("Counts do not match the source export.");
console.log(
  "Counts verified. Convex resume available: " +
    Boolean(resumeURL) +
    ". Report saved in migration-private.",
);
