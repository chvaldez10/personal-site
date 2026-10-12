import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEnv } from "node:util";
import { serializeSettings } from "../scripts/convex-settings.mjs";

test("auth public keys remain valid JSON after dotenv parsing", () => {
  const settings = {
    JWKS: JSON.stringify({
      keys: [{ use: "sig", kty: "RSA", n: "test", e: "AQAB" }],
    }),
    JWT_PRIVATE_KEY:
      "-----BEGIN PRIVATE KEY----- test -----END PRIVATE KEY-----",
    SITE_URL: "http://localhost:3000",
  };
  const parsed = parseEnv(serializeSettings(settings));
  assert.deepEqual(JSON.parse(parsed.JWKS), JSON.parse(settings.JWKS));
  assert.equal(parsed.JWT_PRIVATE_KEY, settings.JWT_PRIVATE_KEY);
  assert.equal(parsed.SITE_URL, settings.SITE_URL);
});
