import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { appRoot } from "./environment.mjs";
import { brandLogosSchema } from "../src/lib/validation/brandLogos.ts";

if (process.env.NODE_ENV === "production" || process.argv.length > 2) {
  console.error(
    "Demo seed only writes local development fixtures. Production targets are unsupported.",
  );
  process.exit(1);
}
const root = fileURLToPath(appRoot);
const rows = brandLogosSchema.parse(
  JSON.parse(await readFile(join(root, "fixtures/brand-logos.json"), "utf8")),
);
await mkdir(join(root, ".demo"), { recursive: true });
await writeFile(
  join(root, ".demo/brand-logos.json"),
  JSON.stringify(rows, null, 2) + "\n",
);
console.log(
  "Wrote " +
    rows.length +
    " local demo logos. Set SITE_DEMO_MODE=true to use them. No cloud writes were made.",
);
