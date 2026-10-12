import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { appRoot, loadLocalEnvironment } from "./environment.mjs";

loadLocalEnvironment();
if (process.env.CONVEX_DEPLOY_KEY)
  throw new Error(
    "Audit with your logged-in account, not a deploy-key override.",
  );
const root = fileURLToPath(appRoot);
const child = spawn(
  process.execPath,
  [
    "node_modules/convex/bin/main.js",
    "mcp",
    "start",
    "--project-dir",
    root,
    "--cautiously-allow-production-pii",
    "--disable-tools",
    "data,envGet,envList,envRemove,envSet,run,runOneoffQuery",
  ],
  { cwd: root, env: process.env },
);
child.stderr.resume();
let buffer = "";
let nextId = 0;
const requests = new Map();
child.stdout.on("data", (chunk) => {
  buffer += chunk;
  while (buffer.includes("\n")) {
    const end = buffer.indexOf("\n");
    const line = buffer.slice(0, end);
    buffer = buffer.slice(end + 1);
    try {
      const reply = JSON.parse(line);
      const pending = requests.get(reply.id);
      if (!pending) continue;
      requests.delete(reply.id);
      clearTimeout(pending.timer);
      if (reply.error)
        pending.reject(new Error("Audit protocol request failed."));
      else pending.resolve(reply.result);
    } catch {
      /* Ignore non-protocol startup lines. */
    }
  }
});
function request(method, params) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      requests.delete(id);
      reject(new Error("Audit request timed out."));
    }, 30000);
    requests.set(id, { resolve, reject, timer });
    child.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n",
    );
  });
}
async function call(name, args) {
  const result = await request("tools/call", { name, arguments: args });
  if (result.isError) throw new Error("Read-only audit tool failed: " + name);
  return (
    result.structuredContent ??
    JSON.parse(result.content.find((block) => block.type === "text").text)
  );
}
try {
  await request("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "site-readiness", version: "1.0" },
  });
  child.stdin.write(
    JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) +
      "\n",
  );
  const { availableDeployments } = await call("status", { projectDir: root });
  const report = [];
  for (const deployment of availableDeployments) {
    const entry = {
      kind: deployment.kind,
      url: deployment.url,
      dashboardUrl: deployment.dashboardUrl,
      passes: {},
    };
    console.log("Read-only target: " + deployment.kind + " " + deployment.url);
    for (const name of ["tables", "functionSpec", "insights", "logs"]) {
      try {
        const result = await call(name, {
          deploymentSelector: deployment.deploymentSelector,
          ...(name === "logs"
            ? { entriesLimit: 100, tokensLimit: 15000, jsonl: true }
            : {}),
        });
        if (name === "tables") entry.passes.tables = Object.keys(result.tables);
        else if (name === "functionSpec") entry.passes.functions = result;
        else if (name === "insights") entry.passes.insights = result;
        else {
          const executions = result.entries
            .split(/\r?\n/)
            .filter(Boolean)
            .map((line) => JSON.parse(line));
          entry.passes.logs = {
            inspected: executions.length,
            failures: executions
              .filter((event) => event.error)
              .map((event) => ({
                function: event.identifier,
                timestamp: event.timestamp,
                error: String(event.error).split("\n")[0],
              })),
          };
        }
      } catch {
        entry.passes[name] = {
          skipped: "Read-only tool unavailable or no deployment data.",
        };
      }
    }
    report.push(entry);
    console.log(
      JSON.stringify({
        kind: entry.kind,
        tables: entry.passes.tables,
        logs: entry.passes.logs,
        insights: entry.passes.insights,
      }),
    );
  }
  await mkdir(new URL("../migration-private/readiness/", import.meta.url), {
    recursive: true,
  });
  await writeFile(
    new URL("../migration-private/readiness/live-audit.json", import.meta.url),
    JSON.stringify(report, null, 2) + "\n",
  );
} finally {
  for (const pending of requests.values()) {
    clearTimeout(pending.timer);
    pending.reject(new Error("Audit closed."));
  }
  child.kill();
}
