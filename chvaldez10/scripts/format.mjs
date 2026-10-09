import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import * as prettier from "prettier";
import { appRoot } from "./environment.mjs";

const root = fileURLToPath(appRoot);
const write = process.argv.includes("--write");
const files = JSON.parse(
  await readFile(join(root, ".format-files.json"), "utf8"),
);
let failed = false;
for (const file of files) {
  const filepath = join(root, file);
  const source = await readFile(filepath, "utf8");
  const config = await prettier.resolveConfig(filepath);
  const formatted = await prettier.format(source, { ...config, filepath });
  if (formatted !== source) {
    if (write) await writeFile(filepath, formatted);
    else {
      console.error("Formatting needed: " + file);
      failed = true;
    }
  }
}
console.log(
  write
    ? "Formatted the maintained file baseline."
    : "Checked the maintained file baseline.",
);
process.exitCode = failed ? 1 : 0;
