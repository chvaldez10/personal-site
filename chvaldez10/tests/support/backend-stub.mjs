import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

// This server exercises real app routes with deterministic responses. It is
// never imported by application code and cannot create cloud data.
export async function startBackendStub() {
  const fixtures = JSON.parse(
    await readFile(
      new URL("../../fixtures/brand-logos.json", import.meta.url),
      "utf8",
    ),
  );
  const logos = fixtures.map((row) => ({
    ...row,
    id: String(row.id),
    legacyId: row.id,
    description: "Fixture content for browser tests.",
  }));
  const failedQueries = new Set();
  const server = createServer(async (request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "no-store");
    try {
      let text = "";
      for await (const chunk of request) text += chunk;
      const { path, fail } = JSON.parse(text);
      if (request.url === "/__tests/query-failure") {
        if (fail) failedQueries.add(path);
        else failedQueries.delete(path);
        response.end(JSON.stringify({ status: "success" }));
        return;
      }
      const results = {
        "brandLogos:list": logos,
        "admin:setupAvailable": false,
        "admin:current": null,
        "auth:isAuthenticated": false,
        "siteAssets:resume": null,
      };
      if (
        request.url === "/api/query" &&
        Object.hasOwn(results, path) &&
        !failedQueries.has(path)
      ) {
        response.end(
          JSON.stringify({
            status: "success",
            value: results[path],
            logLines: [],
          }),
        );
      } else {
        response.end(
          JSON.stringify({
            status: "error",
            errorMessage: "Invalid credentials.",
            logLines: [],
          }),
        );
      }
    } catch {
      response.statusCode = 400;
      response.end(
        JSON.stringify({
          status: "error",
          errorMessage: "Invalid test request.",
          logLines: [],
        }),
      );
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Test backend failed to start.");
  return {
    url: "http://127.0.0.1:" + address.port,
    close: () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  };
}
